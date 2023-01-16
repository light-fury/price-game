module.exports = [
  "0x9316af5Dae9506eCacb7Abec69b5063A83c941a3",
  "0x232b71A3E92307B4FF13B99d604E31BA8e731fb9",
  "BTC/USDT Market",
  [{            
    id: 0,
    interval: 60, // 60s = 1m,
    intervalBlocks: 10, // 60s means 10 blocks,
    bufferBlocks: 0
  }, {
    id: 1,
    interval: 300, // 300s = 5m,
    intervalBlocks: 50,
    bufferBlocks: 0
  }, {
    id: 2,
    interval: 900, // 900s = 15m,
    intervalBlocks: 150,
    bufferBlocks: 0
  }],
  "0xe8A06462628b49eb70DBF114EA510EB3BbBDf559",
  "0x4Ab0eaC00D1A5B05e7a484f8678Dce68B849545A",
  "100000000000000000"
];