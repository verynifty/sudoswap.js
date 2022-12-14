const { ethers } = require("ethers");

const CURVES = {
  1: {
    "0x5B6aC51d9B1CeDE0068a1B26533CAce807f883Ee": "LINEAR",
    "0x432f962D8209781da23fB37b6B59ee15dE7d9841": "EXPONENTIAL",
    "0x7942e264e21c5e6cbba45fe50785a15d3beb1da0": "XYK",
  },
  4: {
    "0x3764b9FE584719C4570725A2b5A2485d418A186E": "LINEAR",
    "0xBc6760B11e433D25aAf5c8fCBC6cE99b14aC5D52": "EXPONENTIAL",
    "0x626f33fb4bc783049d465198468eee4d6b932f3a": "XYK",
  },
  5: {
    "0xaC6dcFF6E13132f075e36cA3a7F403236f869438": "LINEAR",
    "0x0D807bd5fF2C4eF298755bE30E22926b33244B0c": "EXPONENTIAL",
    "0x02363a2F1B2c2C5815cb6893Aa27861BE0c4F760": "XYK",
  },
};

const PROTOCOL_FEE = ethers.BigNumber.from("5000000000000000");
const PROTOCOL_FEE_DIVIDER = ethers.BigNumber.from("1000000000000000000");
const ETHER = ethers.BigNumber.from("1000000000000000000");

exports.addressToCurveType = function (network, address) {
  return CURVES[network][address];
};

exports.getBuyInfo = function (curve, fee, delta, spotPrice, nbNfts) {
  // make sure we deal with bignumbers
  if (typeof delta == "number") {
    delta += "";
  }
  fee = ethers.BigNumber.from(fee);
  delta = ethers.BigNumber.from(delta);
  spotPrice = ethers.BigNumber.from(spotPrice);
  nbNfts = ethers.BigNumber.from(nbNfts);

  let inputValue;
  let protocolFee;
  let newDelta;
  let newSpotPrice;
  let buySpotPrice;
  let lpFee;

  if (curve.toUpperCase() == "EXPONENTIAL") {
    // https://github.com/sudoswap/lssvm/blob/main/src/bonding-curves/ExponentialCurve.sol

    /*
        uint256 deltaPowN = uint256(delta).fpow(
            numItems,
            FixedPointMathLib.WAD
        );
        */
    let deltaPowN = delta.pow(nbNfts).div(ETHER.pow(nbNfts - 1));
    //console.log(" ===  > deltapow ", ethers.utils.formatEther(deltaPowN))
    /*
          uint256 newSpotPrice_ = uint256(spotPrice).fmul(
            deltaPowN,
            FixedPointMathLib.WAD
        );
        */
    newSpotPrice = spotPrice.mul(deltaPowN).div(ETHER);
    //console.log(" ===  > NEWPSOO ", ethers.utils.formatEther(newSpotPrice))
    /*
        uint256 buySpotPrice = uint256(spotPrice).fmul(
             delta,
             FixedPointMathLib.WAD
         );
         */
    buySpotPrice = spotPrice.mul(delta);
    /*
        inputValue = buySpotPrice.fmul(
             (deltaPowN - FixedPointMathLib.WAD).fdiv(
                 delta - FixedPointMathLib.WAD,
                 FixedPointMathLib.WAD
             ),
             FixedPointMathLib.WAD
         );
        */
    inputValue = buySpotPrice
      .mul(deltaPowN.sub(ETHER).div(delta.sub(ETHER)))
      .div(ETHER);
    /*
        protocolFee = inputValue.fmul(
              protocolFeeMultiplier,
              FixedPointMathLib.WAD
          );
          */
    protocolFee = inputValue.mul(PROTOCOL_FEE).div(PROTOCOL_FEE_DIVIDER);
    // inputValue += inputValue.fmul(feeMultiplier, FixedPointMathLib.WAD);
    lpFee = inputValue.mul(fee).div(ETHER);
    inputValue = inputValue.add(lpFee);
    // inputValue += protocolFee;
    inputValue = inputValue.add(protocolFee);

    newDelta = delta;
  } else if (curve.toUpperCase() == "LINEAR") {
    // https://github.com/sudoswap/lssvm/blob/main/src/bonding-curves/LinearCurve.sol

    // uint256 newSpotPrice_ = spotPrice + delta * numItems;
    newSpotPrice = spotPrice.add(delta.mul(nbNfts));
    // uint256 buySpotPrice = spotPrice + delta;
    buySpotPrice = spotPrice.add(delta);
    /* 
        inputValue =
            numItems *
            buySpotPrice +
            (numItems * (numItems - 1) * delta) /
            2;
        */
    inputValue = nbNfts
      .mul(buySpotPrice)
      .add(nbNfts.mul(nbNfts.sub(1).mul(delta).div(2)));

    /*
        protocolFee = inputValue.fmul(
            protocolFeeMultiplier,
            FixedPointMathLib.WAD
        );
    */
    protocolFee = inputValue.mul(PROTOCOL_FEE).div(PROTOCOL_FEE_DIVIDER);

    // inputValue += inputValue.fmul(feeMultiplier, FixedPointMathLib.WAD);
    lpFee = inputValue.mul(fee).div(ETHER);
    inputValue = inputValue.add(lpFee);

    // inputValue += protocolFee;
    inputValue = inputValue.add(protocolFee);

    newDelta = delta;
  } else if (curve.toUpperCase() == "XYK") {
  }
  return {
    inputValue,
    newDelta,
    lpFee,
    protocolFee,
    newSpotPrice,
  };
};

