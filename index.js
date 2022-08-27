const SudoSwap = require('./src/SudoSwap.js');

(async () => {
    try {

        const sudo = new SudoSwap("https://nodes.mewapi.io/rpc/eth")
        const pool = sudo.getPool("0x58a474582Ae4547CaEe0B6ddB9fa0f91BDDaABf8")

        let type = await pool.getType()
        console.log(type)
        
        let buyQuote = await pool.getBuyNFTQuote(1);
        console.log(buyQuote)

        let sellQuote = await pool.getSellNFTQuote(1);
        console.log(sellQuote)
    } catch (e) {
        console.log(e)
    }
})();