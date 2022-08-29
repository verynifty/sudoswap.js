const ABI = require('./ABIS/pool.json')
const NFTABI = require('./ABIS/erc721.json')

const { ethers } = require("ethers");
const abiDecoder = require('abi-decoder');

function Pool (sudo, address) {
    this.sudo = sudo;
    this.address = address;
    this.contract = new ethers.Contract(address, ABI, this.sudo.provider);
}

Pool.prototype.getType = async function() {
    if (this.type != null) {
        return this.type
    }
    let type = await this.contract.poolType();
    if (type == 2) {
        this.type = "TRADE";
    } else if (type == 1) {
        this.type = "SELL";
    } else if (type == 0) {
        this.type = "BUY";
    }
    return this.type
}

Pool.prototype.getNFT = async function() {
    if (this.nft != null) {
        return this.nft
    }
    this.nft = await this.contract.nft();
    return this.nft;
}

Pool.prototype.getSpotPrice = async function() {
    let spotPrice = await this.contract.spotPrice();
    return spotPrice;
}

Pool.prototype.getNFTContract = async function() {
    if (this.nftContract != null) {
        await this.getNFT()
    }
    this.nftContract = new ethers.Contract(this.nft, NFTABI, this.sudo.provider);
    return this.nftContract;
}

Pool.prototype.getSellNFTQuote = async function (nbNFT) {
    let quoteResult = await this.contract.getSellNFTQuote(nbNFT);
    return {
        newSpotPrice: quoteResult.newSpotPrice,
        newDelta: quoteResult.newDelta,
        outputAmount: quoteResult.outputAmount,
        protocolFee: quoteResult.protocolFee
    }
}

Pool.prototype.getBuyNFTQuote = async function (nbNFT) {
    let quoteResult = await this.contract.getBuyNFTQuote(nbNFT);
    return {
        newSpotPrice: quoteResult.newSpotPrice,
        newDelta: quoteResult.newDelta,
        inputAmount: quoteResult.inputAmount,
        protocolFee: quoteResult.protocolFee
    }
}

Pool.prototype.getTradesIn = async function () {
    let trades = [];

    let infilter = this.contract.filters.SwapNFTInPair();
    let inevents = await this.contract.queryFilter(infilter);

    let spotfilter = this.contract.filters.SpotPriceUpdate();
    let spotPrices = await this.contract.queryFilter(spotfilter);

    let nft = await this.getNFTContract()
    let intransfersfilter = nft.filters.Transfer(null, this.address);
    let intransfers = await nft.queryFilter(intransfersfilter);

    for (const i of inevents) {

        // We get the spot price before the swapIn event
        let spotPriceBefore = spotPrices.filter(function(p) {
            return (p.blockNumber <= i.blockNumber && p.logIndex < i.logIndex && p.transactionHash != i.transactionHash);
        })
        spotPriceBefore = spotPriceBefore.length > 0 ? spotPriceBefore[spotPriceBefore.length - 1].args.newSpotPrice : (await this.getSpotPrice());
        
        // we get the spot Price after the swapIn event
        let spotPriceAfter = spotPrices.filter(function(p) {
            return (p.transactionHash != i.transactionHash && p.logIndex >= i.logIndex && p.blockNumber >= i.blockNumber);
        })
        //console.log("price after == ", spotPriceAfter)
        spotPriceAfter = spotPriceAfter.length > 0 ? spotPriceAfter[0].args.newSpotPrice: (await this.getSpotPrice())

        // let tx = await this.sudo.getTransaction(i.transactionHash);
        let b = await this.sudo.getBlock(i.blockNumber);
        let buyer = "";
        let nfts = intransfers.filter(function(t) {
            buyer = t.args.to;
            return (t.transactionHash == i.transactionHash && t.logIndex < i.logIndex)
        }).map(function(t) {
            return (t.args.tokenId)
        });
        
        console.log("======== TX")
        let t = {
            type: "NFT_IN_POOL",
            transactionHash: i.transactionHash,
            blockNumber: i.blockNumber,
            //nfts: nfts,
            nbNfts: nft.length,
            buyer: buyer,
            priceBefore: spotPriceBefore.toString(),
            priceAfter: spotPriceAfter.toString(),
            timestamp: b.timestamp,
            pool: this.address
        }
        console.log(t)
        trades.push(t)
    }
    return trades;
    //console.log(outtransfers)
}

Pool.prototype.getTradesOut = async function () {
    let trades = [];

    let outfilter = this.contract.filters.SwapNFTOutPair();
    let outevents = await this.contract.queryFilter(outfilter);

    let spotfilter = this.contract.filters.SpotPriceUpdate();
    let spotPrices = await this.contract.queryFilter(spotfilter);

    let nft = await this.getNFTContract()
    let intransfersfilter = nft.filters.Transfer(this.address, null);
    let intransfers = await nft.queryFilter(intransfersfilter);

    for (const i of outevents) {

        // We get the spot price before the swapIn event
        let spotPriceBefore = spotPrices.filter(function(p) {
            return (p.blockNumber <= i.blockNumber && p.logIndex < i.logIndex && p.transactionHash != i.transactionHash);
        })
        spotPriceBefore = spotPriceBefore.length > 0 ? spotPriceBefore[spotPriceBefore.length - 1].args.newSpotPrice : (await this.getSpotPrice());
        
        // we get the spot Price after the swapIn event
        let spotPriceAfter = spotPrices.filter(function(p) {
            return (p.transactionHash == i.transactionHash && p.logIndex < i.logIndex);
        })
        //console.log("price after == ", spotPriceAfter)
        spotPriceAfter = spotPriceAfter.length > 0 ? spotPriceAfter[0].args.newSpotPrice: (await this.getSpotPrice())

        // let tx = await this.sudo.getTransaction(i.transactionHash);
        let b = await this.sudo.getBlock(i.blockNumber);
        let buyer = "";
        let nfts = intransfers.filter(function(t) {
            buyer = t.args.to;
            return (t.transactionHash == i.transactionHash && t.logIndex < i.logIndex)
        }).map(function(t) {
            return (t.args.tokenId)
        });
        
        console.log("======== TX")
        let t = {
            type: "NFT_OUT_POOL",
            transactionHash: i.transactionHash,
            blockNumber: i.blockNumber,
            //nfts: nfts,
            nbNfts: nfts.length,
            buyer: buyer,
            priceBefore: spotPriceBefore.toString(),
            priceAfter: spotPriceAfter.toString(),
            timestamp: b.timestamp,
            pool: this.address,
            logIndex: i.logIndex
        }
        console.log(t)
        trades.push(t)
    }
    return trades;
    //console.log(outtransfers)
}

Pool.prototype.getTrades = async function() {
    const result = await Promise.all([this.getTradesOut(), this.getTradesIn()])
    let trades = [...result[0], ...result[1]];
    return (trades.sort(function (a, b) {
        if (a.blockNumber == b.blockNumber) {
            return a.logIndex - b.logIndex;
        }
        return a.blockNumber - b.blockNumber;
    }))
}

module.exports = Pool;
