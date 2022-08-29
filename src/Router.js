const ABI = require("./ABIS/router.json");
const NFTABI = require("./ABIS/erc721.json");

const { ethers } = require("ethers");
const abiDecoder = require("abi-decoder");

const ADDRESSES = {
  1: "0x2b2e8cda09bba9660dca5cb6233787738ad68329", // mainnet
  4: "0x9ABDe410D7BA62fA11EF37984c0Faf2782FE39B5" // rinkeby
}
function Router(sudo, chainId = 1) {
  this.sudo = sudo;
  this.address = ADDRESSES[chainId];
  this.chainId = chainId;
  this.contract = new ethers.Contract(this.address, ABI, this.sudo.provider);
}

// todo add logic for connecting to signer
Router.prototype.swapETHForAnyNFTs = async function (
  swapList,
  ethRecipient,
  nftRecipient,
  deadline
) {
  const tx = await this.contract.swapETHForAnyNFTs(
    swapList,
    ethRecipient,
    nftRecipient,
    deadline
  );
};

Router.prototype.swapETHForSpecificNFTs = async function (
  swapList,
  ethRecipient,
  nftRecipient,
  deadline
) {
  const tx = await this.contract.swapETHForSpecificNFTs(
    swapList,
    ethRecipient,
    nftRecipient,
    deadline
  );
};

Router.prototype.swapNFTsForToken = async function (
  swapList,
  minOutput,
  tokenRecipient,
  deadline
) {
  const tx = await this.contract.swapNFTsForToken(
    swapList,
    minOutput,
    tokenRecipient,
    deadline
  );
};

Router.prototype.isApprovedForRouter = async function(
  nftCollection
) {
  let nftContract = new ethers.Contract(
    nftCollection,
    NFTABI,
    this.sudo.provider
  );
  let res = await nftContract.isApprovedForAll(sudo.account, ADDRESSES[this.chainId]);
  console.log(res);
}

module.exports = Router;
