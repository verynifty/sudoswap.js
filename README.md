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
  transactionHash: '0x843a0612826b6820383fd8b5b08e97c8645221ee8f9622bcf3ea9ed7c1bfebc1',
  blockNumber: 15391750,
  nfts: [ '4024' ],
  nbNfts: 1,
  buyer: '0x095aca033F31708Bf2542F15f7C5AEAFFA9B8e0b',
  fee: '30000000000000000',
  delta: '1100000000000000000',
  lpFee: '103321068658202847',
  protocolFee: '17220178109700474',
  inputValue: '3564576868707998237',
  pricePerNft: '3564576868707998237',
  priceBefore: '3130941474490995379',
  priceAfter: '3571014492753623300',
  timestamp: 1661191376,
  pool: '0x451018623f2ea29a625ac5e051720eeac2b0e765',
  logIndex: 130
 },
 {
  type: 'NFT_IN_POOL',
  transactionHash: '0xabd28282f9f3b3b074e57c0a7fbb0adbf67def90b3dddba43cd088aef957fe65',
  blockNumber: 15391959,
  nfts: [ '7309' ],
  nbNfts: 1,
  buyer: '0x451018623F2EA29A625Ac5e051720eEAc2b0E765',
  fee: '30000000000000000',
  delta: '1030000000000000000',
  lpFee: '117843478260869568',
  protocolFee: '19640579710144928',
  outputValue: '3790631884057971129',
  pricePerNft: '3790631884057971129',
  priceBefore: '3928115942028985625',
  priceAfter: '3571014492753623291',
  timestamp: 1661194031,
  pool: '0x451018623f2ea29a625ac5e051720eeac2b0e765'
 }
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

// Approve the router to spend your nft if not already approved
const tx = await router.approveCollection(nftAddress)

// Check if the router was approved to spend your nft
const isApprovedForRouter = await router.isApprovedForRouter(nftAddress)

```


### Utils

Utilitiy functions to make it easier simulating behaviour.

```javascript
const utils = sudo.utils;

utils.getBuyInfo(curve, fee, delta, spotPrice, nbNfts) // simulates curve. returns: inputValue, newDelta, lpFee, protocolFee, newSpotPrice
utils.getSellInfo(curve, fee, delta, spotPrice, nbNfts) //simulates curve returns: outputValue, newDelta, lpFee, protocolFee, newSpotPrice
utils.formatDelta("0.05", "exponential") // returns correct format for a 5% exponential curve.
utils.formatFee("0.05") // returns correct format for a 5% fee.

```





