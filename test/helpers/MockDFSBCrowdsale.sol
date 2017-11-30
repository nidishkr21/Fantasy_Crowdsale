pragma solidity ^0.4.11;

import "../../contracts/crowdsale/B/DFSBCrowdsale.sol";


/**
 * @title SampleCrowdsale
 * @dev This is an example of a fully fledged CrowdsaleA.
 * The way to add new features to a base CrowdsaleA is by multiple inheritance.
 * In this example we are providing following extensions:
 * HardCappedCrowdsale - sets a max boundary for raised funds
 * RefundableCrowdsale - set a min goal to be reached and returns funds if it's not met
 *
 * After adding multiple features it's good practice to run integration tests
 * to ensure that subcontracts works together as intended.
 */
contract MockDFSBCrowdsale is DFSBCrowdsale {

  function MockDFSBCrowdsale(uint256 _startTime, uint256 _preSaleDays, address _token, address _wallet)
    DFSBCrowdsale(_startTime, _preSaleDays, _token, _wallet)
  {
    // DILUTING ALL VALUES BY 10^6 for testing
    softCap = [30000000e12, 40000000e12];
  }

}
