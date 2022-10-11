const { assert, expect } = require('chai')
const { getNamedAccounts, deployments, ethers, network } = require('hardhat')
const { developmentChains, networkConfig } = require('../../helper-hardhat-config')

developmentChains.includes(network.name)
  ? describe.skip
  : describe('Raffle Unit Tests', function () {
      let raffle, raffleEntranceFee, deployer

      beforeEach(async function () {
        deployer = (await getNamedAccounts()).deployer
        raffle = await ethers.getContract('Raffle', deployer)
        raffleEntranceFee = await raffle.getEntraceFee()
      })
      describe('fullfillRandomWords', function () {
        it('works with live Chainlink Keepers and Chainlink VRF, we get a random winner', async function () {
          // enter Raffle
          const startingTimeStamp = await raffle.getLatestTimeStamp()
          const accounts = await ethers.getSigners()
          await new Promise((resolve, reject) => {
            raffle.once('WinnerPicked', async () => {
              console.log('Winner Picked, event fired!! ')
              try {
                // add our asserts here
                const recentWinner = await raffle.getRecentWinner()
                const raffleState = await raffle.getRaffleState()
                const winnerEndingBalance = await accounts[0].getBalance()
                const endingTimeStamp = await raffle.getLatestTimeStamp()

                await expect(raffle.getPlayer(0)).to.be.reverted
                assert.equal(recentWinner.toString(), accounts[0])
                assert.equal(raffleState, 0)
                assert.equal(
                  winnerEndingBalance.toString(),
                  winnerStartingBalance.add(raffleEntranceFee.toString())
                )
                assert(endingTimeStamp > startingTimeStamp)
                resolve()
              } catch (error) {
                console.log(error)
                reject(error)
              }
              // Then entering the raffle
              await raffle.enterRaffle({ value: raffleEntranceFee })
              const winnerStartingBalance = await accounts[0].getBalance()
            })
            // and this code WONT complete until our listener has finished listening!!
          })
          // setup listener before we enter the raffle

          // Just in case the blockchain moves REALLY fast

          // await raffle.enterRaffle({value: raffleEntrance})
        })
      })
    })
