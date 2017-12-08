pragma solidity ^0.4.11;


import './DFSTokenBControl.sol';


/**
 * @title Standard ERC20 token
 *
 * @dev Implementation of the basic standard token.
 * @dev https://github.com/ethereum/EIPs/issues/20
 * @dev Based on code by FirstBlood: https://github.com/Firstbloodio/token/blob/master/smart_contract/FirstBloodToken.sol
 */
contract DFSTokenB is DFSTokenBControl {

  string public constant name = "DFS Token A";
  string public constant symbol = "DFA";
  uint8 public constant decimals = 18;
  uint256 public constant INITIAL_SUPPLY = 30000000 * (10 ** uint256(decimals));

  /**
   * @dev Constructor that gives msg.sender all of existing tokens.
   */
  function DFSTokenB(address _dataCentreAddr)
    DFSTokenBControl(_dataCentreAddr)
  {
    if (_dataCentreAddr == address(0)) {
      // initial token distribution to be put in here
      _setTotalSupplyDFB(INITIAL_SUPPLY);
      _setDFBBalanceOf(msg.sender, INITIAL_SUPPLY);
    }
  }
}
