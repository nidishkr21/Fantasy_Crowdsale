pragma solidity ^0.4.11;

import './CrowdsaleA.sol';

/**
 * @title CappedCrowdsaleA
 * @dev Extension of CrowdsaleA with a max amount of funds raised
 */
contract CappedCrowdsaleA is CrowdsaleA {

  uint256[2] public softCap;
  uint256[2] public totalSupply;
  bool[2] public end;


  function CappedCrowdsaleA() {
    softCap = [60000000e18, 200000000e18];
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
