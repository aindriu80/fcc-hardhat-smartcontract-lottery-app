const { network, ethers } = require('hardhat')
const { developmentChains,VERIFICATION_BLOCK_CONFIRMATIONS, networkConfig } = require('../helper-hardhat-config')
const { verify } = require('../utils/verify')

const VRF_SUB_FUND_AMOUNT = ethers.utils.parseEther("1") // 1 ETH or 1^18

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments
  const { deployer } = await getNamedAccounts()
  const chainId = network.config.chainId
    let vrfCoordinatorV2Address, subscriptionId, vrfCoordinatorV2Mock

    if (chainId == 31337) {
        vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock")
    vrfCoordinatorV2Address = vrfCoordinatorV2Mock.address
    const transactionResponse = await vrfCoordinatorV2Mock.createSubscription()
        const transactionReceipt = await transactionResponse.wait()
    subscriptionId = transactionReceipt.events[0].args.subId
    // Fund the subsciption
    // Usually, you'd need the link token on a real network

    await vrfCoordinatorV2Mock.fundSubscription(subscriptionId, VRF_SUB_FUND_AMOUNT)
  } else {
    vrfCoordinatorV2Address = networkConfig[chainId]['vrfCoordinatorV2']
    subscriptionId = networkConfig[chainId]['subscriptionId']
  }

  const waitBlockConfirmations = developmentChains.includes(network.name)
    ? 1
    : VERIFICATION_BLOCK_CONFIRMATIONS

  log('----------------------------------------------------')

  const arguments = [
    vrfCoordinatorV2Address,
    subscriptionId,
    networkConfig[chainId]['gasLane'],
    networkConfig[chainId]['keepersUpdateInterval'],
    networkConfig[chainId]['raffleEntranceFee'],
    networkConfig[chainId]['callbackGasLimit'],
  ]
  const raffle = await deploy('Raffle', {
    from: deployer,
    args: arguments,
    log: true,
    waitConfirmations: waitBlockConfirmations,
  })
  // Verify the deployment
  console.log('verifiying the deployment', process.env.ETHERSCAN_API_KEY)
  if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
    log('Verifying....')
    await verify(raffle.address, arguments)
  }
  log('------------------------------------------------------------------------------')
}
module.exports.tags = ['all', 'raffle']
