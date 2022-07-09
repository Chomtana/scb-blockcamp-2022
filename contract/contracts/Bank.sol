//SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.13;

import "@openzeppelin/contracts/proxy/Clones.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./IBank.sol";
import "./BankAccount.sol";

contract Bank is Ownable, IBank {
  address public immutable bankAccountTemplate;
  mapping(address => string[]) public bankAccounts;
  mapping(bytes32 => address) public bankAccountAddress;
  mapping(address => address) public bankAccountOwner;

  uint256 public platformFee = 0.01 ether;
  address public platformFeeAddress;

  constructor(address _bankAccountTemplate) {
    bankAccountTemplate = _bankAccountTemplate;
    platformFeeAddress = msg.sender;
  }

  function getFee(uint256 amount) external view returns(uint256) {
    return amount * platformFee / 1e18;
  }

  event SetFee(uint256 newFee);
  function setFee(uint256 newFee) external onlyOwner {
    require(newFee <= 0.3 ether, "Fee too high");
    platformFee = newFee;
    emit SetFee(newFee);
  }

  event SetFeeAddress(address newAddress);
  function setFeeAddress(address newAddress) external onlyOwner {
    require(newAddress != address(0), "zero address");
    platformFeeAddress = newAddress;
    emit SetFeeAddress(newAddress);
  }

  function getBankAccountAddress(string memory name) public view returns(address) {
    return bankAccountAddress[keccak256(abi.encodePacked(name))];
  }

  function getBankAccountAddressWithRequire(string memory name) public view returns(address bankAccount) {
    bankAccount = getBankAccountAddress(name);
    require(bankAccount != address(0), "Bank not exists");
  }

  function getBankAccountCount(address owner) public view returns(uint256) {
    return bankAccounts[owner].length;
  }

  function getAllBankAccountAddresses(address owner) public view returns(address[] memory) {
    uint256 bankAccountsLength = bankAccounts[owner].length;
    address[] memory result = new address[](bankAccountsLength);

    unchecked {
      for (uint256 i = 0; i < bankAccountsLength; i++) {
        result[i] = getBankAccountAddress(bankAccounts[owner][i]);
      }
    }

    return result;
  }

  function getOwnedBy(address bankAccount) public view returns(address) {
    return bankAccountOwner[bankAccount];
  }

  event CreateBankAccount(address indexed owner, address indexed bankAccount, string name);
  function createBankAccount(string memory name) external returns(address bankAccount) {
    bytes32 nameHash = keccak256(abi.encodePacked(name));

    require(bankAccountAddress[nameHash] == address(0), "Name has already used");

    bankAccount = Clones.clone(bankAccountTemplate);
    BankAccount(bankAccount).initialize(msg.sender, address(this));

    bankAccountAddress[nameHash] = bankAccount;
    bankAccounts[msg.sender].push(name);
    bankAccountOwner[bankAccount] = msg.sender;

    emit CreateBankAccount(msg.sender, bankAccount, name);
  }
}