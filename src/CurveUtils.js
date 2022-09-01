const { ethers } = require("ethers");

const CURVES = {
  1: {
    "0x5B6aC51d9B1CeDE0068a1B26533CAce807f883Ee": "LINEAR",
    "0x432f962D8209781da23fB37b6B59ee15dE7d9841": "EXPONENTIAL",
  },
  4: {
    "0x3764b9FE584719C4570725A2b5A2485d418A186E": "LINEAR",
    "0xBc6760B11e433D25aAf5c8fCBC6cE99b14aC5D52": "EXPONENTIAL",
  },
};

const PROTOCOL_FEE = ethers.BigNumber.from("5000000000000000");
const PROTOCOL_FEE_DIVIDER = ethers.BigNumber.from("1000000000000000000");
const ETHER = ethers.BigNumber.from("1000000000000000000");

function CurveUtils(sudo) {
  this.sudo = sudo;
}

CurveUtils.prototype.addressToCurveType = function (network, address) {
  return CURVES[network][address];
};

CurveUtils.prototype.getBuyInfo = function (
  curve,
  fee,
  delta,
  spotPrice,
  nbNfts
) {
  // make sure we deal with bignumbers
  fee = ethers.BigNumber.from(fee);
  delta = ethers.BigNumber.from(delta);
  spotPrice = ethers.BigNumber.from(spotPrice);
  nbNfts = ethers.BigNumber.from(nbNfts);

  let inputValue;
  let protocolFee;
  let newDelta;

  if (curve == "EXPONENTIAL") {
    // https://github.com/sudoswap/lssvm/blob/main/src/bonding-curves/ExponentialCurve.sol

    /*
        uint256 deltaPowN = uint256(delta).fpow(
            numItems,
            FixedPointMathLib.WAD
        );
        */
    let deltaPowN = delta.pow(nbNfts);
    /*
          uint256 newSpotPrice_ = uint256(spotPrice).fmul(
            deltaPowN,
            FixedPointMathLib.WAD
        );
        */
    newSpotPrice = spotPrice.mul(deltaPowN);
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
  } else if (curve == "LINEAR") {
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
  }
  return {
    inputValue,
    newDelta,
    lpFee,
    protocolFee,
    newSpotPrice,
  };
};

CurveUtils.prototype.getSellInfo = function (
  curve,
  fee,
  delta,
  spotPrice,
  nbNfts
) {
  // make sure we deal with bignumbers
  fee = ethers.BigNumber.from(fee);
  delta = ethers.BigNumber.from(delta);
  spotPrice = ethers.BigNumber.from(spotPrice);
  nbNfts = ethers.BigNumber.from(nbNfts);

  let inputValue;
  let protocolFee;
  let newDelta;

  if (curve == "EXPONENTIAL") {
    // https://github.com/sudoswap/lssvm/blob/main/src/bonding-curves/ExponentialCurve.sol

    /*
        uint256 invDelta = FixedPointMathLib.WAD.fdiv(
            delta,
            FixedPointMathLib.WAD
        );
        uint256 invDeltaPowN = invDelta.fpow(numItems, FixedPointMathLib.WAD);
        */
    let invDelta = ETHER.mul(ETHER).div(delta);
    let invDeltaPowN = invDelta.pow(nbNfts);

    /*
          uint256 newSpotPrice_ = uint256(spotPrice).fmul(
            deltaPowN,
            FixedPointMathLib.WAD
        );
        */
    newSpotPrice = spotPrice.mul(invDeltaPowN);

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
  } else if (curve == "LINEAR") {
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
  }
  return {
    outputValue,
    newDelta,
    lpFee,
    protocolFee,
    newSpotPrice,
  };
};

module.exports = CurveUtils;
