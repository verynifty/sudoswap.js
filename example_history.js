require("dotenv").config();

const sudoswap = require("./src/Sudoswap.js");

(async () => {
  try {
    const sudo = new sudoswap(
      `https://eth-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY}`,
    );

    // =============================================================
    //                   GET POOL DATA
    // =============================================================

    let curveUtils = sudo.getCurveUtils()
    let i = curveUtils.getBuyInfo("LINEAR", 10000000, 0, 100000, 1)
    console.log(i)
    return;
    const pool = sudo.getPool("0x5caf332dca4e6c9e69d52f320c21e74845353db0"); //initiate random pool based on chain id

    console.log(await pool.getCurve())
    let trades = await pool.getTrades();
    console.log(trades);

  } catch (e) {
    console.log(e);
  }
})();
