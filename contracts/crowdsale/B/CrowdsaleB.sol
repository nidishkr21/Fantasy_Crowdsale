pragma solidity ^0.4.11;

import '../../token/B/DFSTokenB.sol';
import '../../SafeMath.sol';

/**
 * @title CrowdsaleB
 * @dev CrowdsaleB is a base contract for managing a token CrowdsaleB.
 * Crowdsales have a start and end timestamps, where investors can make
 * token purchases and the CrowdsaleB will assign them tokens based
 * on a token per ETH rate. Funds collected are forwarded to a wallet
 * as they arrive.
 */
contract CrowdsaleB {
  using SafeMath for uint256;
  // The token being sold
  DFSTokenB public token;

  // start and end timestamps where investments are allowed (both inclusive)
  uint256 public startTime;
  uint256 public preSaleTime;
  uint256 public endTime;

  // address where funds are collected
  address public wallet;

  // amount of raised money in wei
  uint256 public weiRaised;

  /**
   * event for token purchase logging
   * @param purchaser who paid for the tokens
   * @param beneficiary who got the tokens
   * @param value weis paid for purchase
   * @param amount amount of tokens purchased
   */
  event TokenPurchase(address indexed purchaser, address indexed beneficiary, uint256 value, uint256 amount);


  function CrowdsaleB(uint256 _startTime, uint256 _preSaleDays, address _token, address _wallet) {
    require(_wallet != address(0));

    startTime = _startTime;
    preSaleTime = _preSaleDays.mul(1 days);
    endTime = startTime + preSaleTime + (31 days);
    wallet = _wallet;
    token = DFSTokenB(_token);
  }

  // fallback function can be used to buy tokens
  function () payable {
    buyTokens(msg.sender);
  }

  // low level token purchase function
  function buyTokens(address beneficiary) public payable;

  // send ether to the fund collection wallet
  // override to create custom fund forwarding mechanisms
  function forwardFunds(uint256 _value) internal {
    wallet.transfer(msg.value);
  }

  // @return true if the transaction can buy tokens
  function validatePurchase() internal constant returns (bool) {
    bool withinPeriod = now >= startTime && now <= endTime;
    bool nonZeroPurchase = msg.value != 0;
    return withinPeriod && nonZeroPurchase;
  }

  // @return true if CrowdsaleB event has ended
  function saleHasEnded() public constant returns (bool) {
    return now > endTime;
  }

}
