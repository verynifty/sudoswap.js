const sudoswap = require("./src/Sudoswap.js");

(async () => {
  try {
    const sudo = new sudoswap(
      "https://eth-mainnet.g.alchemy.com/v2/_vDB38mJZ39GyrIYbhoFtEkxYVydis-o"
    );
    const pool = sudo.getPool("0x6210e6229aec95d17f57dab93e042013d7d3603c");

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

    let heldIds = await pool.getAllHeldIds();
    console.log(heldIds);

    let formatDelta = sudo.formatDelta("0.05", "exponential");
    console.log(formatDelta);

    let formatFee = sudo.formatFee("0.05", "exponential");
    console.log(formatFee);

    // use router
    const router = await sudo.router();
    // console.log(router.contract);
  } catch (e) {
    console.log(e);
  }
})();
