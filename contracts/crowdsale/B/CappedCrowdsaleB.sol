pragma solidity ^0.4.11;

import './CrowdsaleB.sol';

/**
 * @title CappedCrowdsaleB
 * @dev Extension of CrowdsaleB with a max amount of funds raised
 */
contract CappedCrowdsaleB is CrowdsaleB {

  uint256[2] public softCap;
  uint256[2] public totalSupply;
  bool[2] public end;

  function CappedCrowdsaleB() {
    softCap = [30000000e18, 40000000e18];
  }

  function withSoftCap(uint256 phase) internal returns (bool) {
    return totalSupply[phase] < softCap[phase];
  }

  function setSupply(uint256 newTotalSupply, uint256 phase) internal returns (uint256) {
    totalSupply[phase] = newTotalSupply;
  }

  // overriding CrowdsaleA#hasEnded to add hardCap logic
  // @return true if CrowdsaleA event has ended
  function saleHasEnded() public constant returns (bool) {
    return super.saleHasEnded() || !withSoftCap(1);
  }

  // @return true if presale event has ended
  function preSaleHasEnded() public constant returns (bool) {
    return now >= (startTime + 7 days) || !withSoftCap(0);
  }

}
