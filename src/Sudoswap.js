const { ethers } = require("ethers");
const moize = require("moize");
const Utils = require("./Utils");

const Pool = require("./Pool");
const Router = require("./Router");
const Factory = require("./Factory");

const BLOCK_CACHE_SIZE = 300;
const TRANSACTION_CACHE_SIZE = 100;

function Sudoswap(web3Provider, pKey = null) {
  this.connectedAddress = null;
  this.isArchive = "UNKNOWN"
  this.isWeb3Provider = false;
  if (typeof web3Provider == "string") {
    if (web3Provider.startsWith("http")) {
      this.provider = new ethers.providers.JsonRpcProvider(web3Provider);
    } else if (web3Provider.startsWith("ws")) {
      this.provider = new ethers.providers.WebSocketProvider(web3Provider);
    }
  } else {
    this.provider = new ethers.providers.Web3Provider(web3Provider, "any");
    this.isWeb3Provider = true;
  }

  this.utils = new Utils();

  // pass pkey for buy and sell functionality
  if (pKey) {
    const wallet = new ethers.Wallet(pKey);
    this.signer = wallet.connect(this.provider);
    this.connectedAddress = this.signer.address;
  }

  const getBlock = async function (blockNumber) {
    let b = await this.provider.getBlock(blockNumber);
    return b;
  };

  this.getBlock = moize(getBlock, {
    maxSize: BLOCK_CACHE_SIZE,
    maxArgs: 1,
  });

  const getTransaction = async function (blockNumber) {
    let t = await this.provider.getTransaction(blockNumber);
    return t;
  };

  this.getTransaction = moize(getTransaction, {
    maxSize: TRANSACTION_CACHE_SIZE,
    maxArgs: 1,
  });
}

Sudoswap.prototype.hasNodeArchiveCapabilities = async function () {
  if (this.isArchive == "UNKNOWN") {
    this.isArchive = false;
    try {
      let testResult = await this.provider.getBalance("0xe5Fb31A5CaEE6a96de393bdBF89FBe65fe125Bb3", 1);
      if (testResult.toString() == "1000000000000000000000") {
        this.isArchive = true;
      }
    } catch (error) {
      // console.log(error)
    }
  }
  return this.isArchive;
}

Sudoswap.prototype.getSigner = async function () {
  // if connected via metamask
  if (this.isWeb3Provider) {
    await this.provider.send("eth_requestAccounts", []);

    const signer = this.provider.getSigner();
    this.connectedAddress = await signer.getAddress();
    return signer;
  } else {
    return this.signer;
  }
};

/*
    Instanciate a new pool
*/
Sudoswap.prototype.getPool = function (address) {
  return new Pool(this, address);
};

Sudoswap.prototype.getNetwork = async function () {
  return (await this.provider.getNetwork()).chainId;
};

// Instantiate the router
Sudoswap.prototype.router = async function () {
  const chainId = await this.getNetwork();

  return new Router(this, chainId);
};

// Instantiate the factory
Sudoswap.prototype.factory = async function () {
  const chainId = await this.getNetwork();

  return new Factory(this, chainId);
};

Sudoswap.prototype.getEthers = function () {
  return ethers;
};

Sudoswap.prototype.getAllEventsWithFilter = async function (contract, filter, fromBlock = 0, toBlock = "latest") {
 // console.log("Error on range ", fromBlock, toBlock)
  let ret = []
  try {
    //console.log(filter)
    ret = await contract.queryFilter(filter, fromBlock, toBlock);
  } catch (error) {
    console.log("ERROR , ", fromBlock, toBlock, fromBlock < toBlock)
    let newToBlock = (toBlock == "latest") ? await this.provider.getBlockNumber() : toBlock;
    const result = await Promise.all([this.getAllEventsWithFilter(contract, filter, fromBlock, fromBlock + parseInt((newToBlock - fromBlock) / 2)), this.getAllEventsWithFilter(contract, filter, fromBlock + parseInt((newToBlock - fromBlock) / 2) + 1, newToBlock)]);
    ret = [...result[0], ...result[1]];
  }
  return ret;
}

module.exports = Sudoswap;
