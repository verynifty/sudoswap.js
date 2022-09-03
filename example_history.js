require("dotenv").config();

const sudoswap = require("./src/Sudoswap.js");
const { ethers } = require("ethers");

(async () => {
  try {
    const sudo = new sudoswap(
      `https://eth-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY}`,
    );

    // =============================================================
    //                   GET POOL DATA
    // =============================================================

    let curveUtils = sudo.getCurveUtils()

    let fee = sudo.formatFee("1");
    let delta = sudo.formatDelta("0.1", "linear");
    spotPrice = "1000000000000000000"
    for (let index = 0; index < 10; index++) {
      let i = curveUtils.getBuyInfo("LINEAR", fee, delta, spotPrice, 1)
      spotPrice = i.newSpotPrice;
      console.log(i.inputValue.toString(), i.newSpotPrice.toString())
    }
    return;
    const pool = sudo.getPool("0x5caf332dca4e6c9e69d52f320c21e74845353db0"); //initiate random pool based on chain id

    console.log(await pool.getCurve())
    let trades = await pool.getTrades();
    console.log(trades);

  } catch (e) {
    console.log(e);
  }
})();
