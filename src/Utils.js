const { ethers } = require("ethers");

const {
  getBuyInfo,
  getSellInfo,
  addressToCurveType,
} = require("./utils/CurveUtils");

function Utils() {}

// =============================================================
//                   Format Utils
// =============================================================

Utils.prototype.formatDelta = function (val, type) {
  if (type.toUpperCase() == "LINEAR") {
    return ethers.utils.parseUnits(val, "ether").toString();
  } else if (type.toUpperCase() == "EXPONENTIAL") {
    // example val 0.05 = 5%
    // This is more safe for type
    return ethers.utils
      .parseUnits("1", "ether")
      .add(ethers.utils.parseUnits(val, "ether").div(100))
      .toString();
    // return 1e18 + val * 1e17;
  } else if (type.toUpperCase() == "XYK") {
    return;
  }
  throw "Uknown curve";
};

Utils.prototype.formatFee = function (val) {
  //example val 0.05 = 5%
  return ethers.utils.parseUnits(val, "ether").toString();
};

// =============================================================
//                   Curve Utils
// =============================================================

Utils.prototype.getBuyInfo = function (curve, fee, delta, spotPrice, nbNfts) {
  return getBuyInfo(curve, fee, delta, spotPrice, nbNfts);
};

Utils.prototype.getSellInfo = function (curve, fee, delta, spotPrice, nbNfts) {
  return getSellInfo(curve, fee, delta, spotPrice, nbNfts);
};

Utils.prototype.addressToCurveType = function (network, address) {
  return addressToCurveType(network, address);
};

module.exports = Utils;
