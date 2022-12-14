const ABI = require("./ABIS/factory.json");

const { ethers } = require("ethers");

const ADDRESSES = {
  1: "0xb16c1342E617A5B6E4b631EB114483FDB289c0A4", // mainnet
  4: "0xcB1514FE29db064fa595628E0BFFD10cdf998F33", // rinkeby
  5: "0xF0202E9267930aE942F0667dC6d805057328F6dC", // Goerli
};

const DEPLOYED_BLOCK = {
  1: 14645816,
  4: 10484872,
  5: 7683515,
};

function Factory(sudo, chainId = 1) {
  this.sudo = sudo;
  this.address = ADDRESSES[chainId];
  this.chainId = chainId;
  this.contract = new ethers.Contract(this.address, ABI, this.sudo.provider);
}

// if initialiNFTIds > 0, call approveCollection() before.
Factory.prototype.createPairEth = async function (
  nft,
  bondingCurve,
  assetRecipient,
  poolType,
  delta,
  fee,
  spotPrice,
  initialNFTIds
) {
  const signer = await this.sudo.getSigner();

  const tx = this.contract
    .connect(signer)
    .createPairEth(
      nft,
      bondingCurve,
      assetRecipient,
      poolType,
      delta,
      fee,
      spotPrice,
      initialNFTIds
    );

  return tx;
};

Factory.prototype.getNewPairsAddress = async function (
  fromBlock = -1,
  toBlock = "latest"
) {
  if (fromBlock == -1) {
    fromBlock = DEPLOYED_BLOCK[this.chainId];
  }
  let newPairFilter = this.contract.filters.NewPair();
  let pairCreations = await this.sudo.getAllEventsWithFilter(
    this.contract,
    newPairFilter,
    fromBlock,
    toBlock
  );
  return pairCreations.map((e) => e.args[0]);
};

Factory.prototype.getNewPairsInstance = async function (
  fromBlock = -1,
  toBlock = "latest"
) {
  let pairs = await this.getNewPairsAddress(fromBlock, toBlock);
  return pairs.map((a) => this.sudo.getPool(a));
};

Factory.prototype.approveCollection = async function (nftCollection) {
  const isApproved = await this.isApprovedForFactory(nftCollection);

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

Factory.prototype.isApprovedForFactory = async function (nftCollection) {
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

module.exports = Factory;
