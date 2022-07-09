//SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.13;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "./IBank.sol";

// Cannot transferOwnership or state in IBank will break
contract BankAccount is Initializable {
  using SafeERC20 for IERC20;

  address public owner;
  IBank public bank;

  function initialize(address _owner, address _bank) external initializer {
    bank = IBank(_bank);
    owner = _owner;
  }

  modifier onlyOwner {
    require(msg.sender == owner, "Not owner");
    _;
  }

  event Withdraw(address indexed withdrawer, address indexed token, address indexed to, uint256 fee, uint256 subtotal);
  function transfer(IERC20 token, address to, uint256 amount) public onlyOwner {
    uint256 fee = to == owner || bank.getOwnedBy(to) == owner ? 0 : bank.getFee(amount);
    require(fee <= amount, "Fee must not exceed amount");
    
    unchecked {
      if (fee > 0) {
        token.safeTransfer(bank.platformFeeAddress(), fee);
      }

      uint256 subtotal = amount - fee;
      token.safeTransfer(to, amount - fee);
      
      emit Withdraw(msg.sender, address(token), to, fee, subtotal);
    }
  }

  function transferUsingName(IERC20 token, string calldata to, uint256 amount) public onlyOwner {
    transfer(token, bank.getBankAccountAddressWithRequire(to), amount);
  }

  function batchTransfer(IERC20 token, string[] calldata to, uint256[] calldata amount) public onlyOwner {
    uint256 transferCount = to.length;

    require(transferCount == amount.length, "Length mismatch");

    unchecked {
      for (uint256 i = 0; i < transferCount; i++) {
        transfer(token, bank.getBankAccountAddressWithRequire(to[i]), amount[i]);
      }
    }
  }
}