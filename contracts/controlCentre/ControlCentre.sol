pragma solidity ^0.4.11;

import "./ControlCentreInterface.sol";
import "../ownership/Ownable.sol";


contract ControlCentre is Ownable {

  function pauseCrowdsale(address _crowdsaleAddress) public onlyOwner returns (bool) {
    address tokenAddr = ControlCentreInterface(_crowdsaleAddress).tokenAddr();
    ControlCentreInterface(_crowdsaleAddress).pause();
    ControlCentreInterface(_crowdsaleAddress).transferTokenOwnership(address(this));
    ControlCentreInterface(tokenAddr).pause();
    ControlCentreInterface(tokenAddr).transferOwnership(_crowdsaleAddress);
    ControlCentreInterface(_crowdsaleAddress).removeAdmin(address(this));
    return true;
  }

  function unpauseCrowdsale(address _crowdsaleAddress) public onlyOwner returns (bool) {
    address tokenAddr = ControlCentreInterface(_crowdsaleAddress).tokenAddr();
    ControlCentreInterface(_crowdsaleAddress).transferTokenOwnership(address(this));
    ControlCentreInterface(tokenAddr).unpause();
    ControlCentreInterface(tokenAddr).transferOwnership(_crowdsaleAddress);
    ControlCentreInterface(_crowdsaleAddress).unpause();
    ControlCentreInterface(_crowdsaleAddress).removeAdmin(address(this));
    return true;
  }

  function transferDataCentreOwnership(address _crowdsaleAddress, address _nextOwner) public onlyOwner returns (bool) {
    address tokenAddr = ControlCentreInterface(_crowdsaleAddress).tokenAddr();
    ControlCentreInterface(_crowdsaleAddress).pause();
    ControlCentreInterface(_crowdsaleAddress).transferTokenOwnership(address(this));
    ControlCentreInterface(tokenAddr).pause();
    ControlCentreInterface(tokenAddr).transferDataCentreOwnership(_nextOwner);
    ControlCentreInterface(tokenAddr).transferOwnership(_crowdsaleAddress);
    ControlCentreInterface(_crowdsaleAddress).removeAdmin(address(this));
    return true;
  }

  function returnDataCentreOwnership(address _crowdsaleAddress) public onlyOwner returns (bool) {
    address tokenAddr = ControlCentreInterface(_crowdsaleAddress).tokenAddr();
    address dataCentreAddr = ControlCentreInterface(tokenAddr).dataCentreAddr();
    ControlCentreInterface(dataCentreAddr).transferOwnership(tokenAddr);
    ControlCentreInterface(_crowdsaleAddress).transferTokenOwnership(address(this));
    ControlCentreInterface(tokenAddr).unpause();
    ControlCentreInterface(tokenAddr).transferOwnership(_crowdsaleAddress);
    ControlCentreInterface(_crowdsaleAddress).unpause();
    ControlCentreInterface(_crowdsaleAddress).removeAdmin(address(this));
    return true;
  }
}
