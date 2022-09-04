require("dotenv").config();

const sudoswap = require("./src/Sudoswap.js");
const { ethers } = require("ethers");

(async () => {
  try {
    const sudo = new sudoswap(
      `https://eth-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY}`,
    );


    const pool = sudo.getPool("0x58a474582ae4547caee0b6ddb9fa0f91bddaabf8"); //initiate random pool based on chain id

    console.log(await pool.getCurve())
    let trades = await pool.getTradesOut();
    return

    // =============================================================
    //                   GET POOL DATA
    // =============================================================
/*
    let curveUtils = sudo.getCurveUtils()

    let fee = sudo.formatFee("0.01");
    let delta = sudo.formatDelta("0.005", "exponential");

    console.log("Fee:", ethers.utils.formatEther(fee + ""))
    console.log("Delta:", ethers.utils.formatEther(delta + ""))
    spotPrice = "1000000000000000000"
    for (let index = 0; index < 10; index++) {
      let i = curveUtils.getBuyInfo("EXPONENTIAL", fee, delta, spotPrice, 1)
      spotPrice = i.newSpotPrice;
     // console.log(i)
      console.log(ethers.utils.formatEther(i.inputValue), ethers.utils.formatEther(i.newSpotPrice))
    }
    return;
    const pool = sudo.getPool("0x5caf332dca4e6c9e69d52f320c21e74845353db0"); //initiate random pool based on chain id

    console.log(await pool.getCurve())
    let trades = await pool.getTrades();
    console.log(trades);
*/
  } catch (e) {
    console.log(e);
  }
})();
