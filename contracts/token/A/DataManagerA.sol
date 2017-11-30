pragma solidity ^0.4.11;

import "../DataCentre.sol";
import '../../PausableToken.sol';

contract DataManagerA is PausableToken {

  // satelite contract addresses
  address public dataCentreAddr;

  function DataManagerA() {
    dataCentreAddr = address(createDataCentre());
  }

  function setDataCentreAddress(address _dataCentreAddr) public onlyOwner whenPaused {
    dataCentreAddr = _dataCentreAddr;
  }

  function transferDataCentreOwnership(address _nextOwner) public onlyOwner whenPaused {
    DataCentre(dataCentreAddr).transferOwnership(_nextOwner);
  }

  // internal functions
  function createDataCentre() internal returns (DataCentre) {
    return new DataCentre();
  }

  // TOKENB TOKEN functions

  function balanceOf(address _owner) constant returns (uint256) {
    return DataCentre(dataCentreAddr).getBalanace('DFA', _owner);
  }

  function _setDFABalanceOf(address _owner, uint256 _newValue) internal {
    DataCentre(dataCentreAddr).setBalanace('DFA', _owner, _newValue);
  }

  // total supply
  function totalSupply() constant returns (uint256) {
    return DataCentre(dataCentreAddr).getValue('DFA', 'totalSupply');
  }

  function _setTotalSupplyDFA(uint256 _newTotalSupply) internal {
    DataCentre(dataCentreAddr).setValue('DFA', 'totalSupply', _newTotalSupply);
  }

  // total supply
  function allowance(address _owner, address _spender) constant returns (uint256) {
    return DataCentre(dataCentreAddr).getConstraint('DFA', _owner, _spender);
  }

  function _setAllowance(address _owner, address _spender, uint256 _newValue) internal {
    require(balanceOf(_owner) >= _newValue);
    DataCentre(dataCentreAddr).setConstraint('DFA', _owner, _spender, _newValue);
  }

}
