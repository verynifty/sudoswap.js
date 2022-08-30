const { ethers } = require("ethers");
const moize = require("moize");
const CurveUtils = require("./CurveUtils");

const Pool = require("./Pool");
const Router = require("./Router");

const BLOCK_CACHE_SIZE = 300;
const TRANSACTION_CACHE_SIZE = 100;

function Sudoswap(web3Provider, pKey = null) {
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

  this.curveUtils = new CurveUtils(this);

  // pass pkey for buy and sell functionality
  if (pKey) {
    const wallet = new ethers.Wallet(pKey);
    this.signer = wallet.connect(this.provider);
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

Sudoswap.prototype.getSigner = async function () {
  // if connected via metamask
  if (this.isWeb3Provider) {
    await this.provider.send("eth_requestAccounts", []);
    return this.provider.getSigner();
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
}

// Instantiate the router
Sudoswap.prototype.router = async function () {
  const chainId = (await this.getNetwork());

  return new Router(this, chainId);
};

Sudoswap.prototype.getCurveUtils = function() {
  return this.curveUtils;
}

Sudoswap.prototype.formatDelta = function (val, type) {
  if (type == "linear") {
    return ethers.utils.parseUnits(val, "ether").toString();
  } else {
    // example val 0.05 = 5%
    return 1e18 + val * 1e17;
  }
};

Sudoswap.prototype.formatFee = function (val) {
  //example val 0.05 = 5%
  return ethers.utils.parseUnits(val, "ether").toString();
};

module.exports = Sudoswap;
