pragma solidity ^0.4.11;

import "../../Pausable.sol";
import "./CappedCrowdsaleA.sol";
import "../../token/A/DFSTokenA.sol";


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
contract DFSACrowdsale is Pausable, CappedCrowdsaleA {

  // how many token units a buyer gets per wei
  mapping (uint => uint) internal swapRate;

  function DFSACrowdsale(uint256 _startTime, uint256 _preSaleDays, address _token, address _wallet)
    CappedCrowdsaleA()
    CrowdsaleA(_startTime, _preSaleDays, _token, _wallet)
  {
    swapRate[5] = 4125;
    swapRate[4] = 3300;
    swapRate[3] = 2750;
    swapRate[2] = 2357;
    swapRate[1] = 2062;
    swapRate[0] = 1833;
  }


  function rate() constant returns (uint256) {
    if(now < (startTime + preSaleTime)) {
      return swapRate[5];
    }

    else if(now < (startTime + preSaleTime + 7 days)) {
      return swapRate[4];
    }

    else {
      uint256 i = (now.sub(startTime.add(preSaleTime).add(7 days))).div(6 days);
      require(i <= 4);
      return swapRate[3-i];
    }
  }

  function setContracts(address _token, address _wallet) onlyAdmins whenPaused {
    wallet = _wallet;
    token = DFSTokenA(_token);
  }

  function transferTokenOwnership(address _nextOwner) onlyAdmins whenPaused {
    token.transferOwnership(_nextOwner);
  }

  // overriding buyTokens function from CrowdsaleA
  function buyTokens(address beneficiary) public whenNotPaused payable {
    uint256 phase = now >= startTime.add(preSaleTime) ? 1 : 0;

    require(!end[phase]);
    require(beneficiary != address(0));
    require(rate() > 0);
    require(validatePurchase());

    uint256 weiAmount = msg.value;
    // calculate token amount to be created
    uint256 tokens = weiAmount.mul(rate());

    setSupply(totalSupply[phase].add(tokens), phase);

    if(!withSoftCap(phase)) {
      end[phase] = true;
      uint256 returnTokens = totalSupply[phase].sub(softCap[phase]);
      uint256 refund = returnTokens.div(rate());
      tokens = tokens.sub(returnTokens);
      weiAmount = weiAmount.sub(refund);
      msg.sender.transfer(refund);
    }
    // update state
    weiRaised = weiRaised.add(weiAmount);
    token.mint(beneficiary, tokens);
    TokenPurchase(msg.sender, beneficiary, weiAmount, tokens);
    forwardFunds(weiAmount);
  }

  // send ether to the fund collection wallet
  function forwardFunds(uint256 _value) internal {
    wallet.transfer(_value);
  }
}
