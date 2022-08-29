# sudoswapjs
An unofficial library to make it easier to work with SudoSwap in JS.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)


> This is a work in progress, issues and PR are welcome.

## Features

- Wrap contract calls to make it easier to interact with pools/router from JS.
- Parse historical trade events of pools.


## Documentation
## Sudo

## Pool

### Getters

```
pool.getType() // Type of pool: TRADE/SELL/BUY
pool.getNFT() // Address of the NFT
pool.getDelta()
pool.getSpotPrice()
pool.getFee()
pool.getAssetRecipient()
pool.getNFTContract() // return an ethers.js instance of the ERC721 contract
pool.getPoolContract() // return an ethers.js instance of the pool contract
```





