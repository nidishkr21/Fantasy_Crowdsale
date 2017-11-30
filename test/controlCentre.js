const DFSACrowdsale = artifacts.require('./crowdsale/A/DFSACrowdsale.sol');
const DFSTokenA = artifacts.require('./token/A/DFSTokenA.sol');
const DFSBCrowdsale = artifacts.require('./crowdsale/B/DFSBCrowdsale.sol');
const DFSTokenB = artifacts.require('./token/B/DFSTokenB.sol');
const DataCentre = artifacts.require('./token/DataCentre.sol');
const ControlCentre = artifacts.require('./controlCentre/ControlCentre.sol');
const MultisigWallet = artifacts.require('./multisig/solidity/MultiSigWalletWithDailyLimit.sol');
import {advanceBlock} from './helpers/advanceToBlock';
import latestTime from './helpers/latestTime';
const BigNumber = require('bignumber.js');
const assertJump = require('./helpers/assertJump');
const ONE_ETH = web3.toWei(1, 'ether');
const MOCK_ONE_ETH = web3.toWei(0.000001, 'ether'); // diluted ether value for testing
const PRE_SALE_DAYS = 7;
const FOUNDERS = [web3.eth.accounts[1], web3.eth.accounts[2], web3.eth.accounts[3]];

contract('ControlCentre', (accounts) => {
  let multisigWallet;
  let controlCentre;

  beforeEach(async () => {
    multisigWallet = await MultisigWallet.new(FOUNDERS, 3, 10*MOCK_ONE_ETH);
    controlCentre = await ControlCentre.new();
  });

  describe('#CrowdsaleA', () => {
    let tokenA;
    let dfsACrowdsale;

    beforeEach(async () => {
      await advanceBlock();
      const startTime = latestTime();
      tokenA = await DFSTokenA.new();
      dfsACrowdsale = await DFSACrowdsale.new(startTime, PRE_SALE_DAYS, tokenA.address, multisigWallet.address);
      await tokenA.transferOwnership(dfsACrowdsale.address);
      await dfsACrowdsale.unpause();
    });

    it('should allow to pause CrowdsaleA using controlCentre', async () => {
      // checking cap details
      await dfsACrowdsale.addAdmin(controlCentre.address);
      await controlCentre.pauseCrowdsale(dfsACrowdsale.address);
      const stateCrowdsale = await dfsACrowdsale.paused.call();
      const stateToken = await tokenA.paused.call();
      assert.equal(stateCrowdsale, true, 'crowdsale not paused');
      assert.equal(stateToken, true, 'token not paused');
      try {
        await dfsACrowdsale.admins.call(1);
        assert.fail('should have failed before');
      } catch(error) {
        assertJump(error);
      }
    });

    it('should allow to unpause CrowdsaleA using controlCentre', async () => {
      // checking cap details
      await dfsACrowdsale.addAdmin(controlCentre.address);
      await controlCentre.pauseCrowdsale(dfsACrowdsale.address);
      await dfsACrowdsale.addAdmin(controlCentre.address);
      await controlCentre.unpauseCrowdsale(dfsACrowdsale.address);
      const stateCrowdsale = await dfsACrowdsale.paused.call();
      const stateToken = await tokenA.paused.call();
      assert.equal(stateCrowdsale, false, 'crowdsale not unpaused');
      assert.equal(stateToken, false, 'token not unpaused');
      try {
        await dfsACrowdsale.admins.call(1);
        assert.fail('should have failed before');
      } catch(error) {
        assertJump(error);
      }
    });

    it('should allow to transfer DataCentre ownership of DFSTokenA to FOUNDERS using controlCentre', async () => {
      // checking cap details
      await dfsACrowdsale.addAdmin(controlCentre.address);
      const dataCentreAddr = await tokenA.dataCentreAddr.call();
      const dataCentre = DataCentre.at(dataCentreAddr);
      await controlCentre.transferDataCentreOwnership(dfsACrowdsale.address, multisigWallet.address);
      const stateCrowdsale = await dfsACrowdsale.paused.call();
      const stateToken = await tokenA.paused.call();
      const ownerToken = await tokenA.owner.call();
      const ownerDataCentre = await dataCentre.owner.call()
      assert.equal(stateCrowdsale, true, 'crowdsale not paused');
      assert.equal(stateToken, true, 'token not paused');
      assert.equal(ownerToken, dfsACrowdsale.address, 'ownership not transferred');
      assert.equal(ownerDataCentre, multisigWallet.address,'ownership not transferred');
      try {
        await dfsACrowdsale.admins.call(1);
        assert.fail('should have failed before');
      } catch(error) {
        assertJump(error);
      }
    });

    it('should allow to return DataCentre ownership of DFSTokenA to token contract using controlCentre', async () => {
      // checking cap details
      const dataCentreAddr = await tokenA.dataCentreAddr.call();
      const dataCentre = DataCentre.at(dataCentreAddr);
      await dfsACrowdsale.addAdmin(controlCentre.address);
      await controlCentre.transferDataCentreOwnership(dfsACrowdsale.address, multisigWallet.address);
      await dfsACrowdsale.addAdmin(controlCentre.address);

      var dataCentreContract = web3.eth.contract(dataCentre.abi);
      var dataCentreContractInstance = dataCentreContract.at(dataCentre.address);
      var transferOwnershipData = dataCentreContractInstance.transferOwnership.getData(controlCentre.address);

      await multisigWallet.submitTransaction(dataCentre.address, 0, transferOwnershipData, {from: accounts[1]});
      await multisigWallet.confirmTransaction(0, {from: accounts[2]});
      await multisigWallet.confirmTransaction(0, {from: accounts[3]});

      await controlCentre.returnDataCentreOwnership(dfsACrowdsale.address);
      const stateCrowdsale = await dfsACrowdsale.paused.call();
      const stateToken = await tokenA.paused.call();
      const ownerToken = await tokenA.owner.call();
      const ownerDataCentre = await dataCentre.owner.call()
      assert.equal(stateCrowdsale, false, 'crowdsale not unpaused');
      assert.equal(stateToken, false, 'token not unpaused');
      assert.equal(ownerToken, dfsACrowdsale.address, 'ownership not transferred');
      assert.equal(ownerDataCentre, tokenA.address, 'ownership not transferred');
      try {
        await dfsACrowdsale.admins.call(1);
        assert.fail('should have failed before');
      } catch(error) {
        assertJump(error);
      }
    });
  })

  describe('#CrowdsaleB', () => {
    let tokenB;
    let dfsBCrowdsale;

    beforeEach(async () => {
      await advanceBlock();
      const startTime = latestTime();
      tokenB = await DFSTokenA.new();
      dfsBCrowdsale = await DFSACrowdsale.new(startTime, PRE_SALE_DAYS, tokenB.address, multisigWallet.address);
      await tokenB.transferOwnership(dfsBCrowdsale.address);
      await dfsBCrowdsale.unpause();
    });

    it('should allow to pause CrowdsaleB using controlCentre', async () => {
      // checking cap details
      await dfsBCrowdsale.addAdmin(controlCentre.address);
      await controlCentre.pauseCrowdsale(dfsBCrowdsale.address);
      const stateCrowdsale = await dfsBCrowdsale.paused.call();
      const stateToken = await tokenB.paused.call();
      assert.equal(stateCrowdsale, true, 'crowdsale not paused');
      assert.equal(stateToken, true, 'token not paused');
      try {
        await dfsBCrowdsale.admins.call(1);
        assert.fail('should have failed before');
      } catch(error) {
        assertJump(error);
      }
    });

    it('should allow to unpause CrowdsaleB using controlCentre', async () => {
      // checking cap details
      await dfsBCrowdsale.addAdmin(controlCentre.address);
      await controlCentre.pauseCrowdsale(dfsBCrowdsale.address);
      await dfsBCrowdsale.addAdmin(controlCentre.address);
      await controlCentre.unpauseCrowdsale(dfsBCrowdsale.address);
      const stateCrowdsale = await dfsBCrowdsale.paused.call();
      const stateToken = await tokenB.paused.call();
      assert.equal(stateCrowdsale, false, 'crowdsale not unpaused');
      assert.equal(stateToken, false, 'token not unpaused');
      try {
        await dfsBCrowdsale.admins.call(1);
        assert.fail('should have failed before');
      } catch(error) {
        assertJump(error);
      }
    });

    it('should allow to transfer DataCentre of DFSTokenB ownership to FOUNDERS using controlCentre', async () => {
      // checking cap details
      await dfsBCrowdsale.addAdmin(controlCentre.address);
      const dataCentreAddr = await tokenB.dataCentreAddr.call();
      const dataCentre = DataCentre.at(dataCentreAddr);
      await controlCentre.transferDataCentreOwnership(dfsBCrowdsale.address, multisigWallet.address);
      const stateCrowdsale = await dfsBCrowdsale.paused.call();
      const stateToken = await tokenB.paused.call();
      const ownerToken = await tokenB.owner.call();
      const ownerDataCentre = await dataCentre.owner.call()
      assert.equal(stateCrowdsale, true, 'crowdsale not paused');
      assert.equal(stateToken, true, 'token not paused');
      assert.equal(ownerToken, dfsBCrowdsale.address, 'ownership not transferred');
      assert.equal(ownerDataCentre, multisigWallet.address,'ownership not transferred');
      try {
        await dfsBCrowdsale.admins.call(1);
        assert.fail('should have failed before');
      } catch(error) {
        assertJump(error);
      }
    });

    it('should allow to return DataCentre ownership of DFSTokenB to token contract using controlCentre', async () => {
      // checking cap details
      const dataCentreAddr = await tokenB.dataCentreAddr.call();
      const dataCentre = DataCentre.at(dataCentreAddr);
      await dfsBCrowdsale.addAdmin(controlCentre.address);
      await controlCentre.transferDataCentreOwnership(dfsBCrowdsale.address, multisigWallet.address);
      await dfsBCrowdsale.addAdmin(controlCentre.address);

      var dataCentreContract = web3.eth.contract(dataCentre.abi);
      var dataCentreContractInstance = dataCentreContract.at(dataCentre.address);
      var transferOwnershipData = dataCentreContractInstance.transferOwnership.getData(controlCentre.address);

      await multisigWallet.submitTransaction(dataCentre.address, 0, transferOwnershipData, {from: accounts[1]});
      await multisigWallet.confirmTransaction(0, {from: accounts[2]});
      await multisigWallet.confirmTransaction(0, {from: accounts[3]});

      await controlCentre.returnDataCentreOwnership(dfsBCrowdsale.address);
      const stateCrowdsale = await dfsBCrowdsale.paused.call();
      const stateToken = await tokenB.paused.call();
      const ownerToken = await tokenB.owner.call();
      const ownerDataCentre = await dataCentre.owner.call()
      assert.equal(stateCrowdsale, false, 'crowdsale not unpaused');
      assert.equal(stateToken, false, 'token not unpaused');
      assert.equal(ownerToken, dfsBCrowdsale.address, 'ownership not transferred');
      assert.equal(ownerDataCentre, tokenB.address, 'ownership not transferred');
      try {
        await dfsBCrowdsale.admins.call(1);
        assert.fail('should have failed before');
      } catch(error) {
        assertJump(error);
      }
    });
  });
})
