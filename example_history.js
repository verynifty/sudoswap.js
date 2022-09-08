require("dotenv").config();

const sudoswap = require("./src/Sudoswap.js");
const { ethers } = require("ethers");

(async () => {
  try {
    const sudo = new sudoswap(
      `https://eth-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY}`
    );

    // =============================================================
    //                   GET POOL DATA
    // =============================================================

    let archive = await sudo.hasNodeArchiveCapabilities()
    console.log(archive)
    let utils = sudo.utils;
    let factory = await sudo.factory();

    await factory.getAllPairs()

    return


    const pool = sudo.getPool("0x451018623f2ea29a625ac5e051720eeac2b0e765"); //initiate random pool based on chain id

    console.log(await pool.getCurve());
    let trades = await pool.getTrades();
    console.log(trades);

    /*

        const pool = sudo.getPool("0xb3041791fefe9284074713e4e14a6c4ddeeb57f9"); //initiate random pool based on chain id

    console.log(await pool.getCurve())
    let trades = await pool.getTradesOut();


    console.log("utils ", utils);

    let fee = utils.formatFee("0.01");
    let delta = utils.formatDelta("0.005", "exponential");
    console.log(delta);

    console.log("Fee:", ethers.utils.formatEther(fee));
    console.log("Delta:", ethers.utils.formatEther(delta));
    spotPrice = "1000000000000000000";
    for (let index = 0; index < 10; index++) {
      let i = utils.getBuyInfo("EXPONENTIAL", fee, delta, spotPrice, 1);
      spotPrice = i.newSpotPrice;
      // console.log(i)
      console.log(
        ethers.utils.formatEther(i.inputValue),
        ethers.utils.formatEther(i.newSpotPrice)
      );
    }
*/
  } catch (e) {
    console.log(e);
  }
})();
