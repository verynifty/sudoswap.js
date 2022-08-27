const ABI = require('./ABIS/pool.json')
const NFTABI = require('./ABIS/erc721.json')

const { ethers } = require("ethers");

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
    let infilter = this.contract.filters.SwapNFTInPair();
    let inevents = await this.contract.queryFilter(infilter);
    let tfilter = []
    console.log(events)
}

module.exports = Pool;
