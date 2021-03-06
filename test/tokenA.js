const MockDFSACrowdsale = artifacts.require('./helpers/MockDFSACrowdsale.sol');
const ERC223Receiver = artifacts.require('./helpers/ERC223ReceiverMock.sol');
const DFSTokenA = artifacts.require('./token/A/DFSTokenA.sol');
const DataCentre = artifacts.require('./token/DataCentre.sol');
const MultisigWallet = artifacts.require('./multisig/MultiSigWalletWithDailyLimit.sol');
import {advanceBlock} from './helpers/advanceToBlock';
import latestTime from './helpers/latestTime';
import increaseTime from './helpers/increaseTime';
const BigNumber = require('bignumber.js');
const assertJump = require('./helpers/assertJump');
const ONE_ETH = web3.toWei(1, 'ether');
const MOCK_ONE_ETH = web3.toWei(0.000001, 'ether'); // diluted ether value for testing
const PRE_SALE_DAYS = 7;
const FOUNDERS = [web3.eth.accounts[1], web3.eth.accounts[2], web3.eth.accounts[3]];

contract('DFSTokenA', (accounts) => {
  let multisigWallet;
  let tokenA;
  let dfsACrowdsale;

  beforeEach(async () => {
    await advanceBlock();
    const startTime = latestTime();
    tokenA = await DFSTokenA.new();
    multisigWallet = await MultisigWallet.new(FOUNDERS, 3, 10*MOCK_ONE_ETH);
    dfsACrowdsale = await MockDFSACrowdsale.new(startTime, PRE_SALE_DAYS, tokenA.address, multisigWallet.address);
    await tokenA.transferOwnership(dfsACrowdsale.address);
    await dfsACrowdsale.unpause();
  });

  // only needed because of the refactor
  describe('#transfer', () => {
    it('should allow investors to trasnfer', async () => {

      const swapRate = new BigNumber(4000);
      const INVESTOR = accounts[4];
      const BENEFICIARY = accounts[5];
      // buy tokens
      await dfsACrowdsale.buyTokens(INVESTOR, {value: MOCK_ONE_ETH, from: INVESTOR});
      const walletBalance = await web3.eth.getBalance(multisigWallet.address);
      const tokensBalance = await tokenA.balanceOf.call(INVESTOR);

      const tokensAmount = swapRate.mul(MOCK_ONE_ETH);
      assert.equal(walletBalance.toNumber(), MOCK_ONE_ETH, 'ether not deposited into the wallet');
      assert.equal(tokensBalance.toNumber(), tokensAmount.toNumber(), 'tokens not deposited into the INVESTOR balance');

      await tokenA.transfer(BENEFICIARY, tokensBalance, {from: INVESTOR});
      const tokenBalanceTransfered = await tokenA.balanceOf.call(BENEFICIARY);
      assert.equal(tokensBalance.toNumber(), tokenBalanceTransfered.toNumber(), 'tokens not transferred');
    });

    it('should not allow scammer and transfer un-owned tokens', async () => {

      const swapRate = new BigNumber(4000);
      const INVESTOR = accounts[4];
      const BENEFICIARY = accounts[5];
      const SCAMMER = accounts[6];

      // buy tokens
      await dfsACrowdsale.buyTokens(INVESTOR, {value: MOCK_ONE_ETH, from: INVESTOR});
      const walletBalance = await web3.eth.getBalance(multisigWallet.address);
      const tokensBalance = await tokenA.balanceOf.call(INVESTOR);

      const tokensAmount = swapRate.mul(MOCK_ONE_ETH);
      assert.equal(walletBalance.toNumber(), MOCK_ONE_ETH, 'ether not deposited into the wallet');
      assert.equal(tokensBalance.toNumber(), tokensAmount.toNumber(), 'tokens not deposited into the INVESTOR balance');

      try {
        await tokenA.transfer(BENEFICIARY, tokensBalance, {from: SCAMMER});
        assert.fail('should have failed before');
      } catch(error) {
        assertJump(error);
        const tokenBalanceTransfered = await tokenA.balanceOf.call(BENEFICIARY);
        assert.equal(tokenBalanceTransfered.toNumber(), 0, 'tokens not transferred');
      }
    });

    it('should not allow transfer tokens more than balance', async () => {

      const swapRate = new BigNumber(4000);
      const INVESTOR = accounts[4];
      const BENEFICIARY = accounts[5];

      // buy tokens
      await dfsACrowdsale.buyTokens(INVESTOR, {value: MOCK_ONE_ETH, from: INVESTOR});
      const walletBalance = await web3.eth.getBalance(multisigWallet.address);
      const tokensBalance = await tokenA.balanceOf.call(INVESTOR);

      const tokensAmount = swapRate.mul(MOCK_ONE_ETH);
      assert.equal(walletBalance.toNumber(), MOCK_ONE_ETH, 'ether not deposited into the wallet');
      assert.equal(tokensBalance.toNumber(), tokensAmount.toNumber(), 'tokens not deposited into the INVESTOR balance');

      try {
        await tokenA.transfer(BENEFICIARY, tokensBalance + 10, {from: INVESTOR});
        assert.fail('should have failed before');
      } catch(error) {
        assertJump(error);
        const tokenBalanceTransfered = await tokenA.balanceOf.call(BENEFICIARY);
        assert.equal(tokenBalanceTransfered.toNumber(), 0, 'tokens not transferred');
      }
    });

    it('should allow transferring to a ERC223 Receiver contract', async () => {

      const swapRate = new BigNumber(4000);
      const INVESTOR = accounts[4];
      const receiver = await ERC223Receiver.new();
      const BENEFICIARY = receiver.address;
      // buy tokens
      await dfsACrowdsale.buyTokens(INVESTOR, {value: MOCK_ONE_ETH, from: INVESTOR});
      const walletBalance = await web3.eth.getBalance(multisigWallet.address);
      const tokensBalance = await tokenA.balanceOf.call(INVESTOR);

      const tokensAmount = swapRate.mul(MOCK_ONE_ETH);
      assert.equal(walletBalance.toNumber(), MOCK_ONE_ETH, 'ether not deposited into the wallet');
      assert.equal(tokensBalance.toNumber(), tokensAmount.toNumber(), 'tokens not deposited into the INVESTOR balance');

      await tokenA.transfer(BENEFICIARY, tokensBalance, {from: INVESTOR});
      const tokenBalanceTransfered = await tokenA.balanceOf.call(BENEFICIARY);
      const receiverCalled = await receiver.called.call();
      assert.equal(tokensBalance.toNumber(), tokenBalanceTransfered.toNumber(), 'tokens not transferred');
      assert.equal(receiverCalled, true, 'tokens not transferred');
    });

    it('should not allow transferring to a non ERC223 contract', async () => {

      const swapRate = new BigNumber(4000);
      const INVESTOR = accounts[4];
      const BENEFICIARY = dfsACrowdsale.address;
      // buy tokens
      await dfsACrowdsale.buyTokens(INVESTOR, {value: MOCK_ONE_ETH, from: INVESTOR});
      const walletBalance = await web3.eth.getBalance(multisigWallet.address);
      const tokensBalance = await tokenA.balanceOf.call(INVESTOR);

      const tokensAmount = swapRate.mul(MOCK_ONE_ETH);
      assert.equal(walletBalance.toNumber(), MOCK_ONE_ETH, 'ether not deposited into the wallet');
      assert.equal(tokensBalance.toNumber(), tokensAmount.toNumber(), 'tokens not deposited into the INVESTOR balance');

      try {
        await tokenA.transfer(BENEFICIARY, tokensBalance, {from: INVESTOR});
      } catch(error) {
        const tokenBalanceTransfered = await tokenA.balanceOf.call(BENEFICIARY);
        assert.equal(tokenBalanceTransfered.toNumber(), 0, 'tokens still transferred');
      }
    });
  });

  describe('#transferFrom', () => {
    it('should allow investors to approve and transferFrom', async () => {

      const swapRate = new BigNumber(4000);
      const INVESTOR = accounts[4];
      const BENEFICIARY = accounts[5];
      // buy tokens
      await dfsACrowdsale.buyTokens(INVESTOR, {value: MOCK_ONE_ETH, from: INVESTOR});
      const walletBalance = await web3.eth.getBalance(multisigWallet.address);
      const tokensBalance = await tokenA.balanceOf.call(INVESTOR);

      const tokensAmount = swapRate.mul(MOCK_ONE_ETH);
      assert.equal(walletBalance.toNumber(), MOCK_ONE_ETH, 'ether not deposited into the wallet');
      assert.equal(tokensBalance.toNumber(), tokensAmount.toNumber(), 'tokens not deposited into the INVESTOR balance');

      await tokenA.approve(BENEFICIARY, tokensBalance, {from: INVESTOR});

      const tokenBalanceAllowed = await tokenA.allowance.call(INVESTOR, BENEFICIARY);
      assert.equal(tokenBalanceAllowed.toNumber(), tokensBalance.toNumber(), 'tokens not allowed');

      await tokenA.transferFrom(INVESTOR, BENEFICIARY, tokensBalance, {from: BENEFICIARY});
      const tokenBalanceTransfered = await tokenA.balanceOf.call(BENEFICIARY);
      assert.equal(tokensBalance.toNumber(), tokenBalanceTransfered.toNumber(), 'tokens not transferred');
    });

    it('should not allow transferFrom tokens more than allowed', async () => {

      const swapRate = new BigNumber(4000);
      const INVESTOR = accounts[4];
      const BENEFICIARY = accounts[5];

      // buy tokens
      await dfsACrowdsale.buyTokens(INVESTOR, {value: MOCK_ONE_ETH, from: INVESTOR});
      const walletBalance = await web3.eth.getBalance(multisigWallet.address);
      const tokensBalance = await tokenA.balanceOf.call(INVESTOR);

      const tokensAmount = swapRate.mul(MOCK_ONE_ETH);
      assert.equal(walletBalance.toNumber(), MOCK_ONE_ETH, 'ether not deposited into the wallet');
      assert.equal(tokensBalance.toNumber(), tokensAmount.toNumber(), 'tokens not deposited into the INVESTOR balance');

      await tokenA.approve(BENEFICIARY, tokensBalance, {from: INVESTOR});
      const tokenBalanceAllowed = await tokenA.allowance.call(INVESTOR, BENEFICIARY);
      assert.equal(tokenBalanceAllowed.toNumber(), tokensBalance.toNumber(), 'tokens not allowed');
      try {
        await tokenA.transferFrom(INVESTOR, BENEFICIARY, tokensBalance + 10, {from: BENEFICIARY});
        assert.fail('should have failed before');
      } catch(error) {
        assertJump(error);
        const tokenBalanceTransfered = await tokenA.balanceOf.call(BENEFICIARY);
        assert.equal(tokenBalanceTransfered.toNumber(), 0, 'tokens not transferred');
      }
    });

    it('should not allow transferFrom tokens that are not allowed', async () => {

      const swapRate = new BigNumber(4000);
      const INVESTOR = accounts[4];
      const BENEFICIARY = accounts[5];
      const SCAMMER = accounts[6];

      // buy tokens
      await dfsACrowdsale.buyTokens(INVESTOR, {value: MOCK_ONE_ETH, from: INVESTOR});
      const walletBalance = await web3.eth.getBalance(multisigWallet.address);
      const tokensBalance = await tokenA.balanceOf.call(INVESTOR);

      const tokensAmount = swapRate.mul(MOCK_ONE_ETH);
      assert.equal(walletBalance.toNumber(), MOCK_ONE_ETH, 'ether not deposited into the wallet');
      assert.equal(tokensBalance.toNumber(), tokensAmount.toNumber(), 'tokens not deposited into the INVESTOR balance');

      try {
        await tokenA.transferFrom(INVESTOR, SCAMMER, tokensBalance, {from: BENEFICIARY});
        assert.fail('should have failed before');
      } catch(error) {
        assertJump(error);
        const tokenBalanceTransfered = await tokenA.balanceOf.call(SCAMMER);
        assert.equal(tokenBalanceTransfered.toNumber(), 0, 'tokens not transferred');
      }
    });

    it('should not allow scammers to approve un-owned tokens', async () => {

      const swapRate = new BigNumber(4000);
      const INVESTOR = accounts[4];
      const BENEFICIARY = accounts[5];
      const SCAMMER = accounts[6];

      // buy tokens
      await dfsACrowdsale.buyTokens(INVESTOR, {value: MOCK_ONE_ETH, from: INVESTOR});
      const walletBalance = await web3.eth.getBalance(multisigWallet.address);
      const tokensBalance = await tokenA.balanceOf.call(INVESTOR);

      const tokensAmount = swapRate.mul(MOCK_ONE_ETH);
      assert.equal(walletBalance.toNumber(), MOCK_ONE_ETH, 'ether not deposited into the wallet');
      assert.equal(tokensBalance.toNumber(), tokensAmount.toNumber(), 'tokens not deposited into the INVESTOR balance');

      try {
        await tokenA.approve(BENEFICIARY, tokensBalance, {from: SCAMMER});
        assert.fail('should have failed before');
      } catch(error) {
        assertJump(error);
        const tokenBalanceAllowed = await tokenA.allowance.call(INVESTOR, BENEFICIARY);
        assert.equal(tokenBalanceAllowed.toNumber(), 0, 'tokens not transferred');
      }
    });
  });

  describe('#security considerations', () => {
    it('should allow to transfer ownership of DataCentre contract to FOUNDERS manually', async () => {
      // pause and transfer ownership
      await dfsACrowdsale.pause();
      await dfsACrowdsale.transferTokenOwnership(multisigWallet.address);
      const newOwnerToken = await tokenA.owner.call();
      const dataCentreAddr = await tokenA.dataCentreAddr.call();
      const dataCentre = DataCentre.at(dataCentreAddr);
      assert.equal(newOwnerToken, multisigWallet.address, 'ownership not transferred');

      var tokenContract = web3.eth.contract(tokenA.abi);
      var tokenContractInstance = tokenContract.at(tokenA.address);
      var pauseTokenData = tokenContractInstance.pause.getData();
      var transferGovernanceData = tokenContractInstance.transferDataCentreOwnership.getData(multisigWallet.address);

      await multisigWallet.submitTransaction(tokenA.address, 0, pauseTokenData, {from: accounts[1]});
      await multisigWallet.confirmTransaction(0, {from: accounts[2]});
      await multisigWallet.confirmTransaction(0, {from: accounts[3]});

      await multisigWallet.submitTransaction(tokenA.address, 0, transferGovernanceData, {from: accounts[1]});
      await multisigWallet.confirmTransaction(1, {from: accounts[2]});
      await multisigWallet.confirmTransaction(1, {from: accounts[3]});
      const newOwnerDataCentre = await dataCentre.owner.call();

      assert.equal(newOwnerDataCentre, multisigWallet.address, 'ownership not transferred');

    });

    it('should allow to transfer ownership of DataCentre contract from FOUNDERS to DataCentre manually', async () => {
      // pause and transfer ownership
      await dfsACrowdsale.pause();
      await dfsACrowdsale.transferTokenOwnership(multisigWallet.address);
      const newOwnerToken = await tokenA.owner.call();
      const dataCentreAddr = await tokenA.dataCentreAddr.call();
      const dataCentre = DataCentre.at(dataCentreAddr);
      assert.equal(newOwnerToken, multisigWallet.address, 'ownership not transferred');

      var tokenContract = web3.eth.contract(tokenA.abi);
      var tokenContractInstance = tokenContract.at(tokenA.address);
      var pauseTokenData = tokenContractInstance.pause.getData();
      var transferGovernanceData = tokenContractInstance.transferDataCentreOwnership.getData(multisigWallet.address);

      await multisigWallet.submitTransaction(tokenA.address, 0, pauseTokenData, {from: accounts[1]});
      await multisigWallet.confirmTransaction(0, {from: accounts[2]});
      await multisigWallet.confirmTransaction(0, {from: accounts[3]});

      await multisigWallet.submitTransaction(tokenA.address, 0, transferGovernanceData, {from: accounts[1]});
      await multisigWallet.confirmTransaction(1, {from: accounts[2]});
      await multisigWallet.confirmTransaction(1, {from: accounts[3]});
      const newOwnerDataCentre = await dataCentre.owner.call();

      assert.equal(newOwnerDataCentre, multisigWallet.address, 'ownership not transferred');

      var dataCentreContract = web3.eth.contract(dataCentre.abi);
      var dataCentreContractInstance = dataCentreContract.at(dataCentre.address);
      var transferOwnerData = dataCentreContractInstance.transferOwnership.getData(tokenA.address);

      await multisigWallet.submitTransaction(dataCentre.address, 0, transferOwnerData, {from: accounts[1]});
      await multisigWallet.confirmTransaction(2, {from: accounts[2]});
      await multisigWallet.confirmTransaction(2, {from: accounts[3]});

      const changedOwner = await dataCentre.owner.call();
      assert.equal(changedOwner, tokenA.address, 'ownership not transferred back');
    });
  });

  describe('#upgradability', () => {

    it('should allow to upgrade token contract manually', async () => {

      const swapRate = new BigNumber(4000);
      const INVESTOR = accounts[4];
      const BENEFICIARY = accounts[5];
      // buy tokens
      await dfsACrowdsale.buyTokens(INVESTOR, {value: MOCK_ONE_ETH, from: INVESTOR});
      const tokensBalance = await tokenA.balanceOf.call(INVESTOR);
      const tokensAmount = swapRate.mul(MOCK_ONE_ETH);
      assert.equal(tokensBalance.toNumber(), tokensAmount.toNumber(), 'tokens not deposited into the INVESTOR balance');

      // // begin the upgrade process
      await dfsACrowdsale.pause();
      await dfsACrowdsale.transferTokenOwnership(accounts[0]);
      await tokenA.pause();
      await tokenA.transferDataCentreOwnership(accounts[0]);

      // deploy new token contract
      const dataCentre = await DataCentre.at(await tokenA.dataCentreAddr());
      const tokenNew = await DFSTokenA.new(dataCentre.address);
      await dataCentre.transferOwnership(tokenNew.address);
      const dataCentreSet = await tokenNew.dataCentreAddr.call();
      assert.equal(dataCentreSet, dataCentre.address, 'dataCentre not set');


      // try a transfer operation in the new token contract
      await tokenNew.transfer(BENEFICIARY, tokensBalance, {from: INVESTOR});
      const tokenBalanceTransfered = await tokenA.balanceOf.call(BENEFICIARY);
      assert.equal(tokensBalance.toNumber(), tokenBalanceTransfered.toNumber(), 'tokens not transferred');
    });
  })
})
