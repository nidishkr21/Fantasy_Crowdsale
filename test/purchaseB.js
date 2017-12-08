const MockDFSBCrowdsale = artifacts.require('./helpers/MockDFSBCrowdsale.sol');
const DFSTokenB = artifacts.require('./token/B/DFSTokenB.sol');
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

contract('DFSBCrwodsale', (accounts) => {
  let multisigWallet;
  let tokenB;
  let dfsBCrowdsale;

  beforeEach(async () => {
    await advanceBlock();
    const startTime = latestTime();
    tokenB = await DFSTokenB.new();
    multisigWallet = await MultisigWallet.new(FOUNDERS, 3, 10*MOCK_ONE_ETH);
    dfsBCrowdsale = await MockDFSBCrowdsale.new(startTime, PRE_SALE_DAYS, tokenB.address, multisigWallet.address);
    await tokenB.transferOwnership(dfsBCrowdsale.address);
    await dfsBCrowdsale.unpause();
  });

  describe('#purchase', () => {
    it('should allow investors to buy tokens in Pre Sale at 825 swapRate', async () => {

      const swapRate = new BigNumber(825);
      const INVESTOR = accounts[4];

      // buy tokens
      await dfsBCrowdsale.buyTokens(INVESTOR, {value: MOCK_ONE_ETH, from: INVESTOR});
      const walletBalance = await web3.eth.getBalance(multisigWallet.address);
      const tokensBalance = await tokenB.balanceOf.call(INVESTOR);

      const tokensAmount = swapRate.mul(MOCK_ONE_ETH);
      assert.equal(walletBalance.toNumber(), MOCK_ONE_ETH, 'ether not deposited into the wallet');
      assert.equal(tokensBalance.toNumber(), tokensAmount.toNumber(), 'tokens not deposited into the INVESTOR balance');
    });

    it('should allow investors to buy tokens in Crowdsale at 660 swapRate', async () => {

      const swapRate = new BigNumber(660);
      const INVESTOR = accounts[4];

      // forward time by PRE_SALE_DAYS
      await increaseTime(86400 * PRE_SALE_DAYS);

      // buy tokens
      await dfsBCrowdsale.buyTokens(INVESTOR, {value: MOCK_ONE_ETH, from: INVESTOR});
      const walletBalance = await web3.eth.getBalance(multisigWallet.address);
      const tokensBalance = await tokenB.balanceOf.call(INVESTOR);

      const tokensAmount = swapRate.mul(MOCK_ONE_ETH);
      assert.equal(walletBalance.toNumber(), MOCK_ONE_ETH, 'ether not deposited into the wallet');
      assert.equal(tokensBalance.toNumber(), tokensAmount.toNumber(), 'tokens not deposited into the INVESTOR balance');
    });

    it('should allow investors to buy tokens in Crowdsale at 550 swapRate', async () => {

      const swapRate = new BigNumber(550);
      const INVESTOR = accounts[4];

      // forward time by PRE_SALE_DAYS + 7 days
      await increaseTime(86400 * (PRE_SALE_DAYS + 7));

      // buy tokens
      await dfsBCrowdsale.buyTokens(INVESTOR, {value: MOCK_ONE_ETH, from: INVESTOR});
      const walletBalance = await web3.eth.getBalance(multisigWallet.address);
      const tokensBalance = await tokenB.balanceOf.call(INVESTOR);

      const tokensAmount = swapRate.mul(MOCK_ONE_ETH);
      assert.equal(walletBalance.toNumber(), MOCK_ONE_ETH, 'ether not deposited into the wallet');
      assert.equal(tokensBalance.toNumber(), tokensAmount.toNumber(), 'tokens not deposited into the INVESTOR balance');
    });

    it('should allow investors to buy tokens in Crowdsale at 471 swapRate', async () => {

      const swapRate = new BigNumber(471);
      const INVESTOR = accounts[4];

      // forward time by PRE_SALE_DAYS + 7 days
      await increaseTime(86400 * (PRE_SALE_DAYS + 13));

      // buy tokens
      await dfsBCrowdsale.buyTokens(INVESTOR, {value: MOCK_ONE_ETH, from: INVESTOR});
      const walletBalance = await web3.eth.getBalance(multisigWallet.address);
      const tokensBalance = await tokenB.balanceOf.call(INVESTOR);

      const tokensAmount = swapRate.mul(MOCK_ONE_ETH);
      assert.equal(walletBalance.toNumber(), MOCK_ONE_ETH, 'ether not deposited into the wallet');
      assert.equal(tokensBalance.toNumber(), tokensAmount.toNumber(), 'tokens not deposited into the INVESTOR balance');
    });

    it('should allow investors to buy tokens in Crowdsale at 412 swapRate', async () => {

      const swapRate = new BigNumber(412);
      const INVESTOR = accounts[4];

      // forward time by PRE_SALE_DAYS + 13 days
      await increaseTime(86400 * (PRE_SALE_DAYS + 19));

      // buy tokens
      await dfsBCrowdsale.buyTokens(INVESTOR, {value: MOCK_ONE_ETH, from: INVESTOR});
      const walletBalance = await web3.eth.getBalance(multisigWallet.address);
      const tokensBalance = await tokenB.balanceOf.call(INVESTOR);

      const tokensAmount = swapRate.mul(MOCK_ONE_ETH);
      assert.equal(walletBalance.toNumber(), MOCK_ONE_ETH, 'ether not deposited into the wallet');
      assert.equal(tokensBalance.toNumber(), tokensAmount.toNumber(), 'tokens not deposited into the INVESTOR balance');
    });

    it('should allow investors to buy tokens in Crowdsale at 366 swapRate', async () => {

      const swapRate = new BigNumber(366);
      const INVESTOR = accounts[4];

      // forward time by 10 days
      await increaseTime(86400 * (PRE_SALE_DAYS + 25));

      // buy tokens
      await dfsBCrowdsale.buyTokens(INVESTOR, {value: MOCK_ONE_ETH, from: INVESTOR});
      const walletBalance = await web3.eth.getBalance(multisigWallet.address);
      const tokensBalance = await tokenB.balanceOf.call(INVESTOR);

      const tokensAmount = swapRate.mul(MOCK_ONE_ETH);
      assert.equal(walletBalance.toNumber(), MOCK_ONE_ETH, 'ether not deposited into the wallet');
      assert.equal(tokensBalance.toNumber(), tokensAmount.toNumber(), 'tokens not deposited into the INVESTOR balance');
    });

    it('should not allow investors to buy tokens after Crowdsale', async () => {

      const INVESTOR = accounts[4];

      // forward time by 10 days
      await increaseTime(86400 * (PRE_SALE_DAYS + 31));

      // buy tokens
      try {
        await dfsBCrowdsale.buyTokens(INVESTOR, {value: MOCK_ONE_ETH, from: INVESTOR});
      } catch(error) {
        assertJump(error);
        const walletBalance = await web3.eth.getBalance(multisigWallet.address);
        const tokensBalance = await tokenB.balanceOf.call(INVESTOR);
        assert.equal(walletBalance.toNumber(), 0, 'ether deposited into the wallet');
        assert.equal(tokensBalance.toNumber(), 0, 'tokens deposited into the INVESTOR balance');
      }
    });

  });

  describe('#belowSoftCaps', () => {
    it('should allow investors buying just below Pre Sale cap', async () => {

      const INVESTORS = accounts[4];
      const swapRate = new BigNumber(825);
      const amountEth = new BigNumber(36363).mul(MOCK_ONE_ETH);
      const tokensAmount = swapRate.mul(amountEth);

      //  buy tokens
      await dfsBCrowdsale.buyTokens(INVESTORS, {value: amountEth, from: INVESTORS});
      const walletBalance = await web3.eth.getBalance(multisigWallet.address);
      const balanceInvestor = await tokenB.balanceOf.call(INVESTORS);
      const totalSupplyPhase1 = await dfsBCrowdsale.totalSupply.call(0);
      const totalSupplyToken = await tokenB.totalSupply.call();

      assert.equal(walletBalance.toNumber(), amountEth.toNumber(), 'ether still deposited into the wallet');
      assert.equal(balanceInvestor.toNumber(), tokensAmount.toNumber(), 'balance still added for investor');
      assert.equal(totalSupplyPhase1.toNumber(), tokensAmount.toNumber(), 'balance not added to totalSupply');
    });

    it('should allow investors buying just below Crowdsale cap', async () => {

      const INVESTORS = accounts[4];
      const swapRate = new BigNumber(660);
      const amountEth = new BigNumber(60606).mul(MOCK_ONE_ETH);
      const tokensAmount = swapRate.mul(amountEth);

      // forward time by PRE_SALE_DAYS days
      await increaseTime(86400 * PRE_SALE_DAYS);

      // buy tokens

      await dfsBCrowdsale.buyTokens(INVESTORS, {value: amountEth, from: INVESTORS});
      const walletBalance = await web3.eth.getBalance(multisigWallet.address);
      const balanceInvestor = await tokenB.balanceOf.call(INVESTORS);
      const totalSupplyPhase2 = await dfsBCrowdsale.totalSupply.call(1);

      assert.equal(walletBalance.toNumber(), amountEth.toNumber(), 'ether not deposited into the wallet');
      assert.equal(balanceInvestor.toNumber(), tokensAmount.toNumber(), 'balance not added for investor');
      assert.equal(totalSupplyPhase2.toNumber(), tokensAmount.toNumber(), 'balance not added to totalSupply');
    });

  });


  describe('#overSoftCaps', () => {
    it('should refund investors when buying above above Pre Sale cap', async () => {

      const INVESTORS = accounts[4];
      const swapRate = new BigNumber(825);
      const amountEth = new BigNumber(36364).mul(MOCK_ONE_ETH);
      const balanceBefore = await web3.eth.getBalance(INVESTORS);
      // buy tokens
      await dfsBCrowdsale.buyTokens(INVESTORS, {value: amountEth, from: INVESTORS, gasPrice: 0});
      const walletBalance = await web3.eth.getBalance(multisigWallet.address);
      const balanceInvestor = await tokenB.balanceOf.call(INVESTORS);
      const balanceAfter = await web3.eth.getBalance(INVESTORS);
      const ethInvested = balanceBefore.sub(balanceAfter);
      assert(walletBalance.toNumber() < amountEth.toNumber(), 'full amount transfer still took place');
      assert.equal(walletBalance.toNumber(), ethInvested.toNumber(), 'ether not deposited into wallet');
      assert.equal(balanceInvestor.toNumber(), ethInvested.mul(swapRate).toNumber(), 'balance not added for investor');
    });

    it('should refund investors when buying above above Crowdsale cap', async () => {
      const INVESTORS = accounts[4];
      const swapRate = new BigNumber(660);
      const amountEth = new BigNumber(60607).mul(MOCK_ONE_ETH);
      const balanceBefore = await web3.eth.getBalance(INVESTORS);

      // forward time by PRE_SALE_DAYS days
      await increaseTime(86400 * PRE_SALE_DAYS);

      // buy tokens
      await dfsBCrowdsale.buyTokens(INVESTORS, {value: amountEth, from: INVESTORS, gasPrice: 0});
      const walletBalance = await web3.eth.getBalance(multisigWallet.address);
      const balanceInvestor = await tokenB.balanceOf.call(INVESTORS);
      const balanceAfter = await web3.eth.getBalance(INVESTORS);
      const ethInvested = balanceBefore.sub(balanceAfter);
      assert(walletBalance.toNumber() < amountEth.toNumber(), 'full amount transfer still took place');
      assert.equal(walletBalance.toNumber(), ethInvested.toNumber(), 'ether not deposited into wallet');
      assert.equal(balanceInvestor.toNumber(), ethInvested.mul(swapRate).toNumber(), 'balance not added for investor');
    });
  });

  describe('#endReached', () => {
    it('should not allow investors to buy after cap reached during Pre Sale', async () => {

      const INVESTORS = accounts[4];
      const swapRate = new BigNumber(825);
      const amountEth = new BigNumber(36364).mul(MOCK_ONE_ETH);
      const balanceBefore = await web3.eth.getBalance(INVESTORS);
      // buy tokens
      await dfsBCrowdsale.buyTokens(INVESTORS, {value: amountEth, from: INVESTORS, gasPrice: 0});
      const walletBalance = await web3.eth.getBalance(multisigWallet.address);
      const balanceInvestor = await tokenB.balanceOf.call(INVESTORS);
      const balanceAfter = await web3.eth.getBalance(INVESTORS);
      const ethInvested = balanceBefore.sub(balanceAfter);
      assert(walletBalance.toNumber() < amountEth.toNumber(), 'full amount transfer still took place');
      assert.equal(walletBalance.toNumber(), ethInvested.toNumber(), 'ether not deposited into wallet');
      assert.equal(balanceInvestor.toNumber(), ethInvested.mul(swapRate).toNumber(), 'balance not added for investor');

      try {
        await dfsBCrowdsale.buyTokens(INVESTORS, {value: MOCK_ONE_ETH, from: INVESTORS, gasPrice: 0})
      } catch(error) {
        assertJump(error);
      }
    });

    it('should not allow investors to buy after cap reached during Crowdsale', async () => {

      const INVESTORS = accounts[4];
      const swapRate = new BigNumber(660);
      const amountEth = new BigNumber(60607).mul(MOCK_ONE_ETH);
      const balanceBefore = await web3.eth.getBalance(INVESTORS);

      // forward time by 20 days
      await increaseTime(86400 * 10);

      // buy tokens
      await dfsBCrowdsale.buyTokens(INVESTORS, {value: amountEth, from: INVESTORS, gasPrice: 0});
      const walletBalance = await web3.eth.getBalance(multisigWallet.address);
      const balanceInvestor = await tokenB.balanceOf.call(INVESTORS);
      const balanceAfter = await web3.eth.getBalance(INVESTORS);
      const ethInvested = balanceBefore.sub(balanceAfter);
      assert(walletBalance.toNumber() < amountEth.toNumber(), 'full amount transfer still took place');
      assert.equal(walletBalance.toNumber(), ethInvested.toNumber(), 'ether not deposited into wallet');
      assert.equal(balanceInvestor.toNumber(), ethInvested.mul(swapRate).toNumber(), 'balance not added for investor');

      try {
        await dfsBCrowdsale.buyTokens(INVESTORS, {value: MOCK_ONE_ETH, from: INVESTORS, gasPrice: 0})
      } catch(error) {
        assertJump(error);
      }
    });
  });
})
