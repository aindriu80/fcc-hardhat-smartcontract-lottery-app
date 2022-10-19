const { ethers } = require('hardhat')
const fs = require('fs')

const FRONT_END_LOCATION = '../fcc-nextjs-smartcontract-lottery-app/constants/contractAddress.json'

const FRONT_END_ABI_FILE = '../fcc-nextjs-smartcontract-lottery-app/constants/abi.json'
module.exports = async function () {
  if (process.env.UPDATE_FRONT_END) {
    console.log('Updating Front end....')
    updateContractAddresses()
    updateAbi()
  }
}

async function updateAbi() {
  const raffle = await ethers.getContract('Raffle')
  fs.writeFileSync(FRONT_END_ABI_FILE, raffle.interface.format(ethers.utils.FormatTypes.json))
}

async function updateContractAddresses() {
  const raffle = await ethers.getContract('Raffle')
  const chainId = network.config.chainId.toString()
  const currentAddresses = JSON.parse(fs.readFileSync(FRONT_END_LOCATION, 'utf8'))
  if (chainId in currentAddresses) {
    if (!currentAddresses[chainId].includes(raffle.address)) {
      currentAddress[chainId].push(raffle.address)
    }
  }
  {
    currentAddresses[chainId] = [raffle.address]
  }
  fs.writeFileSync(FRONT_END_LOCATION, JSON.stringify(currentAddresses))
}

module.exports.tags = ['all', 'frontend']
