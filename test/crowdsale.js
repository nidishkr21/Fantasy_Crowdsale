const DFSACrowdsale = artifacts.require('./crowdsale/A/DFSACrowdsale.sol');
const DFSTokenA = artifacts.require('./token/A/DFSTokenA.sol');
const DFSBCrowdsale = artifacts.require('./crowdsale/B/DFSBCrowdsale.sol');
const DFSTokenB = artifacts.require('./token/B/DFSTokenB.sol');
const DataCentre = artifacts.require('./token/DataCentre.sol');
const MultisigWallet = artifacts.require('./multisig/solidity/MultiSigWalletWithDailyLimit.sol');
import {advanceBlock} from './helpers/advanceToBlock';
import latestTime from './helpers/latestTime';
const BigNumber = require('bignumber.js');
const assertJump = require('./helpers/assertJump');
const ONE_ETH = web3.toWei(1, 'ether');
const MOCK_ONE_ETH = web3.toWei(0.000001, 'ether'); // diluted ether value for testing
const PRE_SALE_DAYS = 7;
const FOUNDERS = [web3.eth.accounts[1], web3.eth.accounts[2], web3.eth.accounts[3]];

contract('Crowdsale', (accounts) => {
  let multisigWallet;

  beforeEach(async () => {
    multisigWallet = await MultisigWallet.new(FOUNDERS, 3, 10*MOCK_ONE_ETH);
  });

  describe('#CrowdsaleA details', () => {
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

    it('should allow start CrowdsaleA properly', async () => {
      // checking cap details
      const phasesoftCap1 = await dfsACrowdsale.softCap.call(0);
      const phasesoftCap2 = await dfsACrowdsale.softCap.call(1);

      assert.equal(60000000e18, phasesoftCap1.toNumber(), 'softCap for phase 1 INCORRECT');
      assert.equal(200000000e18, phasesoftCap2.toNumber(), 'softCap for phase 2 INCORRECT');

      //checking initial token distribution details
      const initialBalance = await tokenA.balanceOf.call(accounts[0]);
      assert.equal(140000000e18, initialBalance.toNumber(), 'initialBalance for sale NOT distributed properly');

      //checking token and wallet address
      const tokenAddress = await dfsACrowdsale.tokenAddr.call();
      const walletAddress = await dfsACrowdsale.wallet.call();
      assert.equal(tokenAddress, tokenA.address, 'address for tokenA in contract not set');
      assert.equal(walletAddress, multisigWallet.address, 'address for multisig wallet in contract not set');
    });
  })

  describe('#CrowdsaleA security considerations', () => {
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

    it('should allow to transfer ownership of tokenA contract to FOUNDERS', async () => {
      // pause and transfer ownership
      await dfsACrowdsale.pause();
      await dfsACrowdsale.transferTokenOwnership(multisigWallet.address);
      const newOwner = await tokenA.owner.call();
      assert.equal(newOwner, multisigWallet.address, 'ownership not transferred');
    });

    it('should allow to set contracts', async () => {
      // pause and transfer ownership
      const multiSigNew = await MultisigWallet.new(FOUNDERS, 3, 10*MOCK_ONE_ETH);
      const tokenNew = await DFSTokenA.new("0x00");
      await dfsACrowdsale.pause();
      await dfsACrowdsale.setContracts(tokenNew.address, multiSigNew.address);
      const tokenSet = await dfsACrowdsale.tokenAddr.call();
      const multiSigWalletSet = await dfsACrowdsale.wallet.call();
      assert.equal(tokenSet, tokenNew.address, 'contracts not set');
      assert.equal(multiSigWalletSet, multiSigNew.address, 'contracts not set');
    });

    it('should not allow to transfer ownership of token contract by scammer', async () => {
      // pause and transfer ownership
      const SCAMMER = accounts[5];
      await dfsACrowdsale.pause();
      try {
        await dfsACrowdsale.transferTokenOwnership(multisigWallet.address, {from: SCAMMER});
        assert.fail('should have failed before');
      } catch (error) {
        assertJump(error);
        const newOwner = await tokenA.owner.call();
        assert.equal(newOwner, dfsACrowdsale.address, 'ownership not transferred');
      }
    });

    it('should not allow to set contracts by scammer', async () => {
      // pause and transfer ownership
      const SCAMMER = accounts[5];
      const multiSigNew = await MultisigWallet.new(FOUNDERS, 3, 10*MOCK_ONE_ETH);
      const tokenNew = await DFSTokenA.new();
      await dfsACrowdsale.pause();
      try {
        await dfsACrowdsale.setContracts(tokenNew.address, multiSigNew.address, {from: SCAMMER});
        assert.fail('should have failed before');
      } catch (error) {
        assertJump(error);
        const tokenSet = await dfsACrowdsale.tokenAddr.call();
        const multiSigWalletSet = await dfsACrowdsale.wallet.call();
        assert.equal(tokenSet, tokenA.address, 'contracts still set');
        assert.equal(multiSigWalletSet, multisigWallet.address, 'contracts still set');
      }
    });
  });

  describe('#CrowdsaleB details', () => {
    let tokenB;
    let dfsBCrowdsale;

    beforeEach(async () => {
      await advanceBlock();
      const startTime = latestTime();
      tokenB = await DFSTokenB.new();
      dfsBCrowdsale = await DFSBCrowdsale.new(startTime, PRE_SALE_DAYS, tokenB.address, multisigWallet.address);
      await tokenB.transferOwnership(dfsBCrowdsale.address);
      await dfsBCrowdsale.unpause();
    });

    it('should allow start CrowdsaleB properly', async () => {
      // checking cap details
      const phasesoftCap1 = await dfsBCrowdsale.softCap.call(0);
      const phasesoftCap2 = await dfsBCrowdsale.softCap.call(1);

      assert.equal(30000000e18, phasesoftCap1.toNumber(), 'softCap for phase 1 INCORRECT');
      assert.equal(40000000e18, phasesoftCap2.toNumber(), 'softCap for phase 2 INCORRECT');

      //checking initial token distribution details
      const initialBalance = await tokenB.balanceOf.call(accounts[0]);
      assert.equal(30000000e18, initialBalance.toNumber(), 'initialBalance for sale NOT distributed properly');

      //checking token and wallet address
      const tokenAddress = await dfsBCrowdsale.tokenAddr.call();
      const walletAddress = await dfsBCrowdsale.wallet.call();
      assert.equal(tokenAddress, tokenB.address, 'address for tokenB in contract not set');
      assert.equal(walletAddress, multisigWallet.address, 'address for multisig wallet in contract not set');
    });
  })

  describe('#CrowdsaleB security considerations', () => {
    let tokenB;
    let dfsBCrowdsale;

    beforeEach(async () => {
      await advanceBlock();
      const startTime = latestTime();
      tokenB = await DFSTokenB.new();
      dfsBCrowdsale = await DFSBCrowdsale.new(startTime, PRE_SALE_DAYS, tokenB.address, multisigWallet.address);
      await tokenB.transferOwnership(dfsBCrowdsale.address);
      await dfsBCrowdsale.unpause();
    });

    it('should allow to transfer ownership of tokenB contract to FOUNDERS', async () => {
      // pause and transfer ownership
      await dfsBCrowdsale.pause();
      await dfsBCrowdsale.transferTokenOwnership(multisigWallet.address);
      const newOwner = await tokenB.owner.call();
      assert.equal(newOwner, multisigWallet.address, 'ownership not transferred');
    });

    it('should allow to set contracts', async () => {
      // pause and transfer ownership
      const multiSigNew = await MultisigWallet.new(FOUNDERS, 3, 10*MOCK_ONE_ETH);
      const tokenNew = await DFSTokenB.new("0x00");
      await dfsBCrowdsale.pause();
      await dfsBCrowdsale.setContracts(tokenNew.address, multiSigNew.address);
      const tokenSet = await dfsBCrowdsale.tokenAddr.call();
      const multiSigWalletSet = await dfsBCrowdsale.wallet.call();
      assert.equal(tokenSet, tokenNew.address, 'contracts not set');
      assert.equal(multiSigWalletSet, multiSigNew.address, 'contracts not set');
    });

    it('should not allow to transfer ownership of token contract by scammer', async () => {
      // pause and transfer ownership
      const SCAMMER = accounts[5];
      await dfsBCrowdsale.pause();
      try {
        await dfsBCrowdsale.transferTokenOwnership(multisigWallet.address, {from: SCAMMER});
        assert.fail('should have failed before');
      } catch (error) {
        assertJump(error);
        const newOwner = await tokenB.owner.call();
        assert.equal(newOwner, dfsBCrowdsale.address, 'ownership not transferred');
      }
    });

    it('should not allow to set contracts by scammer', async () => {
      // pause and transfer ownership
      const SCAMMER = accounts[5];
      const multiSigNew = await MultisigWallet.new(FOUNDERS, 3, 10*MOCK_ONE_ETH);
      const tokenNew = await DFSTokenB.new();
      await dfsBCrowdsale.pause();
      try {
        await dfsBCrowdsale.setContracts(tokenNew.address, multiSigNew.address, {from: SCAMMER});
        assert.fail('should have failed before');
      } catch (error) {
        assertJump(error);
        const tokenSet = await dfsBCrowdsale.tokenAddr.call();
        const multiSigWalletSet = await dfsBCrowdsale.wallet.call();
        assert.equal(tokenSet, tokenB.address, 'contracts still set');
        assert.equal(multiSigWalletSet, multisigWallet.address, 'contracts still set');
      }
    });
  })
});
