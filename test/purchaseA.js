const MockDFSACrowdsale = artifacts.require('./helpers/MockDFSACrowdsale.sol');
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

contract('DFSACrwodsale', (accounts) => {
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

  it('should allow succesful completion', async () => {

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
  });

  describe('#purchase', () => {
    it('should allow investors to buy tokens in Pre Sale at 4000 swapRate', async () => {

      const swapRate = new BigNumber(4000);
      const INVESTOR = accounts[4];

      // buy tokens
      await dfsACrowdsale.buyTokens(INVESTOR, {value: MOCK_ONE_ETH, from: INVESTOR});
      const walletBalance = await web3.eth.getBalance(multisigWallet.address);
      const tokensBalance = await tokenA.balanceOf.call(INVESTOR);

      const tokensAmount = swapRate.mul(MOCK_ONE_ETH);
      assert.equal(walletBalance.toNumber(), MOCK_ONE_ETH, 'ether not deposited into the wallet');
      assert.equal(tokensBalance.toNumber(), tokensAmount.toNumber(), 'tokens not deposited into the INVESTOR balance');
    });

    it('should allow investors to buy tokens in Crowdsale at 3200 swapRate', async () => {

      const swapRate = new BigNumber(3200);
      const INVESTOR = accounts[4];

      // forward time by PRE_SALE_DAYS
      await increaseTime(86400 * PRE_SALE_DAYS);

      // buy tokens
      await dfsACrowdsale.buyTokens(INVESTOR, {value: MOCK_ONE_ETH, from: INVESTOR});
      const walletBalance = await web3.eth.getBalance(multisigWallet.address);
      const tokensBalance = await tokenA.balanceOf.call(INVESTOR);

      const tokensAmount = swapRate.mul(MOCK_ONE_ETH);
      assert.equal(walletBalance.toNumber(), MOCK_ONE_ETH, 'ether not deposited into the wallet');
      assert.equal(tokensBalance.toNumber(), tokensAmount.toNumber(), 'tokens not deposited into the INVESTOR balance');
    });

    it('should allow investors to buy tokens in Crowdsale at 2560 swapRate', async () => {

      const swapRate = new BigNumber(2560);
      const INVESTOR = accounts[4];

      // forward time by PRE_SALE_DAYS + 7 days
      await increaseTime(86400 * (PRE_SALE_DAYS + 7));

      // buy tokens
      await dfsACrowdsale.buyTokens(INVESTOR, {value: MOCK_ONE_ETH, from: INVESTOR});
      const walletBalance = await web3.eth.getBalance(multisigWallet.address);
      const tokensBalance = await tokenA.balanceOf.call(INVESTOR);

      const tokensAmount = swapRate.mul(MOCK_ONE_ETH);
      assert.equal(walletBalance.toNumber(), MOCK_ONE_ETH, 'ether not deposited into the wallet');
      assert.equal(tokensBalance.toNumber(), tokensAmount.toNumber(), 'tokens not deposited into the INVESTOR balance');
    });

    it('should allow investors to buy tokens in Crowdsale at 2400 swapRate', async () => {

      const swapRate = new BigNumber(2400);
      const INVESTOR = accounts[4];

      // forward time by PRE_SALE_DAYS + 7 days
      await increaseTime(86400 * (PRE_SALE_DAYS + 13));

      // buy tokens
      await dfsACrowdsale.buyTokens(INVESTOR, {value: MOCK_ONE_ETH, from: INVESTOR});
      const walletBalance = await web3.eth.getBalance(multisigWallet.address);
      const tokensBalance = await tokenA.balanceOf.call(INVESTOR);

      const tokensAmount = swapRate.mul(MOCK_ONE_ETH);
      assert.equal(walletBalance.toNumber(), MOCK_ONE_ETH, 'ether not deposited into the wallet');
      assert.equal(tokensBalance.toNumber(), tokensAmount.toNumber(), 'tokens not deposited into the INVESTOR balance');
    });

    it('should allow investors to buy tokens in Crowdsale at 2048 swapRate', async () => {

      const swapRate = new BigNumber(2048);
      const INVESTOR = accounts[4];

      // forward time by PRE_SALE_DAYS + 13 days
      await increaseTime(86400 * (PRE_SALE_DAYS + 19));

      // buy tokens
      await dfsACrowdsale.buyTokens(INVESTOR, {value: MOCK_ONE_ETH, from: INVESTOR});
      const walletBalance = await web3.eth.getBalance(multisigWallet.address);
      const tokensBalance = await tokenA.balanceOf.call(INVESTOR);

      const tokensAmount = swapRate.mul(MOCK_ONE_ETH);
      assert.equal(walletBalance.toNumber(), MOCK_ONE_ETH, 'ether not deposited into the wallet');
      assert.equal(tokensBalance.toNumber(), tokensAmount.toNumber(), 'tokens not deposited into the INVESTOR balance');
    });

    it('should allow investors to buy tokens in Crowdsale at 1880 swapRate', async () => {

      const swapRate = new BigNumber(1880);
      const INVESTOR = accounts[4];

      // forward time by 10 days
      await increaseTime(86400 * (PRE_SALE_DAYS + 25));

      // buy tokens
      await dfsACrowdsale.buyTokens(INVESTOR, {value: MOCK_ONE_ETH, from: INVESTOR});
      const walletBalance = await web3.eth.getBalance(multisigWallet.address);
      const tokensBalance = await tokenA.balanceOf.call(INVESTOR);

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
        await dfsACrowdsale.buyTokens(INVESTOR, {value: MOCK_ONE_ETH, from: INVESTOR});
      } catch(error) {
        assertJump(error);
        const walletBalance = await web3.eth.getBalance(multisigWallet.address);
        const tokensBalance = await tokenA.balanceOf.call(INVESTOR);
        assert.equal(walletBalance.toNumber(), 0, 'ether deposited into the wallet');
        assert.equal(tokensBalance.toNumber(), 0, 'tokens deposited into the INVESTOR balance');
      }
    });

  });

  describe('#belowSoftCaps', () => {
    it('should allow investors buying just below Pre Sale cap', async () => {

      const INVESTORS = accounts[4];
      const swapRate = new BigNumber(4000);
      const amountEth = new BigNumber(14545).mul(MOCK_ONE_ETH);
      const tokensAmount = swapRate.mul(amountEth);

      //  buy tokens
      await dfsACrowdsale.buyTokens(INVESTORS, {value: amountEth, from: INVESTORS});
      const walletBalance = await web3.eth.getBalance(multisigWallet.address);
      const balanceInvestor = await tokenA.balanceOf.call(INVESTORS);
      const totalSupplyPhase1 = await dfsACrowdsale.totalSupply.call(0);
      const totalSupplyToken = await tokenA.totalSupply.call();

      assert.equal(walletBalance.toNumber(), amountEth.toNumber(), 'ether still deposited into the wallet');
      assert.equal(balanceInvestor.toNumber(), tokensAmount.toNumber(), 'balance still added for investor');
      assert.equal(totalSupplyPhase1.toNumber(), tokensAmount.toNumber(), 'balance not added to totalSupply');
    });

    it('should allow investors buying just below Crowdsale cap', async () => {

      const INVESTORS = accounts[4];
      const swapRate = new BigNumber(3200);
      const amountEth = new BigNumber(60606).mul(MOCK_ONE_ETH);
      const tokensAmount = swapRate.mul(amountEth);

      // forward time by PRE_SALE_DAYS days
      await increaseTime(86400 * PRE_SALE_DAYS);

      // buy tokens

      await dfsACrowdsale.buyTokens(INVESTORS, {value: amountEth, from: INVESTORS});
      const walletBalance = await web3.eth.getBalance(multisigWallet.address);
      const balanceInvestor = await tokenA.balanceOf.call(INVESTORS);
      const totalSupplyPhase2 = await dfsACrowdsale.totalSupply.call(1);

      assert.equal(walletBalance.toNumber(), amountEth.toNumber(), 'ether not deposited into the wallet');
      assert.equal(balanceInvestor.toNumber(), tokensAmount.toNumber(), 'balance not added for investor');
      assert.equal(totalSupplyPhase2.toNumber(), tokensAmount.toNumber(), 'balance not added to totalSupply');
    });

  });


  describe('#overSoftCaps', () => {
    it('should refund investors when buying above Pre Sale cap', async () => {

      const INVESTORS = accounts[4];
      const swapRate = new BigNumber(4000);
      const amountEth = new BigNumber(15001).mul(MOCK_ONE_ETH);
      const softCap = await dfsACrowdsale.softCap.call(0);
      const balanceBefore = await web3.eth.getBalance(INVESTORS);

      // buy tokens
      await dfsACrowdsale.buyTokens(INVESTORS, {value: amountEth, from: INVESTORS, gasPrice: 0});
      const tokensAmount = amountEth.mul(swapRate);
      const walletBalance = await web3.eth.getBalance(multisigWallet.address);
      const balanceInvestor = await tokenA.balanceOf.call(INVESTORS);
      const balanceAfter = await web3.eth.getBalance(INVESTORS);
      const ethInvested = balanceBefore.sub(balanceAfter);
      const ethRefunded = amountEth.sub(balanceBefore).add(balanceAfter);
      const ethRefundedCal = (tokensAmount.sub(softCap)).div(swapRate);
      const totalSupply = await dfsACrowdsale.totalSupply.call(0);
      assert.equal(totalSupply.toNumber(), softCap.toNumber(), 'rounding errors encountered');
      assert.equal(ethRefundedCal.toNumber(), ethRefunded.toNumber(), 'amount refunded not correct');
      assert.equal(walletBalance.toNumber(), ethInvested.toNumber(), 'ether not deposited into wallet');
      assert.equal(balanceInvestor.toNumber(), ethInvested.mul(swapRate).toNumber(), 'balance not added for investor');
    });

    it('should refund investors when buying above Crowdsale cap', async () => {
      const INVESTORS = accounts[4];
      const swapRate = new BigNumber(3200);
      const amountEth = new BigNumber(62501).mul(MOCK_ONE_ETH);
      const softCap = await dfsACrowdsale.softCap.call(1);
      const balanceBefore = await web3.eth.getBalance(INVESTORS);

      // forward time by 20 days
      await increaseTime(86400 * PRE_SALE_DAYS);

      // buy tokens
      await dfsACrowdsale.buyTokens(INVESTORS, {value: amountEth, from: INVESTORS, gasPrice: 0});
      const tokensAmount = amountEth.mul(swapRate);
      const walletBalance = await web3.eth.getBalance(multisigWallet.address);
      const balanceInvestor = await tokenA.balanceOf.call(INVESTORS);
      const balanceAfter = await web3.eth.getBalance(INVESTORS);
      const ethInvested = balanceBefore.sub(balanceAfter);
      const ethRefunded = amountEth.sub(balanceBefore).add(balanceAfter);
      const ethRefundedCal = (tokensAmount.sub(softCap)).div(swapRate);
      const totalSupply = await dfsACrowdsale.totalSupply.call(1);
      assert.equal(totalSupply.toNumber(), softCap.toNumber(), 'rounding errors encountered');
      assert.equal(ethRefundedCal.toNumber(), ethRefunded.toNumber(), 'amount refunded not correct');
      assert.equal(walletBalance.toNumber(), ethInvested.toNumber(), 'ether not deposited into wallet');
      assert.equal(balanceInvestor.toNumber(), ethInvested.mul(swapRate).toNumber(), 'balance not added for investor');
    });

      it('should refund investors when buying above Pre Sale cap in 2 stages', async () => {

      const INVESTORS = accounts[4];
      const LAST_MIN_BUYER = accounts[5];
      const swapRate = new BigNumber(4000);
      const amountEth1 = new BigNumber(14999).mul(MOCK_ONE_ETH);
      const tokensAmount1 = amountEth1.mul(swapRate);
      const softCap = await dfsACrowdsale.softCap.call(0);

      // buy tokens
      await dfsACrowdsale.buyTokens(INVESTORS, {value: amountEth1, from: INVESTORS, gasPrice: 0});

      const balanceInvestor = await tokenA.balanceOf.call(INVESTORS);
      assert.equal(balanceInvestor.toNumber(), tokensAmount1.toNumber(), 'tokens not deposited');

      const walletBalanceBefore = await web3.eth.getBalance(multisigWallet.address);
      const amountEth2 = new BigNumber(2).mul(MOCK_ONE_ETH);
      const tokensAmount2 = amountEth2.mul(swapRate);
      const balanceBefore = await web3.eth.getBalance(LAST_MIN_BUYER);

      await dfsACrowdsale.buyTokens(LAST_MIN_BUYER, {value: amountEth2, from: LAST_MIN_BUYER, gasPrice: 0});

      const walletBalanceAfter = await web3.eth.getBalance(multisigWallet.address);
      const balanceBuyer = await tokenA.balanceOf.call(LAST_MIN_BUYER);
      const balanceAfter = await web3.eth.getBalance(LAST_MIN_BUYER);
      const ethInvested = balanceBefore.sub(balanceAfter);
      const ethRefunded = amountEth2.sub(balanceBefore).add(balanceAfter);
      const ethRefundedCal = (tokensAmount1.add(tokensAmount2).sub(softCap)).div(swapRate);
      const totalSupply = await dfsACrowdsale.totalSupply.call(0);
      assert.equal(totalSupply.toNumber(), softCap.toNumber(), 'rounding errors encountered');
      assert.equal(ethRefundedCal.toNumber(), ethRefunded.toNumber(), 'amount refunded not correct');
      assert.equal(walletBalanceAfter.sub(walletBalanceBefore).toNumber(), ethInvested.toNumber(), 'ether not deposited into wallet');
      assert.equal(balanceBuyer.toNumber(), ethInvested.mul(swapRate).toNumber(), 'balance not added for investor');
    });

    it('should refund investors when buying above Crowdsale cap in 2 stages', async () => {


      const INVESTORS = accounts[4];
      const LAST_MIN_BUYER = accounts[5];
      const swapRate = new BigNumber(3200);
      const amountEth1 = new BigNumber(62499).mul(MOCK_ONE_ETH);
      const tokensAmount1 = amountEth1.mul(swapRate);
      const softCap = await dfsACrowdsale.softCap.call(1);

      // forward time by 10 days
      await increaseTime(86400 * PRE_SALE_DAYS);

      // buy tokens
      await dfsACrowdsale.buyTokens(INVESTORS, {value: amountEth1, from: INVESTORS, gasPrice: 0});

      const balanceInvestor = await tokenA.balanceOf.call(INVESTORS);
      assert.equal(balanceInvestor.toNumber(), tokensAmount1.toNumber(), 'tokens not deposited');

      const walletBalanceBefore = await web3.eth.getBalance(multisigWallet.address);
      const amountEth2 = new BigNumber(2).mul(MOCK_ONE_ETH);
      const tokensAmount2 = amountEth2.mul(swapRate);
      const balanceBefore = await web3.eth.getBalance(LAST_MIN_BUYER);

      await dfsACrowdsale.buyTokens(LAST_MIN_BUYER, {value: amountEth2, from: LAST_MIN_BUYER, gasPrice: 0});

      const walletBalanceAfter = await web3.eth.getBalance(multisigWallet.address);
      const balanceBuyer = await tokenA.balanceOf.call(LAST_MIN_BUYER);
      const balanceAfter = await web3.eth.getBalance(LAST_MIN_BUYER);
      const ethInvested = balanceBefore.sub(balanceAfter);
      const ethRefunded = amountEth2.sub(balanceBefore).add(balanceAfter);
      const ethRefundedCal = (tokensAmount1.add(tokensAmount2).sub(softCap)).div(swapRate);
      const totalSupply = await dfsACrowdsale.totalSupply.call(1);
      assert.equal(totalSupply.toNumber(), softCap.toNumber(), 'rounding errors encountered');
      assert.equal(ethRefundedCal.toNumber(), ethRefunded.toNumber(), 'amount refunded not correct');
      assert.equal(walletBalanceAfter.sub(walletBalanceBefore).toNumber(), ethInvested.toNumber(), 'ether not deposited into wallet');
      assert.equal(balanceBuyer.toNumber(), ethInvested.mul(swapRate).toNumber(), 'balance not added for investor');
    });

  });

  describe('#endReached', () => {
    it('should not allow investors to buy after cap reached during Institutional Pre Sale', async () => {

      const INVESTORS = accounts[4];
      const swapRate = new BigNumber(4000);
      const amountEth = new BigNumber(15000).mul(MOCK_ONE_ETH);
      const balanceBefore = await web3.eth.getBalance(INVESTORS);
      // buy tokens
      await dfsACrowdsale.buyTokens(INVESTORS, {value: amountEth, from: INVESTORS, gasPrice: 0});
      const walletBalance = await web3.eth.getBalance(multisigWallet.address);
      const balanceInvestor = await tokenA.balanceOf.call(INVESTORS);
      const balanceAfter = await web3.eth.getBalance(INVESTORS);
      const ethInvested = balanceBefore.sub(balanceAfter);
      assert.equal(walletBalance.toNumber(), amountEth.toNumber(), 'full amount transfer still took place');
      assert.equal(walletBalance.toNumber(), ethInvested.toNumber(), 'ether not deposited into wallet');
      assert.equal(balanceInvestor.toNumber(), ethInvested.mul(swapRate).toNumber(), 'balance not added for investor');

      try {
        await dfsACrowdsale.buyTokens(INVESTORS, {value: MOCK_ONE_ETH, from: INVESTORS, gasPrice: 0})
      } catch(error) {
        assertJump(error);
      }
    });

    it('should not allow investors to buy after cap reached during Public Pre Sale', async () => {

      const INVESTORS = accounts[4];
      const swapRate = new BigNumber(3200);
      const amountEth = new BigNumber(62500).mul(MOCK_ONE_ETH);
      const balanceBefore = await web3.eth.getBalance(INVESTORS);

      // forward time by 20 days
      await increaseTime(86400 * 10);

      // buy tokens
      await dfsACrowdsale.buyTokens(INVESTORS, {value: amountEth, from: INVESTORS, gasPrice: 0});
      const walletBalance = await web3.eth.getBalance(multisigWallet.address);
      const balanceInvestor = await tokenA.balanceOf.call(INVESTORS);
      const balanceAfter = await web3.eth.getBalance(INVESTORS);
      const ethInvested = balanceBefore.sub(balanceAfter);
      assert.equal(walletBalance.toNumber(), amountEth.toNumber(), 'full amount transfer still took place');
      assert.equal(walletBalance.toNumber(), ethInvested.toNumber(), 'ether not deposited into wallet');
      assert.equal(balanceInvestor.toNumber(), ethInvested.mul(swapRate).toNumber(), 'balance not added for investor');

      try {
        await dfsACrowdsale.buyTokens(INVESTORS, {value: MOCK_ONE_ETH, from: INVESTORS, gasPrice: 0})
      } catch(error) {
        assertJump(error);
      }
    });

    it('should not allow investors to buy after cap reached during Pre Sale', async () => {

      const INVESTORS = accounts[4];
      const swapRate = new BigNumber(4000);
      const amountEth = new BigNumber(15001).mul(MOCK_ONE_ETH);
      const balanceBefore = await web3.eth.getBalance(INVESTORS);
      // buy tokens
      await dfsACrowdsale.buyTokens(INVESTORS, {value: amountEth, from: INVESTORS, gasPrice: 0});
      const walletBalance = await web3.eth.getBalance(multisigWallet.address);
      const balanceInvestor = await tokenA.balanceOf.call(INVESTORS);
      const balanceAfter = await web3.eth.getBalance(INVESTORS);
      const ethInvested = balanceBefore.sub(balanceAfter);
      assert(walletBalance.toNumber() < amountEth.toNumber(), 'full amount transfer still took place');
      assert.equal(walletBalance.toNumber(), ethInvested.toNumber(), 'ether not deposited into wallet');
      assert.equal(balanceInvestor.toNumber(), ethInvested.mul(swapRate).toNumber(), 'balance not added for investor');

      try {
        await dfsACrowdsale.buyTokens(INVESTORS, {value: MOCK_ONE_ETH, from: INVESTORS, gasPrice: 0})
      } catch(error) {
        assertJump(error);
      }
    });

    it('should not allow investors to buy after cap reached during crowdsale', async () => {

      const INVESTORS = accounts[4];
      const swapRate = new BigNumber(3200);
      const amountEth = new BigNumber(62501).mul(MOCK_ONE_ETH);
      const balanceBefore = await web3.eth.getBalance(INVESTORS);

      // forward time by 20 days
      await increaseTime(86400 * 10);

      // buy tokens
      await dfsACrowdsale.buyTokens(INVESTORS, {value: amountEth, from: INVESTORS, gasPrice: 0});
      const walletBalance = await web3.eth.getBalance(multisigWallet.address);
      const balanceInvestor = await tokenA.balanceOf.call(INVESTORS);
      const balanceAfter = await web3.eth.getBalance(INVESTORS);
      const ethInvested = balanceBefore.sub(balanceAfter);
      assert(walletBalance.toNumber() < amountEth.toNumber(), 'full amount transfer still took place');
      assert.equal(walletBalance.toNumber(), ethInvested.toNumber(), 'ether not deposited into wallet');
      assert.equal(balanceInvestor.toNumber(), ethInvested.mul(swapRate).toNumber(), 'balance not added for investor');

      try {
        await dfsACrowdsale.buyTokens(INVESTORS, {value: MOCK_ONE_ETH, from: INVESTORS, gasPrice: 0})
      } catch(error) {
        assertJump(error);
      }
    });
  });
})
