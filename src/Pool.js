const ABI = require("./ABIS/pool.json");
const NFTABI = require("./ABIS/erc721.json");
const ERC20ABI = require("./ABIS/erc20.json");

const { ethers } = require("ethers");
const abiDecoder = require("abi-decoder");

function Pool(sudo, address) {
  this.sudo = sudo;
  this.address = address;
  this.contract = new ethers.Contract(address, ABI, this.sudo.provider);
}

Pool.prototype.getType = async function () {
  if (this.type != null) {
    return this.type;
  }
  let type = await this.contract.poolType();
  if (type == 2) {
    this.type = "TRADE";
  } else if (type == 1) {
    this.type = "SELL";
  } else if (type == 0) {
    this.type = "BUY";
  }
  return this.type;
};

Pool.prototype.getCurve = async function () {
  if (this.curve != null) {
    return this.curve;
  }
  this.curve = this.sudo.utils.addressToCurveType(
    await this.sudo.getNetwork(),
    await this.contract.bondingCurve()
  );
  return this.curve;
};

Pool.prototype.getNFT = async function () {
  if (this.nft != null) {
    return this.nft;
  }
  this.nft = await this.contract.nft();
  return this.nft;
};

Pool.prototype.getOwner = async function () {
  if (this.owner != null) {
    return this.owner;
  }
  this.owner = await this.contract.owner();
  return this.owner;
};

Pool.prototype.getAllHeldIds = async function () {
  let heldIds = await this.contract.getAllHeldIds();

  return heldIds.map((i) => i.toString());
};

Pool.prototype.getSpotPrice = async function (blockNumber = "latest") {
  let spotPrice = await this.contract.spotPrice({ blockTag: blockNumber });
  return spotPrice;
};

Pool.prototype.getFee = async function (blockNumber = "latest") {
  /*
  if (this.fee != null ) {
    return this.fee;
  }
  */
  this.fee = await this.contract.fee({ blockTag: blockNumber });
  return this.fee;
};

Pool.prototype.getDelta = async function (blockNumber = "latest") {
  return await this.contract.delta({ blockTag: blockNumber });
};

Pool.prototype.getAssetRecipient = async function () {
  return await this.contract.assetRecipient();
};

Pool.prototype.getNFTContract = async function () {
  if (this.nft == null) {
    await this.getNFT();
  }
  if (this.nftContract == null) {
    this.nftContract = new ethers.Contract(
      this.nft,
      NFTABI,
      this.sudo.provider
    );
  }
  return this.nftContract;
};

Pool.prototype.getPoolContract = async function () {
  return this.contract;
};

Pool.prototype.getSellNFTQuote = async function (nbNFT) {
  let quoteResult = await this.contract.getSellNFTQuote(nbNFT);
  return {
    newSpotPrice: quoteResult.newSpotPrice,
    newDelta: quoteResult.newDelta,
    outputAmount: quoteResult.outputAmount,
    protocolFee: quoteResult.protocolFee,
  };
};

Pool.prototype.getBuyNFTQuote = async function (nbNFT) {
  let quoteResult = await this.contract.getBuyNFTQuote(nbNFT);
  return {
    newSpotPrice: quoteResult.newSpotPrice,
    newDelta: quoteResult.newDelta,
    inputAmount: quoteResult.inputAmount,
    protocolFee: quoteResult.protocolFee,
  };
};

