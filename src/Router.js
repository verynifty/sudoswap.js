const ABI = require("./ABIS/router.json");
const NFTABI = require("./ABIS/erc721.json");
const ERC20ABI = require("./ABIS/erc20.json");

const { ethers } = require("ethers");
const abiDecoder = require("abi-decoder");

const ADDRESSES = {
  1: "0x2b2e8cda09bba9660dca5cb6233787738ad68329", // mainnet
  4: "0x9ABDe410D7BA62fA11EF37984c0Faf2782FE39B5", // rinkeby
  5: "0x25b4EfC43c9dCAe134233CD577fFca7CfAd6748F", // goerli
};
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
  deadline,
  ethAmount
) {
  const signer = await this.sudo.getSigner();
  const tx = await this.contract
    .connect(signer)
    .swapETHForAnyNFTs(swapList, ethRecipient, nftRecipient, deadline, {
      value: ethAmount,
    });

  return tx;
};

Router.prototype.swapETHForSpecificNFTs = async function (
  swapList,
  ethRecipient,
  nftRecipient,
  deadline,
  ethAmount
) {
  const signer = await this.sudo.getSigner();

  const tx = await this.contract
    .connect(signer)
    .swapETHForSpecificNFTs(swapList, ethRecipient, nftRecipient, deadline, {
      value: ethAmount,
    });

  return tx;
};

Router.prototype.swapNFTsForToken = async function (
  swapList,
  minOutput,
  tokenRecipient,
  deadline
) {
  const signer = await this.sudo.getSigner();

  const tx = await this.contract
    .connect(signer)
    .swapNFTsForToken(swapList, minOutput, tokenRecipient, deadline);

  return tx;
};

Router.prototype.approveCollection = async function (nftCollection) {
  const isApproved = await this.isApprovedForRouter(nftCollection);

  if (!isApproved) {
    let nftContract = new ethers.Contract(
      nftCollection,
      NFTABI,
      this.sudo.provider
    );

    const signer = await this.sudo.getSigner();

    const tx = await nftContract
      .connect(signer)
      .setApprovalForAll(ADDRESSES[this.chainId], true);
    return tx;
  }
};

Router.prototype.isApprovedForRouter = async function (nftCollection) {
  let nftContract = new ethers.Contract(
    nftCollection,
    NFTABI,
    this.sudo.provider
  );
  let res = await nftContract.isApprovedForAll(
    this.sudo.connectedAddress,
    ADDRESSES[this.chainId]
  );
  return res;
  console.log(res);
};

// FOR ERC20 TOKEN POOLS

// returns allowance
Router.prototype.tokenAllowanceForRouter = async function (erc20) {
  let tokenContract = new ethers.Contract(erc20, ERC20ABI, this.sudo.provider);

  const ERC20Contract = new ethers.Contract(
    erc20,
    ERC20ABI,
    this.sudo.provider
  );

  // check allowance
  let res = await ERC20Contract.allowance(
    this.sudo.connectedAddress,
    ADDRESSES[this.chainId]
  );

  return res;
};

Router.prototype.tokenApproveRouter = async function (erc20) {
  MAX_INT =
    "115792089237316195423570985008687907853269984665640564039457584007913129639935";

  let tokenContract = new ethers.Contract(erc20, ERC20ABI, this.sudo.provider);

  const ERC20Contract = new ethers.Contract(
    erc20,
    ERC20ABI,
    this.sudo.provider
  );

  // check allowance
  let res = await ERC20Contract.approve(
    this.sudo.connectedAddress,
    ADDRESSES[this.chainId],
    MAX_INT
  );

  return res;
};

module.exports = Router;
