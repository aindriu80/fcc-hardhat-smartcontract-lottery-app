const { developmentChains } = require('../helper-hardhat-config')

module.exports = async function ({ getNamedAccount, deployments }) {
  const { deploy, log } = deployments
  const { deployer } = await getNamedAccounts()
  const chainId = network.config.chainId

  if (developmentChains.includes(network.name)) {
    log('local network detected! Deploying mocks...')
    //  deploy a mock vrfcoordinator...
  }
}
