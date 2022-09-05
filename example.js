require("dotenv").config();

const sudoswap = require("./src/Sudoswap.js");

const POOLS = {
  1: "0x6210e6229aec95d17f57dab93e042013d7d3603c", // random mainnet pool
  4: "0x349dC7d50747304155F4eCA46eD1F602AAa01a14", // random rinkeby pool
};

(async () => {
  try {
    const sudo = new sudoswap(
      `https://eth-rinkeby.g.alchemy.com/v2/${process.env.ALCHEMY}`,
      process.env.PRIVATE_KEY //optional: if you plan to execute trades.
    );
    const chainId = (await sudo.provider.getNetwork()).chainId;

    // =============================================================
    //                   GET POOL DATA
    // =============================================================

    const pool = sudo.getPool(POOLS[chainId]); //initiate random pool based on chain id

    let nft = await pool.getNFT();
    console.log(nft);

    let spotPrice = await pool.getSpotPrice();
    console.log(spotPrice);

    let trades = await pool.getTrades();
    console.log(trades);
    // return;
    let type = await pool.getType();
    console.log(type);

    let buyQuote = await pool.getBuyNFTQuote(1);
    console.log(buyQuote);

    let sellQuote = await pool.getSellNFTQuote(1);
    console.log(sellQuote);

    let owner = await pool.getOwner();
    console.log("owner ", owner);

    // =============================================================
    //                   TEST HELPERS
    // =============================================================

    let formatDelta = sudo.utils.formatDelta("0.05", "exponential");
    console.log(formatDelta);

    let formatFee = sudo.utils.formatFee("0.05", "exponential");
    console.log(formatFee);

    // =============================================================
    //                   BUY WITH THE ROUTER
    // =============================================================

    const myWallet = sudo.signer.address;

    const date = new Date();
    const dateTimeInSeconds = Math.floor(date.getTime() / 1000);
    const deadline = dateTimeInSeconds + 300; // 5 mins later

    const swapList = [
      { pair: "0x349dC7d50747304155F4eCA46eD1F602AAa01a14", numItems: 1 }, //random rinkeby nft
    ];

    const poolToTrade = sudo.getPool(
      "0x349dC7d50747304155F4eCA46eD1F602AAa01a14"
    );

    const { inputAmount } = await poolToTrade.getBuyNFTQuote(1);

    const router = await sudo.router();

    const buyTx = await router.swapETHForAnyNFTs(
      swapList,
      myWallet, //eth recipient
      myWallet, //nft recipient
      deadline,
      inputAmount.toString() //eth amount
    );

    console.log("bought 1 nft ", buyTx);
  } catch (e) {
    console.log(e);
  }
})();
