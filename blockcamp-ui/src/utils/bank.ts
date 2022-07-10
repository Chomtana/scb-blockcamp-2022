import { BigNumber, ethers } from "ethers";
import {
  Multicall,
  ContractCallResults,
  ContractCallContext,
} from 'ethereum-multicall';

import BankABI from "../abi/Bank.json"
import BankAccountABI from "../abi/BankAccount.json"
import ERC20ABI from "../abi/ERC20.json"
import { getBalancesForEthereumAddress, getBalancesForEthereumAddresses, Token } from "ethereum-erc20-token-balances-multicall";

export const BANK_ADDRESS = "0x79A3840E610590A78d94EC428E9d1AFbDC225F8e";

export const SUPPORTED_TOKENS = [
  {
    symbol: "WETH",
    address: "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6",
  },
  {
    symbol: "UNI",
    address: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
  }
]

export const DEFAULT_CHAIN_NAME = "goerli";
export const DEFAULT_CHAIN_ID = 5;

let providerReadOnly = new ethers.providers.InfuraProvider(DEFAULT_CHAIN_NAME, "8d49be66bd44413d8205327c236b48d5");

const multicall = new Multicall({ ethersProvider: providerReadOnly, tryAggregate: true });

export interface BankAccountData {
  name: string;
  address: string;
  tokens: Token[];
}

export async function getBankAccountTokens(address: string) {
  const balances = await getBalancesForEthereumAddress({
    // erc20 tokens you want to query!
    contractAddresses: SUPPORTED_TOKENS.map(x => x.address),
    // ethereum address of the user you want to get the balances for
    ethereumAddress: address,
    // your ethers provider
    providerOptions: {
      ethersProvider: providerReadOnly,
    },
  });

  return balances.tokens;
}

export async function getMultipleBankAccountTokens(addresses: string[]) {
  const balances = await getBalancesForEthereumAddresses({
    // erc20 tokens you want to query!
    contractAddresses: SUPPORTED_TOKENS.map(x => x.address),
    // ethereum address of the user you want to get the balances for
    ethereumAddresses: addresses,
    // your ethers provider
    providerOptions: {
      ethersProvider: providerReadOnly,
    },
  });

  return balances;
}

export async function getAllBankAccounts(walletAddress: any) {
  const bank = new ethers.Contract(BANK_ADDRESS, BankABI, providerReadOnly);

  const names = await bank.getBankAccountNames(walletAddress);
  const addresses = await bank.getAllBankAccountAddresses(walletAddress);

  const balances = await getMultipleBankAccountTokens(addresses);

  const result: BankAccountData[] = [];

  for (let i = 0; i < names.length; i++) {
    result.push({
      name: names[i],
      address: addresses[i],
      tokens: balances[i].tokens,
    })
  }

  return result;
}

export async function createBankAccount(signer: any, name: string) {
  const bank = new ethers.Contract(BANK_ADDRESS, BankABI, signer);
  return await bank.createBankAccount(name).then(tx => tx.wait());
}

export async function deposit(signer: any, tokenAddress: string, address: string, amount: string | BigNumber) {
  const token = new ethers.Contract(tokenAddress, ERC20ABI, signer);
  return await token.transfer(address, amount).then(tx => tx.wait());
}

export async function withdraw(signer: any, bankAccountAddress: string, tokenAddress: string, walletAddress: string, amount: string | BigNumber) {
  const bankAccount = new ethers.Contract(bankAccountAddress, BankAccountABI, signer);
  return await bankAccount.transfer(tokenAddress, walletAddress, amount).then(tx => tx.wait());
}

export async function batchTransfer(signer: any, bankAccountAddress: string, tokenAddresses: string[], to: string[], amount: (string | BigNumber)[]) {
  const bankAccount = new ethers.Contract(bankAccountAddress, BankAccountABI, signer);
  return await bankAccount.batchTransfer(tokenAddresses, to, amount).then(tx => tx.wait());
}