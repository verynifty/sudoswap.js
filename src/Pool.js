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

Pool.prototype.getBuys = async function () {
    let trades = [];

    let infilter = this.contract.filters.SwapNFTInPair();
    let inevents = await this.contract.queryFilter(infilter);

    let spotfilter = this.contract.filters.SpotPriceUpdate();
    let spotPrices = await this.contract.queryFilter(spotfilter);

    let nft = await this.getNFTContract()
    let intransfersfilter = nft.filters.Transfer(null, this.address);
    let intransfers = await nft.queryFilter(intransfersfilter);

    let spotIndex = 0;
    let spotPrice= spotPrices.length > (await this.getSpotPrice()) ? spotPrices[0].args.newSpotPrice : 0;
    for (const i of inevents) {
        let tx = await this.sudo.getTransaction(i.transactionHash);
        let b = await this.sudo.getBlock(i.blockNumber);
        let buyer = "";
        let nfts = intransfers.filter(function(t) {
            buyer = t.args.to;
            return (t.transactionHash == i.transactionHash && t.logIndex < i.logIndex)
        }).map(function(t) {
            return (t.args.tokenId)
        });
        
        console.log("======== TX")
        //console.log(tx)

        console.log(b)

        trades.push({
            transactionHash: i.transactionHash,
            blockNumber: i.blockNumber,
            nfts: nfts,
            buyer: buyer,
            price: spotPrice,
            timestamp: b.timestamp
        })

    }
    return trades;
    //console.log(outtransfers)
}

module.exports = Pool;
