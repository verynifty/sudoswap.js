const ABI = require("./ABIS/router.json");
const NFTABI = require("./ABIS/erc721.json");

const { ethers } = require("ethers");
const abiDecoder = require("abi-decoder");

function Router(sudo, chainId) {
  this.sudo = sudo;
  this.address =
    chainId == 1
      ? "0x2b2e8cda09bba9660dca5cb6233787738ad68329"
      : chainId == 4
      ? "0x9ABDe410D7BA62fA11EF37984c0Faf2782FE39B5"
      : null;

  this.contract = new ethers.Contract(this.address, ABI, this.sudo.provider);
}

module.exports = Router;
