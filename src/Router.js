const ABI = require("./ABIS/pool.json");
const NFTABI = require("./ABIS/erc721.json");

const { ethers } = require("ethers");
const abiDecoder = require("abi-decoder");

function Router(sudo) {
  this.sudo = sudo;
  this.address = address;
  this.contract = new ethers.Contract(address, ABI, this.sudo.provider);
}

module.exports = Pool;
