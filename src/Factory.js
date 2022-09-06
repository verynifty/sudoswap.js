const ABI = require("./ABIS/factory.json");

const ADDRESSES = {
    1: "0xb16c1342E617A5B6E4b631EB114483FDB289c0A4", // mainnet
    4: "0xcB1514FE29db064fa595628E0BFFD10cdf998F33", // rinkeby
  };

  function Factory(sudo, chainId = 1) {
    this.sudo = sudo;
    this.address = ADDRESSES[chainId];
    this.chainId = chainId;
    this.contract = new ethers.Contract(this.address, ABI, this.sudo.provider);
  }

  Factory.prototype.createPair = function () {
      // todo
  }

  Factory.prototype.getAllPairs = function () {
      // todo
  }

  module.exports = Factory;