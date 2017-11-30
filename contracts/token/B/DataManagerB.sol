pragma solidity ^0.4.11;

import "../DataCentre.sol";
import '../../PausableToken.sol';

contract DataManagerB is PausableToken {

  // satelite contract addresses
  address public dataCentreAddr;

  function DataManagerB() {
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

  // TOKENA TOKEN functions

  function balanceOf(address _owner) constant returns (uint256) {
    return DataCentre(dataCentreAddr).getBalanace('DFB', _owner);
  }

  function _setDFBBalanceOf(address _owner, uint256 _newValue) internal {
    DataCentre(dataCentreAddr).setBalanace('DFB', _owner, _newValue);
  }

  // total supply
  function totalSupply() constant returns (uint256) {
    return DataCentre(dataCentreAddr).getValue('DFB', 'totalSupply');
  }

  function _setTotalSupplyDFB(uint256 _newTotalSupply) internal {
    DataCentre(dataCentreAddr).setValue('DFB', 'totalSupply', _newTotalSupply);
  }

  // total supply
  function allowance(address _owner, address _spender) constant returns (uint256) {
    return DataCentre(dataCentreAddr).getConstraint('DFB', _owner, _spender);
  }

  function _setAllowance(address _owner, address _spender, uint256 _newValue) internal {
    require(balanceOf(_owner) >= _newValue);
    DataCentre(dataCentreAddr).setConstraint('DFB', _owner, _spender, _newValue);
  }

}
