//SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.13;

interface IBank {
  function getFee(uint256 amount) external view returns(uint256);
  function platformFeeAddress() external view returns(address);
  function getBankAccountAddress(string memory name) external view returns(address);
  function getBankAccountAddressWithRequire(string memory name) external view returns(address);
  function getOwnedBy(address bankAccount) external view returns(address);
}