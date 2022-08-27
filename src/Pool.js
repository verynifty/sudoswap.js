const ABI = require('./ABIS/pool.json')
const { ethers } = require("ethers");

function Pool (sudo, address) {
    this.sudo = sudo;
    this.contract = new ethers.Contract(address, ABI, sudo.provider);
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

module.exports = Pool;
