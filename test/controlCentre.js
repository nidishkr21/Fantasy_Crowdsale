const MockDFSACrowdsale = artifacts.require('./helpers/MockDFSACrowdsale.sol');
const MockDFSBCrowdsale = artifacts.require('./helpers/MockDFSBCrowdsale.sol');
const DFSACrowdsale = artifacts.require('./crowdsale/A/DFSACrowdsale.sol');
const DFSTokenA = artifacts.require('./token/A/DFSTokenA.sol');
const DFSBCrowdsale = artifacts.require('./crowdsale/B/DFSBCrowdsale.sol');
const DFSTokenB = artifacts.require('./token/B/DFSTokenB.sol');
const DataCentre = artifacts.require('./token/DataCentre.sol');
const ControlCentre = artifacts.require('./controlCentre/ControlCentre.sol');
const MultisigWallet = artifacts.require('./multisig/solidity/MultiSigWalletWithDailyLimit.sol');
import {advanceBlock} from './helpers/advanceToBlock';
import latestTime from './helpers/latestTime';
import increaseTime from './helpers/increaseTime';
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
      dfsACrowdsale = await MockDFSACrowdsale.new(startTime, PRE_SALE_DAYS, tokenA.address, multisigWallet.address);
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

    it('should allow to finish minting using controlCentre', async () => {
      // checking cap details
      await dfsACrowdsale.addAdmin(controlCentre.address);
      await controlCentre.finishMinting(dfsACrowdsale.address);
      const stateCrowdsale = await dfsACrowdsale.paused.call();
      const owner = await tokenA.owner.call();
      const mintingStatus = await tokenA.mintingFinished.call();
      assert.equal(stateCrowdsale, true, 'crowdsale not paused');
      assert.equal(mintingStatus, true, 'token not unpaused');
      assert.equal(owner, accounts[0], 'ownership not transferred to multisig');
      try {
        await dfsACrowdsale.admins.call(1);
        assert.fail('should have failed before');
      } catch(error) {
        assertJump(error);
      }
    });

    it('should allow to start minting using controlCentre', async () => {
      // checking cap details
      await dfsACrowdsale.addAdmin(controlCentre.address);
      await controlCentre.finishMinting(dfsACrowdsale.address);

      await tokenA.transferOwnership(dfsACrowdsale.address);
      await dfsACrowdsale.addAdmin(controlCentre.address);

      await controlCentre.startMinting(dfsACrowdsale.address);
      const stateCrowdsale = await dfsACrowdsale.paused.call();
      const mintingStatus = await tokenA.mintingFinished.call();
      assert.equal(stateCrowdsale, false, 'crowdsale not unpaused');
      assert.equal(mintingStatus, false, 'token not unpaused');
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

    it('should allow to start another crowdsale using crowdsale after succesful completetion of the first one', async () => {

      const amountEth = [new BigNumber(15000).mul(MOCK_ONE_ETH), new BigNumber(62500).mul(MOCK_ONE_ETH)];

      const INVESTORS = accounts[4];
      await dfsACrowdsale.buyTokens(INVESTORS, {value: amountEth[0], from: INVESTORS});

      // forward time by PRE_SALE_DAYS days
      await increaseTime(86400 * PRE_SALE_DAYS);
      await dfsACrowdsale.buyTokens(INVESTORS, {value: amountEth[1], from: INVESTORS});

      // check succesful completetion
      const totalSupply = [(await dfsACrowdsale.totalSupply.call(0)).toNumber(), (await dfsACrowdsale.totalSupply.call(1)).toNumber()];
      const softCap = [(await dfsACrowdsale.softCap.call(0)).toNumber(), (await dfsACrowdsale.softCap.call(1)).toNumber()];
      const initialSupply = await tokenA.INITIAL_SUPPLY.call();
      const tokenTotalSupply = await tokenA.totalSupply.call();

      assert.equal(totalSupply[0], softCap[0]);
      assert.equal(totalSupply[1], softCap[1]);
      assert.equal(initialSupply.add(totalSupply[0]).add(totalSupply[1]).toNumber(), tokenTotalSupply.toNumber());


      // finish the first crowdsale and transfer ownership of token to escrowCouncil
      await dfsACrowdsale.addAdmin(controlCentre.address);
      await controlCentre.finishMinting(dfsACrowdsale.address);

      // deploy new crowdsale contract
      const startTime1 = latestTime();

      const dfsACrowdsaleNew = await MockDFSACrowdsale.new(startTime1, PRE_SALE_DAYS, tokenA.address, multisigWallet.address);
      await tokenA.transferOwnership(dfsACrowdsaleNew.address);
      await dfsACrowdsaleNew.addAdmin(controlCentre.address);
      await controlCentre.startMinting(dfsACrowdsaleNew.address);

      // check the buy function and balance
      const NEW_INVESTOR = accounts[5];
      await dfsACrowdsaleNew.buyTokens(NEW_INVESTOR, {value: MOCK_ONE_ETH, from: INVESTORS});

      const balance = await tokenA.balanceOf.call(NEW_INVESTOR);
      assert.equal(balance.toNumber(), MOCK_ONE_ETH*4000);
    });

    it('should allow to upgrade token contract using controlCentre', async () => {

      const swapRate = new BigNumber(4000);
      const INVESTOR = accounts[4];
      const BENEFICIARY = accounts[5];
      // buy tokens
      await dfsACrowdsale.buyTokens(INVESTOR, {value: MOCK_ONE_ETH, from: INVESTOR});
      const tokensBalance = await tokenA.balanceOf.call(INVESTOR);
      const tokensAmount = swapRate.mul(MOCK_ONE_ETH);
      assert.equal(tokensBalance.toNumber(), tokensAmount.toNumber(), 'tokens not deposited into the INVESTOR balance');

      // begin the upgrade process deploy new token contract
      await dfsACrowdsale.addAdmin(controlCentre.address);

      const dataCentre = await DataCentre.at(await tokenA.dataCentreAddr());
      const tokenNew = await DFSTokenA.new(dataCentre.address);

      await controlCentre.transferDataCentreOwnership(dfsACrowdsale.address, tokenNew.address);
      const dataCentreSet = await tokenNew.dataCentreAddr.call();
      assert.equal(dataCentreSet, dataCentre.address, 'dataCentre not set');


      // try a transfer operation in the new token contract
      await tokenNew.transfer(BENEFICIARY, tokensBalance, {from: INVESTOR});
      const tokenBalanceTransfered = await tokenA.balanceOf.call(BENEFICIARY);
      assert.equal(tokensBalance.toNumber(), tokenBalanceTransfered.toNumber(), 'tokens not transferred');
    });
  })

  describe('#CrowdsaleB', () => {
    let tokenB;
    let dfsBCrowdsale;

    beforeEach(async () => {
      await advanceBlock();
      const startTime = latestTime();
      tokenB = await DFSTokenB.new();
      dfsBCrowdsale = await MockDFSBCrowdsale.new(startTime, PRE_SALE_DAYS, tokenB.address, multisigWallet.address);
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

    it('should allow to finish minting using controlCentre', async () => {
      // checking cap details
      await dfsBCrowdsale.addAdmin(controlCentre.address);
      await controlCentre.finishMinting(dfsBCrowdsale.address);
      const stateCrowdsale = await dfsBCrowdsale.paused.call();
      const owner = await tokenB.owner.call();
      const mintingStatus = await tokenB.mintingFinished.call();
      assert.equal(stateCrowdsale, true, 'crowdsale not paused');
      assert.equal(mintingStatus, true, 'token not unpaused');
      assert.equal(owner, accounts[0], 'ownership not transferred to multisig');
      try {
        await dfsBCrowdsale.admins.call(1);
        assert.fail('should have failed before');
      } catch(error) {
        assertJump(error);
      }
    });

    it('should allow to start minting using controlCentre', async () => {
      // checking cap details
      await dfsBCrowdsale.addAdmin(controlCentre.address);
      await controlCentre.finishMinting(dfsBCrowdsale.address);

      await tokenB.transferOwnership(dfsBCrowdsale.address);
      await dfsBCrowdsale.addAdmin(controlCentre.address);

      await controlCentre.startMinting(dfsBCrowdsale.address);
      const stateCrowdsale = await dfsBCrowdsale.paused.call();
      const mintingStatus = await tokenB.mintingFinished.call();
      assert.equal(stateCrowdsale, false, 'crowdsale not unpaused');
      assert.equal(mintingStatus, false, 'token not unpaused');
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

    it('should allow to start another crowdsale using crowdsale after succesful completetion of the first one', async () => {

      const amountEth = [new BigNumber(37500).mul(MOCK_ONE_ETH), new BigNumber(62500).mul(MOCK_ONE_ETH)];

      const INVESTORS = accounts[4];
      await dfsBCrowdsale.buyTokens(INVESTORS, {value: amountEth[0], from: INVESTORS});

      // forward time by PRE_SALE_DAYS days
      await increaseTime(86400 * PRE_SALE_DAYS);
      await dfsBCrowdsale.buyTokens(INVESTORS, {value: amountEth[1], from: INVESTORS});

      // check succesful completetion
      const totalSupply = [(await dfsBCrowdsale.totalSupply.call(0)).toNumber(), (await dfsBCrowdsale.totalSupply.call(1)).toNumber()];
      const softCap = [(await dfsBCrowdsale.softCap.call(0)).toNumber(), (await dfsBCrowdsale.softCap.call(1)).toNumber()];
      const initialSupply = await tokenB.INITIAL_SUPPLY.call();
      const tokenTotalSupply = await tokenB.totalSupply.call();

      assert.equal(totalSupply[0], softCap[0]);
      assert.equal(totalSupply[1], softCap[1]);
      assert.equal(initialSupply.add(totalSupply[0]).add(totalSupply[1]).toNumber(), tokenTotalSupply.toNumber());


      // finish the first crowdsale and transfer ownership of token to escrowCouncil
      await dfsBCrowdsale.addAdmin(controlCentre.address);
      await controlCentre.finishMinting(dfsBCrowdsale.address);

      // deploy new crowdsale contract
      const startTime1 = latestTime();

      const dfsBCrowdsaleNew = await MockDFSACrowdsale.new(startTime1, PRE_SALE_DAYS, tokenB.address, multisigWallet.address);
      await tokenB.transferOwnership(dfsBCrowdsaleNew.address);
      await dfsBCrowdsaleNew.addAdmin(controlCentre.address);
      await controlCentre.startMinting(dfsBCrowdsaleNew.address);

      // check the buy function and balance
      const NEW_INVESTOR = accounts[5];
      await dfsBCrowdsaleNew.buyTokens(NEW_INVESTOR, {value: MOCK_ONE_ETH, from: INVESTORS});

      const balance = await tokenB.balanceOf.call(NEW_INVESTOR);
      assert.equal(balance.toNumber(), MOCK_ONE_ETH*4000);
    });

    it('should allow to upgrade token contract using controlCentre', async () => {

      const swapRate = new BigNumber(800);
      const INVESTOR = accounts[4];
      const BENEFICIARY = accounts[5];
      // buy tokens
      await dfsBCrowdsale.buyTokens(INVESTOR, {value: MOCK_ONE_ETH, from: INVESTOR});
      const tokensBalance = await tokenB.balanceOf.call(INVESTOR);
      const tokensAmount = swapRate.mul(MOCK_ONE_ETH);
      assert.equal(tokensBalance.toNumber(), tokensAmount.toNumber(), 'tokens not deposited into the INVESTOR balance');

      // begin the upgrade process deploy new token contract
      await dfsBCrowdsale.addAdmin(controlCentre.address);

      const dataCentre = await DataCentre.at(await tokenB.dataCentreAddr());
      const tokenNew = await DFSTokenB.new(dataCentre.address);

      await controlCentre.transferDataCentreOwnership(dfsBCrowdsale.address, tokenNew.address);
      const dataCentreSet = await tokenNew.dataCentreAddr.call();
      assert.equal(dataCentreSet, dataCentre.address, 'dataCentre not set');


      // try a transfer operation in the new token contract
      await tokenNew.transfer(BENEFICIARY, tokensBalance, {from: INVESTOR});
      const tokenBalanceTransfered = await tokenB.balanceOf.call(BENEFICIARY);
      assert.equal(tokensBalance.toNumber(), tokenBalanceTransfered.toNumber(), 'tokens not transferred');
    });
  });
})