Pool.prototype.getTradesIn = async function () {
  let trades = [];

  let curveType = await this.getCurve();

  let infilter = this.contract.filters.SwapNFTInPair();
  let inevents = await this.contract.queryFilter(infilter);

  if (inevents.length == 0) {
    return [];
  }

  let spotfilter = this.contract.filters.SpotPriceUpdate();
  let spotPrices = await this.contract.queryFilter(spotfilter);

  let deltaUpdateFilter = this.contract.filters.DeltaUpdate();
  let deltaUpdates = await this.contract.queryFilter(deltaUpdateFilter);

  let feeUpdateFilter = this.contract.filters.FeeUpdate();
  let feeUpdates = await this.contract.queryFilter(feeUpdateFilter);

  let nft = await this.getNFTContract();
  let intransfersfilter = nft.filters.Transfer(null, this.address);
  let intransfers = await nft.queryFilter(intransfersfilter);

  let fee = "0";
  let type = await this.getType();
  if (type == "TRADE") {
    fee = await this.getFee(
      feeUpdates.length > 0 ? inevents[0].blockNumber : "latest"
    );
  }
  let delta = await this.getDelta(
    deltaUpdates.length > 0 ? inevents.blockNumber : "latest"
  );

  for (const i of inevents) {
    let currentDelta = deltaUpdates.filter(function (u) {
      return (
        u.blockNumber <= i.blockNumber ||
        (u.blockNumber <= i.blockNumber && u.logIndex < i.logIndex)
      );
    });
    if (currentDelta.length > 0) {
      currentDelta = currentDelta[currentDelta.length - 1].args[0];
    } else {
      currentDelta = delta;
    }

    let currentFee = feeUpdates.filter(function (f) {
      return (
        f.blockNumber <= i.blockNumber ||
        (f.blockNumber <= i.blockNumber && f.logIndex < i.logIndex)
      );
    });
    if (currentFee.length > 0) {
      currentFee = currentFee[currentFee.length - 1].args[0];
    } else {
      currentFee = fee;
    }

    // We get the spot price before the swapIn event
    let spotPriceBefore = spotPrices.filter(function (p) {
      return (
        (p.blockNumber <= i.blockNumber ||
          (p.blockNumber <= i.blockNumber && p.logIndex < i.logIndex)) &&
        p.transactionHash != i.transactionHash
      );
    });
    spotPriceBefore =
      spotPriceBefore.length > 0
        ? spotPriceBefore[spotPriceBefore.length - 1].args.newSpotPrice
        : await this.getSpotPrice(i.blockNumber - 1);

    // we get the spot Price after the swapIn event
    let spotPriceAfter = spotPrices.filter(function (p) {
      return p.transactionHash == i.transactionHash && p.logIndex < i.logIndex;
    });
    spotPriceAfter =
      spotPriceAfter.length > 0
        ? spotPriceAfter[0].args.newSpotPrice
        : await this.getSpotPrice(i.blockNumber);

    let b = await this.sudo.getBlock(i.blockNumber);
    let buyer = "";
    let nfts = intransfers
      .filter(function (t) {
        buyer = t.args.to;
        return (
          t.transactionHash == i.transactionHash && t.logIndex < i.logIndex
        );
      })
      .map(function (t) {
        return t.args.tokenId.toString();
      });
    let curveSimulation = await this.sudo.utils.getSellInfo(
      curveType,
      currentFee,
      currentDelta,
      spotPriceBefore,
      nfts.length
    );
    let t = {
      type: "NFT_IN_POOL",
      transactionHash: i.transactionHash,
      blockNumber: i.blockNumber,
      nfts: nfts,
      nbNfts: nfts.length,
      buyer: buyer,
      fee: currentFee.toString(),
      delta: currentDelta.toString(),
      lpFee: curveSimulation.lpFee.toString(),
      protocolFee: curveSimulation.protocolFee.toString(),
      outputValue: curveSimulation.outputValue.toString(),
      pricePerNft: curveSimulation.outputValue.div(nfts.length).toString(),
      priceBefore: spotPriceBefore.toString(),
      priceAfter: spotPriceAfter.toString(),
      timestamp: b.timestamp,
      pool: this.address,
    };
    //console.log(t)
    trades.push(t);
  }
  return trades;
  //console.log(outtransfers)
};

