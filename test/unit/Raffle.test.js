const { assert, expect } = require('chai')
const { getNamedAccounts, developments, ethers, network } = require('hardhat')
const { developmentChains, networkConfig } = require('../../helper-hardhat-config')

!developmentChains.includes(network.name)
  ? describe.skip
  : describe('Raffle Unit Tests', function () {
      let raffle, vrfCoordinatorV2Mock, raffleEntranceFee, deployer, interval
      const chainId = network.config.chainId

      beforeEach(async function () {
        deployer = (await getNamedAccounts()).deployer
        await deployments.fixture(['all'])
        raffle = await ethers.getContract('Raffle', deployer)
        raffleEntranceFee = await raffle.getEntraceFee()
        vrfCoordinatorV2Mock = await ethers.getContract('VRFCoordinatorV2Mock', deployer)
        interval = await raffle.getInterval()
      })
      describe('constructor', function () {
        it('Initializes the raffle correctly', async function () {
          // Ideally we make our tests have just 1 assert per 'it'
          const raffleState = await raffle.getRaffleState()
          // const interval = await raffle.getInterval()
          assert.equal(raffleState.toString(), '0')
          assert.equal(interval.toString(), networkConfig[chainId]['interval'])
        })
      })

      describe('enterRaffle', function () {
        it("Reverts when you don't pay enough", async function () {
          await expect(raffle.enterRaffle()).to.be.revertedWith('Raffle__NotEnoughETHEntered')
        })

        it('records players when they enter', async function () {
          await raffle.enterRaffle({ value: raffleEntranceFee })
          const playerFromContract = await raffle.getPlayer(0)
          assert.equal(playerFromContract, deployer)
        })
        it('emits event on enter', async function () {
          await expect(raffle.enterRaffle({ value: raffleEntranceFee })).to.emit(
            raffle,
            'RaffleEnter'
          )
        })
        it("doesn't allow entrace when raffle is calculating", async function () {
          await raffle.enterRaffle({ value: raffleEntranceFee })
          await network.provider.send('evm_increaseTime', [interval.toNumber() + 1])
          await network.provider.send('evm_mine', [])
          // We pretend to be a Chainlnk keeper
          await raffle.performUpkeep([])
          await expect(raffle.enterRaffle({ value: raffleEntranceFee })).to.be.revertedWith(
            'Raffle__NotOpen'
          )
        })
      })
      describe('checkUpkeep', function () {
        it("returns false if people haven't sent any ETH", async function () {
          await network.provider.send('evm_increaseTime', [interval.toNumber() + 1])
          await network.provider.send('evm_mine', [])
          const { upkeepNeeded } = await raffle.callStatic.checkUpkeep([])
          assert(!upkeepNeeded)
        })
        it("returns false if raffle isn't open", async function () {
          await raffle.enterRaffle({ value: raffleEntranceFee })
          await network.provider.send('evm_increaseTime', [interval.toNumber() + 1])
          await network.provider.send('evm_mine', [])
          await raffle.performUpkeep('0x')
          const raffleState = await raffle.getRaffleState()
          const { upkeepNeeded } = await raffle.callStatic.checkUpkeep([])
          assert.equal(raffleState.toString(), '1')
          assert.equal(upkeepNeeded, false)
        })
        it("returns false if enough time hasn't passed", async function () {
          await raffle.enterRaffle({ value: raffleEntranceFee })
          await network.provider.send('evm_increaseTime', [interval.toNumber() - 1])
          await network.provider.request({ method: 'evm_mine', params: [] })
          const { upkeepNeeded } = await raffle.callStatic.checkUpkeep('0x')
          assert(!upkeepNeeded)
        })
        it('returns true if enough time has passed, has players, and is open', async function () {
          await raffle.enterRaffle({ value: raffleEntranceFee })
          await network.provider.send('evm_increaseTime', [interval.toNumber() + 1])
          await network.provider.request({ method: 'evm_mine', params: [] })
          const { upkeepNeeded } = await raffle.callStatic.checkUpkeep('0x')
          assert(upkeepNeeded)
        })
      })
      describe('performUpkeep', function () {
        it('it can only run if true', async function () {
          await raffle.enterRaffle({ value: raffleEntranceFee })
          await network.provider.send('evm_increaseTime', [interval.toNumber() + 1])
          await network.provider.send('evm_mine', [])
          const tx = await raffle.performUpkeep([])
          assert(tx)
        })
        it('reverts when checkupkeep is false', async function () {
          await expect(raffle.performUpkeep([])).to.be.revertedWith('Raffle__UpkeepNotNeeded')
        })
        it('updates the raffle state, emits and event, and calls the vrf coordinator', async function () {
          await raffle.enterRaffle({ value: raffleEntranceFee })
          await network.provider.send('evm_increaseTime', [interval.toNumber() + 1])
          await network.provider.request({ method: 'evm_mine', params: [] })
          const txResponse = await raffle.performUpkeep([])
          const txReceipt = await txResponse.wait(1)
          const requestId = txReceipt.events[1].args.requestId
          const raffleState = await raffle.getRaffleState()
          assert(requestId.toNumber() > 0)
          assert(raffleState.toString() == '1')
        })
      })
      describe('fulfillRandomWords', function () {
        beforeEach(async function () {
          await raffle.enterRaffle({ value: raffleEntranceFee })
          await network.provider.send('evm_increaseTime', [interval.toNumber() + 1])
          await network.provider.send('evm_mine', [])
        })
        it('can only be called after performUpkeep', async function () {
          await expect(
            vrfCoordinatorV2Mock.fulfillRandomWords(0, raffle.address)
          ).to.be.revertedWith('nonexistent request')
          await expect(
            vrfCoordinatorV2Mock.fulfillRandomWords(1, raffle.address)
          ).to.be.revertedWith('nonexistent request')
        })
      })
    })
