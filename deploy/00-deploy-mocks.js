const { developmentChains } = require('../helper-hardhat-config')

const BASE_FEE = ethers.utils.parseEther('0.25') //0.25 is the premium. It costs 0.25 LINK per request
const GAS_PRICE_LINK = 1e9 // 100000000 // link per gas. Calcuated value based on the gas price of the chain.

// Eth price $1,000,000.00
// Chainlink Nodes pay the gas fees to give us randomness to give us randomness & do external exeutino
// So the price of requsts chainge based on the price of gas

module.exports = async function ({ getNamedAccount, deployments }) {
  const { deploy, log } = deployments
  const { deployer } = await getNamedAccounts()
  const args = [BASE_FEE, GAS_PRICE_LINK]

  if (developmentChains.includes(network.name)) {
    log('local network detected! Deploying mocks...')
    //  deploy a mock vrfcoordinator...
    await deploy('VRFCoordinatorV2Mock', {
      from: deployer,
      log: true,
      args: args,
    })
    log('Mocks deployed')
    log('------------------------------------------------------------------')
  }
}
module.exports.tags = ['all', 'mocks']
