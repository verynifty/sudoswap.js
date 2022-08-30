const { ethers } = require("ethers");

const CURVES = {
    1: {
        "0x5B6aC51d9B1CeDE0068a1B26533CAce807f883Ee": "LINEAR",
        "0x432f962D8209781da23fB37b6B59ee15dE7d9841": "EXPONENTIAL"
    },
    4: {
        "0x3764b9FE584719C4570725A2b5A2485d418A186E": "LINEAR",
        "0xBc6760B11e433D25aAf5c8fCBC6cE99b14aC5D52": "EXPONENTIAL"
    }
}

function CurveUtils(sudo) {
  this.sudo = sudo;
}

CurveUtils.prototype.addressToCurveType = function(network, address) {
    return CURVES[network][address];
}

CurveUtils.prototype.getBuyInfo = function(type, curve, fee, delta, spotPrice, nbNfts) {
    if (curve == 'EXPONENTIAL') {

    } else {

    }
}

CurveUtils.prototype.getSellInfo = function(type, curve, fee, delta, spotPrice, nbNfts) {
    if (curve == 'EXPONENTIAL') {

    } else {

    }
}


module.exports = CurveUtils;
