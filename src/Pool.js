const ABI = require('./ABIS/pool.json')
const { ethers } = require("ethers");

function Pool (sudo, address) {
    this.sudo = sudo;
    this.contract = new ethers.Contract(address, ABI, sudo.provider);
}

Pool.prototype.getType() = async function() {
    let type = await this.contract.poolType();
    console.log(type)
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
