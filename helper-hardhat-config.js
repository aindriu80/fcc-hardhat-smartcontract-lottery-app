const { ethers } = require('hardhat')

const networkConfig = {
  default: {
    name: 'hardhat',
    keepersUpdateInterval: '30',
  },
  31337: {
    name: 'localhost',
    subscriptionId: '588',
    gasLane: '0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc', // 30 gwei
    keepersUpdateInterval: '30',
    // raffleEntranceFee: '100000000000000000', // 0.1 ETH
    raffleEntranceFee: ethers.utils.parseEther('0.01'), // 0.1 ETH
    callbackGasLimit: '500000', // 500,000 gas
    interval: '30',
  },
  4: {
    name: 'goerli',
    subscriptionId: '4120',
    gasLane: '0x79d3d8832d904592c0bf9818b621522c988bb8b0c05cdc3b15aea1b6e8db0c15',
    keepersUpdateInterval: '30',
    // raffleEntranceFee: '100000000000000000', // 0.1 ETH
    raffleEntranceFee: ethers.utils.parseEther('0.01'), // 0.1 ETH
    callbackGasLimit: '500000', // 500,000
    vrfCoordinatorV2: '0x271682DEB8C4E0901D1a1550aD2e64D568E69909',
  },
  1: {
    name: 'mainnet',
    keepersUpdateInterval: '30',
  },
  gasReporter: {
    enabled: false,
    currency: 'USD',
    outputFile: 'gas-report.txt',
    noColors: true,
  },
}

const developmentChains = ['hardhat', 'localhost']
const VERIFICATION_BLOCK_CONFIRMATIONS = 6
const frontEndContractsFile =
  '../fcc-nextjs-smartcontract-lottery-app/constants/contractAddresses.json'
const frontEndAbiFile = '../fcc-nextjs-smartcontract-lottery-app/constants/abi.json'
module.exports = {
  networkConfig,
  developmentChains,
  VERIFICATION_BLOCK_CONFIRMATIONS,
  frontEndContractsFile,
  frontEndAbiFile,
}
