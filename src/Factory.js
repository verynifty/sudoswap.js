const ABI = require("./ABIS/factory.json");

const { ethers } = require("ethers");

const ADDRESSES = {
    1: "0xb16c1342E617A5B6E4b631EB114483FDB289c0A4", // mainnet
    4: "0xcB1514FE29db064fa595628E0BFFD10cdf998F33", // rinkeby
};

const DEPLOYED_BLOCK = {
    1: 14645816,
    4: 10484872
}

function Factory(sudo, chainId = 1) {
    this.sudo = sudo;
    this.address = ADDRESSES[chainId];
    this.chainId = chainId;
    this.contract = new ethers.Contract(this.address, ABI, this.sudo.provider);
}

Factory.prototype.createPair = async function () {
    // todo
}

Factory.prototype.getNewPairsAddress = async function (fromBlock = -1, toBlock = "latest") {
    if (fromBlock == -1) {
        fromBlock = DEPLOYED_BLOCK[this.chainId];
    }
    let newPairFilter = this.contract.filters.NewPair();
    let pairCreations = await this.sudo.getAllEventsWithFilter(this.contract, newPairFilter, fromBlock, toBlock);
    return (pairCreations.map(e => e.args[0]))
}

Factory.prototype.getNewPairsInstance = async function (fromBlock = -1, toBlock = "latest") {
    let pairs = await this.getNewPairsAddress(fromBlock, toBlock);
    return (pairs.map(a => this.sudo.getPool(a)))
}

module.exports = Factory;
