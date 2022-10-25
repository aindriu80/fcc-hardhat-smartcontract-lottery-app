const { ethers, network } = require('hardhat')

async function mockKeepers() {
  const raffle = await ethers.getContract('Raffle')
  const checkData = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(''))
  const { upkeepNeeded } = await raffle.callStatic.checkUpkeep(checkData)
  if (upkeepNeeded) {
    const tx = await raffle.performUpkeep(checkData)
    const txReceipt = await tx.wait(1)
    const requestId = txReceipt.events[1].args.requestId
    console.log(`Performed upkeep with RequestId: ${requestId}`)
    if (network.config.chainId == 31337) {
      await mockVrf(requestId, raffle)
    } else {
      console.log('No upkeep needed!')
    }
  }
}
mockKeepers()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
