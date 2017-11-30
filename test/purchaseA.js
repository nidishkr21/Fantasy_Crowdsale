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

  describe('#purchase', () => {
    it('should allow investors to buy tokens in Pre Sale at 4125 swapRate', async () => {

      const swapRate = new BigNumber(4125);
      const INVESTOR = accounts[4];

      // buy tokens
      await dfsACrowdsale.buyTokens(INVESTOR, {value: MOCK_ONE_ETH, from: INVESTOR});
      const walletBalance = await web3.eth.getBalance(multisigWallet.address);
      const tokensBalance = await tokenA.balanceOf.call(INVESTOR);

      const tokensAmount = swapRate.mul(MOCK_ONE_ETH);
      assert.equal(walletBalance.toNumber(), MOCK_ONE_ETH, 'ether not deposited into the wallet');
      assert.equal(tokensBalance.toNumber(), tokensAmount.toNumber(), 'tokens not deposited into the INVESTOR balance');
    });

    it('should allow investors to buy tokens in Crowdsale at 3300 swapRate', async () => {

      const swapRate = new BigNumber(3300);
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

    it('should allow investors to buy tokens in Crowdsale at 2750 swapRate', async () => {

      const swapRate = new BigNumber(2750);
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

    it('should allow investors to buy tokens in Crowdsale at 2357 swapRate', async () => {

      const swapRate = new BigNumber(2357);
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

    it('should allow investors to buy tokens in Crowdsale at 2062 swapRate', async () => {

      const swapRate = new BigNumber(2062);
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

    it('should allow investors to buy tokens in Crowdsale at 1833 swapRate', async () => {

      const swapRate = new BigNumber(1833);
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
      const swapRate = new BigNumber(4125);
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
      const swapRate = new BigNumber(3300);
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
    it('should prevent investors from buying above Pre Sale cap', async () => {

      const INVESTORS = accounts[4];
      const amountEth = new BigNumber(14546).mul(MOCK_ONE_ETH);

      // try to buy tokens
      try {
        await dfsACrowdsale.buyTokens(INVESTORS, {value: amountEth, from: INVESTORS});
        assert.fail('should have thrown before');
      } catch(error) {
        assertJump(error);
        const walletBalance = await web3.eth.getBalance(multisigWallet.address);
        const balanceInvestor = await tokenA.balanceOf.call(INVESTORS);
        assert.equal(walletBalance.toNumber(), 0, 'ether still deposited into the wallet');
        assert.equal(balanceInvestor.toNumber(), 0, 'balance still added for investor');
      }

    });

    it('should prevent investors from buying above Crowdsale cap', async () => {

      const INVESTORS = accounts[4];
      const amountEth = new BigNumber(60607).mul(MOCK_ONE_ETH);
      // forward time by PRE_SALE_DAYS days
      await increaseTime(86400 * PRE_SALE_DAYS);

      // try to buy tokens
      try {
        await dfsACrowdsale.buyTokens(INVESTORS, {value: amountEth, from: INVESTORS});
        assert.fail('should have thrown before');
      } catch(error) {
        assertJump(error);
        const walletBalance = await web3.eth.getBalance(multisigWallet.address);
        const balanceInvestor = await tokenA.balanceOf.call(INVESTORS);
        assert.equal(walletBalance.toNumber(), 0, 'ether still deposited into the wallet');
        assert.equal(balanceInvestor.toNumber(), 0, 'balance still added for investor');
      }
    });
  });
})
