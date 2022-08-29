const { ethers } = require("ethers");
const moize = require('moize');

const Pool = require("./Pool");

const BLOCK_CACHE_SIZE = 300;
const TRANSACTION_CACHE_SIZE = 100;

function SudoSwap (web3Provider) {
    if (typeof web3Provider == 'string') {
        this.provider = new ethers.providers.JsonRpcProvider(web3Provider)
    }
    
    const getBlock = async function (blockNumber) {
        let b = await this.provider.getBlock(blockNumber);
        return b;
    }

    this.getBlock = moize(getBlock, {
        maxSize: BLOCK_CACHE_SIZE,
        maxArgs: 1
    });

    const getTransaction = async function (blockNumber) {
        let t = await this.provider.getTransaction(blockNumber);
        return t;
    }

    this.getTransaction = moize(getTransaction, {
        maxSize: TRANSACTION_CACHE_SIZE,
        maxArgs: 1
    });
}

/*
    Instanciate a new pool
*/
SudoSwap.prototype.getPool = function (address) {
    return new Pool(this, address);
}

module.exports = SudoSwap;
