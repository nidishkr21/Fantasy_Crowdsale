pragma solidity ^0.4.11;

import '../../SafeMath.sol';


/**
 * @title CappedCrowdsaleA
 * @dev Extension of CrowdsaleA with a max amount of funds raised
 */
contract CrowdsaleA {
  using SafeMath for uint256;

  // The token being sold
  address public tokenAddr;
  uint256 public startTime;
  uint256 public preSaleTime;
  uint256 public endTime;
  address public wallet;
  uint256 public weiRaised;

  uint256[2] public softCap;
  uint256[2] public totalSupply;
  bool[2] public end;

  event TokenPurchase(address indexed purchaser, address indexed beneficiary, uint256 value, uint256 amount);

  function CrowdsaleA(uint256 _startTime, uint256 _preSaleDays, address _tokenAddr, address _wallet) {
    require(_wallet != address(0));

    startTime = _startTime;
    preSaleTime = _preSaleDays.mul(1 days);
    endTime = startTime + preSaleTime + (31 days);
    wallet = _wallet;
    tokenAddr = _tokenAddr;
    softCap = [60000000e18, 200000000e18];
  }


  function withSoftCap(uint256 phase, uint256 tokens) internal returns (bool) {
    return totalSupply[phase].add(tokens) < softCap[phase];
  }

  function setSupply(uint256 newTotalSupply, uint256 phase) internal returns (uint256) {
    totalSupply[phase] = newTotalSupply;
  }

  function validatePurchase() internal constant returns (bool) {
    bool withinPeriod = now >= startTime && now <= endTime;
    bool nonZeroPurchase = msg.value != 0;
    return withinPeriod && nonZeroPurchase;
  }

  // overriding CrowdsaleA#hasEnded to add hardCap logic
  // @return true if CrowdsaleA event has ended
  function saleHasEnded() public constant returns (bool) {
    return now > endTime || !withSoftCap(1, 0);
  }

  // @return true if presale event has ended
  function preSaleHasEnded() public constant returns (bool) {
    return now >= (startTime + 7 days) || !withSoftCap(0, 0);
  }

}
