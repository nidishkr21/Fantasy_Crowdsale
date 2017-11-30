pragma solidity ^0.4.11;

import './CrowdsaleB.sol';

/**
 * @title CappedCrowdsaleB
 * @dev Extension of CrowdsaleB with a max amount of funds raised
 */
contract CappedCrowdsaleB is CrowdsaleB {

  uint256[2] public softCap;
  uint256[2] public totalSupply;


  function CappedCrowdsaleB() {
    softCap = [30000000e18, 40000000e18];
  }


  function withSoftCap() internal returns (bool) {
    if (now < startTime + preSaleTime) {
      return totalSupply[0] <= softCap[0];
    }
    return totalSupply[1] <= softCap[1];
  }


  function recordSupply(uint256 tokens) internal returns (uint256) {
    if (now < startTime + preSaleTime) {
       totalSupply[0] = totalSupply[0].add(tokens);
       return;
    }
    totalSupply[1] = totalSupply[1].add(tokens);
  }


  function softCapReached(uint256 phase) internal returns (bool) {
    return totalSupply[phase] >= softCap[phase];
  }

  // overriding CrowdsaleB#validPurchase to add extra hardCap logic
  // @return true if investors can buy at the moment
  function validPurchase() internal constant returns (bool) {
    return super.validPurchase() && withSoftCap();
  }

  // overriding CrowdsaleB#hasEnded to add hardCap logic
  // @return true if CrowdsaleB event has ended
  function saleHasEnded() public constant returns (bool) {
    return super.saleHasEnded() || softCapReached(1);
  }

  // @return true if presale event has ended
  function preSaleHasEnded() public constant returns (bool) {
    return now >= (startTime + 7 days) || softCapReached(0);
  }

}
