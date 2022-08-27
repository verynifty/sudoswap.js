const { ethers } = require("ethers");
const Pool = require("./Pool");

function SudoSwap (web3Provider) {
    if (typeof web3Provider == 'string') {
        this.provider = new ethers.providers.JsonRpcProvider(web3Provider)
    }
}

/*
    Instanciate a new pool
*/
SudoSwap.prototype.getPool = function (address) {
    return new Pool(this, address);
}

module.exports = SudoSwap;
