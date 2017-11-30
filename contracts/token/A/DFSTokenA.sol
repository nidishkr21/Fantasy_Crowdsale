pragma solidity ^0.4.11;


import './DFSTokenAControl.sol';


/**
 * @title Standard ERC20 token
 *
 * @dev Implementation of the basic standard token.
 * @dev https://github.com/ethereum/EIPs/issues/20
 * @dev Based on code by FirstBlood: https://github.com/Firstbloodio/token/blob/master/smart_contract/FirstBloodToken.sol
 */
contract DFSTokenA is DFSTokenAControl {

  string public constant name = "DFS Token A";
  string public constant symbol = "DFA";
  uint8 public constant decimals = 18;
  uint256 public constant INITIAL_SUPPLY = 140000000 * (10 ** uint256(decimals));
  bool internal initalSupplySet = false;

  /**
   * @dev Constructor that gives msg.sender all of existing tokens.
   */
  function DFSTokenA()
    DFSTokenAControl()
  {
    // initial token distribution to be put in here
    require(initalSupplySet == false);
    _setTotalSupplyDFA(INITIAL_SUPPLY);
    _setDFABalanceOf(msg.sender, INITIAL_SUPPLY);
    initalSupplySet = true;
  }
}
