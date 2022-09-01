# sudoswap.js
An unofficial library to make it easier to work with sudoswap in JS.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)


> This is a work in progress, issues and PR are welcome.

## Features

- Wrap contract calls to make it easier to interact with pools/router from JS.
- Parse historical trade events of pools.
- Helpers to format sudo related data such as delta and fee.


# Documentation

## Installation

`npm install @musedao/sudoswap.js`

```javascript

const sudoswap = require("@musedao/sudoswap.js");

const sudo = new sudoswap(`https://eth-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY}`, process.env.PRIVATE_KEY); //RPC and optional private key if used for sending transactions

// Or you can pass a web3 provider exposed by metamask/walletconnect 
// window.ethereum.enable();
//const sudo = new sudoswap(window.ethereum)

const pool = sudo.getPool("0x6210e6229aec95d17f57dab93e042013d7d3603c"); //any sudo pool
const router = sudo.router(); //use the router

```

## Sudo

```javascript
sudo.formatDelta("0.05", "exponential") // returns correct format for a 5% exponential curve.
sudo.formatFee("0.05") // returns correct format for a 5% fee.

```

## Pool

### Getters

```javascript
pool.getSellNFTQuote(nbNFT) //get x NFTs sell quote
pool.getBuyNFTQuote(nbNFT) //get x NFTs buy quote
pool.getType() // Type of pool: TRADE/SELL/BUY
pool.getNFT() // Address of the NFT
pool.getDelta()
pool.getSpotPrice()
pool.getFee()
pool.getOwner() // return owner of pool
pool.getCurve() // EXPONENTIAL or LINEAR
pool.getAssetRecipient()
pool.getAllHeldIds() // return all nft ids in the pool
pool.getNFTContract() // return an ethers.js instance of the ERC721 contract
pool.getPoolContract() // return an ethers.js instance of the pool contract
```

### History

```javascript
pool.getTrades()
```

Returns an array containing all past trades from the pool:

```javascript
[
    {
    type: 'NFT_OUT_POOL',
    transactionHash: '0x60272ce4cd5e782929466eae3c473a36738255671c27a2b83cf5d2fa2d00d4fb',
    blockNumber: 15423334,
    nfts: [ '437', '291' ],
    nbNfts: 2,
    buyer: '0xE0982E0d39eeE312017c58DBa76c99Ca59b8A958',
    priceBefore: '40128478439841997',
    priceAfter: '48555458912208816',
    timestamp: 1661627205,
    pool: '0x6210e6229aec95d17f57dab93e042013d7d3603c',
    logIndex: 387
  },
  {
    type: 'NFT_IN_POOL',
    transactionHash: '0x66ca9107497fae4cebb1738a168bd83d305c5101c8adb8294783615472aa2738',
    blockNumber: 15424791,
    nfts: [ '1318', '1564' ],
    nbNfts: 2,
    buyer: '0x6210e6229AEc95d17f57DAB93e042013d7D3603C',
    priceBefore: '48555458912208816',
    priceAfter: '40128478439841996',
    timestamp: 1661647692,
    pool: '0x6210e6229aec95d17f57dab93e042013d7d3603c'
  },...
]
```

## Router

To execute trades via the router you need to pass a private key when intializing sudoswap js.

```javascript

const router = await sudo.router();


await router.isApprovedForRouter(nftCollection); //check if signer gave approval to the router for spend

const tx = await router.approveCollection(nftCollection); //set approval from nft collection to the router if wasn't set.

//buy any nfts from pools
const tx = await router.swapETHForAnyNFTs(
  swapList,
  ethRecipient,
  nftRecipient,
  deadline,
  ethAmount
) 

//buy specific nft ids from pool
const tx = await router.swapETHForSpecificNFTs(
  swapList,
  ethRecipient,
  nftRecipient,
  deadline,
  ethAmount
)

// Sell nfts
const tx = await router.swapNFTsForToken(
  swapList,
  minOutput,
  tokenRecipient,
  deadline
)

```


### Curve Utils

Enable simulating curve behaviour locally:

```
const curveUtils = sudo.getCurveUtils();

curveUtils.getBuyInfo(curve, fee, delta, spotPrice, nbNfts) // returns: inputValue, protocolFee, newDelta, lpFee, protocolFee, newSpotPrice
curveUtils.getSellInfo(curve, fee, delta, spotPrice, nbNfts) //returns: outputValue, protocolFee, newDelta, lpFee, protocolFee, newSpotPrice

```





