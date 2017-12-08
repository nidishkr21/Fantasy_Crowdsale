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

  it('should allow succesful completion', async () => {

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
  });

  describe('#purchase', () => {
    it('should allow investors to buy tokens in Pre Sale at 800 swapRate', async () => {

      const swapRate = new BigNumber(800);
      const INVESTOR = accounts[4];

      // buy tokens
      await dfsBCrowdsale.buyTokens(INVESTOR, {value: MOCK_ONE_ETH, from: INVESTOR});
      const walletBalance = await web3.eth.getBalance(multisigWallet.address);
      const tokensBalance = await tokenB.balanceOf.call(INVESTOR);

      const tokensAmount = swapRate.mul(MOCK_ONE_ETH);
      assert.equal(walletBalance.toNumber(), MOCK_ONE_ETH, 'ether not deposited into the wallet');
      assert.equal(tokensBalance.toNumber(), tokensAmount.toNumber(), 'tokens not deposited into the INVESTOR balance');
    });

    it('should allow investors to buy tokens in Crowdsale at 640 swapRate', async () => {

      const swapRate = new BigNumber(640);
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

    it('should allow investors to buy tokens in Crowdsale at 512 swapRate', async () => {

      const swapRate = new BigNumber(512);
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

    it('should allow investors to buy tokens in Crowdsale at 480 swapRate', async () => {

      const swapRate = new BigNumber(480);
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

    it('should allow investors to buy tokens in Crowdsale at 400 swapRate', async () => {

      const swapRate = new BigNumber(400);
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

    it('should allow investors to buy tokens in Crowdsale at 320 swapRate', async () => {

      const swapRate = new BigNumber(320);
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
      const swapRate = new BigNumber(800);
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
      const swapRate = new BigNumber(640);
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

    it('should refund investors when buying above Pre Sale cap', async () => {

      const INVESTORS = accounts[4];
      const swapRate = new BigNumber(800);
      const amountEth = new BigNumber(37501).mul(MOCK_ONE_ETH);
      const softCap = await dfsBCrowdsale.softCap.call(0);
      const balanceBefore = await web3.eth.getBalance(INVESTORS);

      // buy tokens
      await dfsBCrowdsale.buyTokens(INVESTORS, {value: amountEth, from: INVESTORS, gasPrice: 0});
      const tokensAmount = amountEth.mul(swapRate);
      const walletBalance = await web3.eth.getBalance(multisigWallet.address);
      const balanceInvestor = await tokenB.balanceOf.call(INVESTORS);
      const balanceAfter = await web3.eth.getBalance(INVESTORS);
      const ethInvested = balanceBefore.sub(balanceAfter);
      const ethRefunded = amountEth.sub(balanceBefore).add(balanceAfter);
      const totalSupply = await dfsBCrowdsale.totalSupply.call(0);
    assert.equal(totalSupply.toNumber(), softCap.toNumber(), 'rounding errors encountered');
      assert.equal((tokensAmount.sub(softCap)).div(swapRate).toNumber(), ethRefunded.toNumber(), 'amount refunded not correct');
      assert.equal(walletBalance.toNumber(), ethInvested.toNumber(), 'ether not deposited into wallet');
      assert.equal(balanceInvestor.toNumber(), ethInvested.mul(swapRate).toNumber(), 'balance not added for investor');
    });

    it('should refund investors when buying above Crowdsale cap', async () => {
      const INVESTORS = accounts[4];
      const swapRate = new BigNumber(640);
      const amountEth = new BigNumber(62501).mul(MOCK_ONE_ETH);
      const softCap = await dfsBCrowdsale.softCap.call(1);
      const balanceBefore = await web3.eth.getBalance(INVESTORS);

      // forward time by 20 days
      await increaseTime(86400 * PRE_SALE_DAYS);

      // buy tokens
      await dfsBCrowdsale.buyTokens(INVESTORS, {value: amountEth, from: INVESTORS, gasPrice: 0});
      const tokensAmount = amountEth.mul(swapRate);
      const walletBalance = await web3.eth.getBalance(multisigWallet.address);
      const balanceInvestor = await tokenB.balanceOf.call(INVESTORS);
      const balanceAfter = await web3.eth.getBalance(INVESTORS);
      const ethInvested = balanceBefore.sub(balanceAfter);
      const ethRefunded = amountEth.sub(balanceBefore).add(balanceAfter);
      const totalSupply = await dfsBCrowdsale.totalSupply.call(1);
      assert.equal(totalSupply.toNumber(), softCap.toNumber(), 'rounding errors encountered');
      assert.equal((tokensAmount.sub(softCap)).div(swapRate).toNumber(), ethRefunded.toNumber(), 'amount refunded not correct');
      assert.equal(walletBalance.toNumber(), ethInvested.toNumber(), 'ether not deposited into wallet');
      assert.equal(balanceInvestor.toNumber(), ethInvested.mul(swapRate).toNumber(), 'balance not added for investor');
    });

    it('should refund investors when buying above Pre Sale cap in 2 stages', async () => {

      const INVESTORS = accounts[4];
      const LAST_MIN_BUYER = accounts[5];
      const swapRate = new BigNumber(800);
      const amountEth1 = new BigNumber(37499).mul(MOCK_ONE_ETH);
      const tokensAmount1 = amountEth1.mul(swapRate);
      const softCap = await dfsBCrowdsale.softCap.call(0);

      // buy tokens
      await dfsBCrowdsale.buyTokens(INVESTORS, {value: amountEth1, from: INVESTORS, gasPrice: 0});

      const balanceInvestor = await tokenB.balanceOf.call(INVESTORS);
      assert.equal(balanceInvestor.toNumber(), tokensAmount1.toNumber(), 'tokens not deposited');

      const walletBalanceBefore = await web3.eth.getBalance(multisigWallet.address);
      const amountEth2 = new BigNumber(2).mul(MOCK_ONE_ETH);
      const tokensAmount2 = amountEth2.mul(swapRate);
      const balanceBefore = await web3.eth.getBalance(LAST_MIN_BUYER);

      await dfsBCrowdsale.buyTokens(LAST_MIN_BUYER, {value: amountEth2, from: LAST_MIN_BUYER, gasPrice: 0});

      const walletBalanceAfter = await web3.eth.getBalance(multisigWallet.address);
      const balanceBuyer = await tokenB.balanceOf.call(LAST_MIN_BUYER);
      const balanceAfter = await web3.eth.getBalance(LAST_MIN_BUYER);
      const ethInvested = balanceBefore.sub(balanceAfter);
      const ethRefunded = amountEth2.sub(balanceBefore).add(balanceAfter);
      const ethRefundedCal = (tokensAmount1.add(tokensAmount2).sub(softCap)).div(swapRate);
      const totalSupply = await dfsBCrowdsale.totalSupply.call(0);
      assert.equal(totalSupply.toNumber(), softCap.toNumber(), 'rounding errors encountered');
      assert.equal(ethRefundedCal.toNumber(), ethRefunded.toNumber(), 'amount refunded not correct');
      assert.equal(walletBalanceAfter.sub(walletBalanceBefore).toNumber(), ethInvested.toNumber(), 'ether not deposited into wallet');
      assert.equal(balanceBuyer.toNumber(), ethInvested.mul(swapRate).toNumber(), 'balance not added for investor');
    });

    it('should refund investors when buying above Crowdsale cap in 2 stages', async () => {


      const INVESTORS = accounts[4];
      const LAST_MIN_BUYER = accounts[5];
      const swapRate = new BigNumber(640);
      const amountEth1 = new BigNumber(62499).mul(MOCK_ONE_ETH);
      const tokensAmount1 = amountEth1.mul(swapRate);
      const softCap = await dfsBCrowdsale.softCap.call(1);

      // forward time by PRE_SALE_DAYS days
      await increaseTime(86400 * PRE_SALE_DAYS);

      // buy tokens
      await dfsBCrowdsale.buyTokens(INVESTORS, {value: amountEth1, from: INVESTORS, gasPrice: 0});

      const balanceInvestor = await tokenB.balanceOf.call(INVESTORS);
      assert.equal(balanceInvestor.toNumber(), tokensAmount1.toNumber(), 'tokens not deposited');

      const walletBalanceBefore = await web3.eth.getBalance(multisigWallet.address);
      const amountEth2 = new BigNumber(2).mul(MOCK_ONE_ETH);
      const tokensAmount2 = amountEth2.mul(swapRate);
      const balanceBefore = await web3.eth.getBalance(LAST_MIN_BUYER);

      await dfsBCrowdsale.buyTokens(LAST_MIN_BUYER, {value: amountEth2, from: LAST_MIN_BUYER, gasPrice: 0});

      const walletBalanceAfter = await web3.eth.getBalance(multisigWallet.address);
      const balanceBuyer = await tokenB.balanceOf.call(LAST_MIN_BUYER);
      const balanceAfter = await web3.eth.getBalance(LAST_MIN_BUYER);
      const ethInvested = balanceBefore.sub(balanceAfter);
      const ethRefunded = amountEth2.sub(balanceBefore).add(balanceAfter);
      const ethRefundedCal = (tokensAmount1.add(tokensAmount2).sub(softCap)).div(swapRate);
      const totalSupply = await dfsBCrowdsale.totalSupply.call(1);
      assert.equal(totalSupply.toNumber(), softCap.toNumber(), 'rounding errors encountered');
      assert.equal(ethRefundedCal.toNumber(), ethRefunded.toNumber(), 'amount refunded not correct');
      assert.equal(walletBalanceAfter.sub(walletBalanceBefore).toNumber(), ethInvested.toNumber(), 'ether not deposited into wallet');
      assert.equal(balanceBuyer.toNumber(), ethInvested.mul(swapRate).toNumber(), 'balance not added for investor');
    });

  });

  describe('#endReached', () => {
    it('should not allow investors to buy after cap reached during Institutional Pre Sale', async () => {

      const INVESTORS = accounts[4];
      const swapRate = new BigNumber(800);
      const amountEth = new BigNumber(37500).mul(MOCK_ONE_ETH);
      const balanceBefore = await web3.eth.getBalance(INVESTORS);
      // buy tokens
      await dfsBCrowdsale.buyTokens(INVESTORS, {value: amountEth, from: INVESTORS, gasPrice: 0});
      const walletBalance = await web3.eth.getBalance(multisigWallet.address);
      const balanceInvestor = await tokenB.balanceOf.call(INVESTORS);
      const balanceAfter = await web3.eth.getBalance(INVESTORS);
      const ethInvested = balanceBefore.sub(balanceAfter);
      assert.equal(walletBalance.toNumber(), amountEth.toNumber(), 'full amount transfer still took place');
      assert.equal(walletBalance.toNumber(), ethInvested.toNumber(), 'ether not deposited into wallet');
      assert.equal(balanceInvestor.toNumber(), ethInvested.mul(swapRate).toNumber(), 'balance not added for investor');

      try {
        await dfsBCrowdsale.buyTokens(INVESTORS, {value: MOCK_ONE_ETH, from: INVESTORS, gasPrice: 0})
      } catch(error) {
        assertJump(error);
      }
    });

    it('should not allow investors to buy after cap reached during Public Pre Sale', async () => {

      const INVESTORS = accounts[4];
      const swapRate = new BigNumber(640);
      const amountEth = new BigNumber(62500).mul(MOCK_ONE_ETH);
      const balanceBefore = await web3.eth.getBalance(INVESTORS);

      // forward time by 20 days
      await increaseTime(86400 * 10);

      // buy tokens
      await dfsBCrowdsale.buyTokens(INVESTORS, {value: amountEth, from: INVESTORS, gasPrice: 0});
      const walletBalance = await web3.eth.getBalance(multisigWallet.address);
      const balanceInvestor = await tokenB.balanceOf.call(INVESTORS);
      const balanceAfter = await web3.eth.getBalance(INVESTORS);
      const ethInvested = balanceBefore.sub(balanceAfter);
      assert.equal(walletBalance.toNumber(), amountEth.toNumber(), 'full amount transfer still took place');
      assert.equal(walletBalance.toNumber(), ethInvested.toNumber(), 'ether not deposited into wallet');
      assert.equal(balanceInvestor.toNumber(), ethInvested.mul(swapRate).toNumber(), 'balance not added for investor');

      try {
        await dfsBCrowdsale.buyTokens(INVESTORS, {value: MOCK_ONE_ETH, from: INVESTORS, gasPrice: 0})
      } catch(error) {
        assertJump(error);
      }
    });

    it('should not allow investors to buy after cap reached during Pre Sale', async () => {

      const INVESTORS = accounts[4];
      const swapRate = new BigNumber(800);
      const amountEth = new BigNumber(37501).mul(MOCK_ONE_ETH);
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
      const swapRate = new BigNumber(640);
      const amountEth = new BigNumber(62501).mul(MOCK_ONE_ETH);
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