Pool.prototype.getTradesOut = async function () {
  let trades = [];

  let curveType = await this.getCurve();

  let outfilter = this.contract.filters.SwapNFTOutPair();
  let outevents = await this.contract.queryFilter(outfilter);

  if (outevents.length == 0) {
    return [];
  }

  let spotfilter = this.contract.filters.SpotPriceUpdate();
  let spotPrices = await this.contract.queryFilter(spotfilter);

  let deltaUpdateFilter = this.contract.filters.DeltaUpdate();
  let deltaUpdates = await this.contract.queryFilter(deltaUpdateFilter);

  let feeUpdateFilter = this.contract.filters.FeeUpdate();
  let feeUpdates = await this.contract.queryFilter(feeUpdateFilter);

  let nft = await this.getNFTContract();
  let intransfersfilter = nft.filters.Transfer(this.address, null);
  let intransfers = await nft.queryFilter(intransfersfilter);

  let fee = "0";
  let type = await this.getType();
  if (type == "TRADE") {
    fee = await this.getFee(
      feeUpdates.length > 0 ? outevents[0].blockNumber : "latest"
    );
  }
  let delta = await this.getDelta(
    deltaUpdates.length > 0 ? outevents[0].blockNumber : "latest"
  );

  for (const i of outevents) {
    let currentDelta = deltaUpdates.filter(function (u) {
      return (
        u.blockNumber <= i.blockNumber ||
        (u.blockNumber <= i.blockNumber && u.logIndex < i.logIndex)
      );
    });
    if (currentDelta.length > 0) {
      currentDelta = currentDelta[currentDelta.length - 1].args[0];
    } else {
      currentDelta = delta;
    }

    let currentFee = feeUpdates.filter(function (f) {
      return (
        f.blockNumber <= i.blockNumber ||
        (f.blockNumber <= i.blockNumber && f.logIndex < i.logIndex)
      );
    });
    if (currentFee.length > 0) {
      currentFee = currentFee[currentFee.length - 1].args[0];
    } else {
      currentFee = fee;
    }

    // We get the spot price before the swapIn event
    let spotPriceBefore = spotPrices.filter(function (p) {
      return (
        (p.blockNumber <= i.blockNumber ||
          (p.blockNumber <= i.blockNumber && p.logIndex < i.logIndex)) &&
        p.transactionHash != i.transactionHash
      );
    });
    spotPriceBefore =
      spotPriceBefore.length > 0
        ? spotPriceBefore[spotPriceBefore.length - 1].args.newSpotPrice
        : await this.getSpotPrice(i.blockNumber - 1);

    // we get the spot Price after the swapIn event
    let spotPriceAfter = spotPrices.filter(function (p) {
      return p.transactionHash == i.transactionHash && p.logIndex < i.logIndex;
    });
    // console.log("price after == ", spotPriceAfter)
    spotPriceAfter =
      spotPriceAfter.length > 0
        ? spotPriceAfter[0].args.newSpotPrice
        : await this.getSpotPrice(i.blockNumber);

    // let tx = await this.sudo.getTransaction(i.transactionHash);
    let b = await this.sudo.getBlock(i.blockNumber);
    let buyer = "";
    let nfts = intransfers
      .filter(function (t) {
        buyer = t.args.to;
        return (
          t.transactionHash == i.transactionHash && t.logIndex < i.logIndex
        );
      })
      .map(function (t) {
        return t.args.tokenId.toString();
      });
    let curveSimulation = await this.sudo.utils.getBuyInfo(
      curveType,
      currentFee,
      currentDelta,
      spotPriceBefore,
      nfts.length
    );
    let t = {
      type: "NFT_OUT_POOL",
      transactionHash: i.transactionHash,
      blockNumber: i.blockNumber,
      nfts: nfts,
      nbNfts: nfts.length,
      buyer: buyer,
      fee: currentFee.toString(),
      delta: currentDelta.toString(),
      lpFee: curveSimulation.lpFee.toString(),
      protocolFee: curveSimulation.protocolFee.toString(),
      inputValue: curveSimulation.inputValue.toString(),
      pricePerNft: curveSimulation.inputValue.div(nfts.length).toString(),
      priceBefore: spotPriceBefore.toString(),
      priceAfter: spotPriceAfter.toString(),
      timestamp: b.timestamp,
      pool: this.address,
      logIndex: i.logIndex,
    };
    // console.log(t)
    trades.push(t);
  }
  return trades;
};

Pool.prototype.getTrades = async function () {
  const result = await Promise.all([this.getTradesOut(), this.getTradesIn()]);
  let trades = [...result[0], ...result[1]];
  return trades.sort(function (a, b) {
    if (a.blockNumber == b.blockNumber) {
      return a.logIndex - b.logIndex;
    }
    return a.blockNumber - b.blockNumber;
  });
};

// returns an ERC20 instance if the pool is erc20 and NFTs
Pool.prototype.getERC20Contract = async function () {
  try {
    let token = await this.contract.token();
    if (token.length == 42) {
      this.ERC20Contract = new ethers.Contract(
        token,
        ERC20ABI,
        this.sudo.provider
      );
    } else {
      return "This is an ETH pool";
    }
  } catch (error) {}
};
module.exports = Pool;
