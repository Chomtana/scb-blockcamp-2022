import { ethers } from "hardhat";

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

async function deploy(contractName: string, ...args: any[]) {
  // Deploy contract
  const Contract = await ethers.getContractFactory(contractName);
  const contract = await Contract.deploy(...args);
  await contract.deployed();
  console.log(contractName + " deployed to:", contract.address);

  await wait(6000);

  return contract;
}

async function main() {
  const contracts: any = {};

  contracts.bankAccount = await deploy("BankAccount");
  contracts.bank = await deploy("Bank", contracts.bankAccount.address);

  return contracts;
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