exports.getSellInfo = function (curve, fee, delta, spotPrice, nbNfts) {
  if (typeof delta == "number") {
    delta += "";
  }
  // make sure we deal with bignumbers
  fee = ethers.BigNumber.from(fee);
  delta = ethers.BigNumber.from(delta);
  spotPrice = ethers.BigNumber.from(spotPrice);
  nbNfts = ethers.BigNumber.from(nbNfts);

  let outputValue;
  let protocolFee;
  let newDelta;
  let newSpotPrice;
  let numItemsTillZeroPrice;
  let lpFee;

  if (curve.toUpperCase() == "EXPONENTIAL") {
    // https://github.com/sudoswap/lssvm/blob/main/src/bonding-curves/ExponentialCurve.sol

    /*
        uint256 invDelta = FixedPointMathLib.WAD.fdiv(
            delta,
            FixedPointMathLib.WAD
        );
        uint256 invDeltaPowN = invDelta.fpow(numItems, FixedPointMathLib.WAD);
        */
    let invDelta = ETHER.mul(ETHER).div(delta);
    let invDeltaPowN = invDelta.pow(nbNfts).div(ETHER.pow(nbNfts - 1));

    /*
          uint256 newSpotPrice_ = uint256(spotPrice).fmul(
            deltaPowN,
            FixedPointMathLib.WAD
        );
        */
    newSpotPrice = spotPrice.mul(invDeltaPowN).div(ETHER);

    /*
        newSpotPrice = uint128(
            uint256(spotPrice).fmul(invDeltaPowN, FixedPointMathLib.WAD)
        );
        */
    newSpotPrice = newSpotPrice.mul(invDeltaPowN).div(ETHER);
    /*
        outputValue = uint256(spotPrice).fmul(
            (FixedPointMathLib.WAD - invDeltaPowN).fdiv(
                FixedPointMathLib.WAD - invDelta,
                FixedPointMathLib.WAD
            ),
            FixedPointMathLib.WAD
        );
        */
    outputValue = spotPrice.mul(
      ETHER.sub(invDeltaPowN).div(ETHER.sub(invDelta))
    );
    /*
         protocolFee = outputValue.fmul(
            protocolFeeMultiplier,
            FixedPointMathLib.WAD
          );
          */
    protocolFee = outputValue.mul(PROTOCOL_FEE).div(PROTOCOL_FEE_DIVIDER);
    // outputValue -= outputValue.fmul(feeMultiplier, FixedPointMathLib.WAD);
    lpFee = outputValue.mul(fee).div(ETHER);
    outputValue = outputValue.sub(lpFee);
    // outputValue -= protocolFee;
    outputValue = outputValue.sub(protocolFee);

    newDelta = delta;
  } else if (curve.toUpperCase() == "LINEAR") {
    // https://github.com/sudoswap/lssvm/blob/main/src/bonding-curves/LinearCurve.sol

    // uint256 totalPriceDecrease = delta * numItems;
    let totalPriceDecrease = delta.mul(nbNfts);

    /*
        if (spotPrice < totalPriceDecrease) {
            // Then we set the new spot price to be 0. (Spot price is never negative)
            newSpotPrice = 0;

            // We calculate how many items we can sell into the linear curve until the spot price reaches 0, rounding up
            uint256 numItemsTillZeroPrice = spotPrice / delta + 1;
            numItems = numItemsTillZeroPrice;
        } else {
            // The new spot price is just the change between spot price and the total price change
            newSpotPrice = spotPrice - uint128(totalPriceDecrease);
        }
        */
    if (totalPriceDecrease.gte(spotPrice)) {
      newSpotPrice = ethers.BigNumber.from(0);
      numItemsTillZeroPrice = spotPrice.div(delta).add(1);
      numItems = numItemsTillZeroPrice;
    } else {
      newSpotPrice = spotPrice.sub(totalPriceDecrease);
    }

    /* 
        outputValue =
            numItems *
            spotPrice -
            (numItems * (numItems - 1) * delta) /
            2;
        */
    outputValue = nbNfts
      .mul(spotPrice)
      .sub(nbNfts.mul(nbNfts.sub(1).mul(delta).div(2)));

    /*
        protocolFee = outputValue.fmul(
            protocolFeeMultiplier,
            FixedPointMathLib.WAD
        );
        */
    protocolFee = outputValue.mul(PROTOCOL_FEE).div(PROTOCOL_FEE_DIVIDER);

    // outputValue -= outputValue.fmul(feeMultiplier, FixedPointMathLib.WAD);
    lpFee = outputValue.mul(fee).div(ETHER);
    outputValue = outputValue.sub(lpFee);

    // outputValue -= protocolFee;
    outputValue = outputValue.sub(protocolFee);

    newDelta = delta;
  } else if (curve.toUpperCase() == "XYK") {
  }

  return {
    outputValue,
    newDelta,
    lpFee,
    protocolFee,
    newSpotPrice,
  };
};
