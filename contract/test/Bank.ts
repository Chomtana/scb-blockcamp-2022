import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { JsonRpcProvider } from "@ethersproject/providers";
import { parseEther } from "@ethersproject/units";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { randomBytes as nodeRandomBytes } from "crypto";
import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract } from "ethers";

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000"
const TEN_THOUSAND_ETH = parseEther("10000").toHexString().replace("0x0", "0x");

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

async function deploy(contractName: string, ...args: any[]): Promise<Contract> {
  // Deploy contract
  const Contract = await ethers.getContractFactory(contractName);
  const contract = await Contract.deploy(...args);
  await contract.deployed();
  console.log(contractName + " deployed to:", contract.address);

  return contract;
}

async function attach(contractName: string, address: string) {
  // Deploy contract
  const Contract = await ethers.getContractFactory(contractName);
  const contract = await Contract.attach(address);

  return contract;
}

const faucet = async (address: string, provider: JsonRpcProvider) => {
  await provider.send("hardhat_setBalance", [address, TEN_THOUSAND_ETH]);
};

const provider = ethers.provider;

const randomBytes = (n: number) => nodeRandomBytes(n).toString("hex");
const randomHex = (bytes = 32) => `0x${randomBytes(bytes)}`;

describe("Bank", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshopt in every test.
  async function deployFixture() {
    const contracts: any = {};

    contracts.bankAccount = await deploy("BankAccount");
    contracts.bank = await deploy("Bank", contracts.bankAccount.address);
    contracts.erc20 = await deploy("TestERC20");
  
    return contracts;
  }

  let deployer, owner1, owner2, someone;
  let bank, erc20;
  let bank1A, bank1B, bank2A, bank2B;

  before(async () => {
    const accounts = await ethers.getSigners();

    owner1 = new ethers.Wallet(randomHex(32), provider);
    owner2 = new ethers.Wallet(randomHex(32), provider);
    someone = new ethers.Wallet(randomHex(32), provider);
    deployer = accounts[0];

    await Promise.all(
      [owner1, owner2, someone].map((wallet) => faucet(wallet.address, provider))
    );

    let contracts = await deployFixture();

    bank = contracts.bank;
    erc20 = contracts.erc20;
  });

  it("Should be able to create bank account", async function () {
    await bank.connect(owner1).createBankAccount("Bank 1A").then(tx => tx.wait());
    expect(bank.connect(owner1).createBankAccount("Bank 1A")).to.be.revertedWith("Name has already used");
    await bank.connect(owner1).createBankAccount("Bank 1B").then(tx => tx.wait());

    expect(bank.connect(owner2).createBankAccount("Bank 1B")).to.be.revertedWith("Name has already used");
    await bank.connect(owner2).createBankAccount("Bank 2A").then(tx => tx.wait());
    await bank.connect(owner2).createBankAccount("Bank 2B").then(tx => tx.wait());

    bank1A = await attach("BankAccount", await bank.getBankAccountAddress("Bank 1A"));
    bank1B = await attach("BankAccount", await bank.getBankAccountAddress("Bank 1B"));
    bank2A = await attach("BankAccount", await bank.getBankAccountAddress("Bank 2A"));
    bank2B = await attach("BankAccount", await bank.getBankAccountAddress("Bank 2B"));

    console.log("Bank 1A:", bank1A.address);
    console.log("Bank 1B:", bank1B.address);
    console.log("Bank 2A:", bank2A.address);
    console.log("Bank 2B:", bank2B.address);

    expect(bank1A.address).to.not.equal(ZERO_ADDRESS);
    expect(bank1B.address).to.not.equal(ZERO_ADDRESS);
    expect(bank2A.address).to.not.equal(ZERO_ADDRESS);
    expect(bank2B.address).to.not.equal(ZERO_ADDRESS);

    expect(bank.getBankAccountAddressWithRequire("Bank 3A")).to.be.revertedWith("Bank not exists");
  });

  it("Should set the right owner in Bank", async function () {
    expect(await bank.getOwnedBy(bank1A.address)).to.equal(owner1.address);
    expect(await bank.getOwnedBy(bank1B.address)).to.equal(owner1.address);
    expect(await bank.getOwnedBy(bank2A.address)).to.equal(owner2.address);
    expect(await bank.getOwnedBy(bank2B.address)).to.equal(owner2.address);
  });

  it("Should set the right owner", async function () {
    expect(await bank1A.owner()).to.equal(owner1.address);
    expect(await bank1B.owner()).to.equal(owner1.address);
    expect(await bank2A.owner()).to.equal(owner2.address);
    expect(await bank2B.owner()).to.equal(owner2.address);
  });

  it("Should receive and store the funds to bank account", async function () {
    await erc20.mint(owner1.address, TEN_THOUSAND_ETH);
    
    await erc20.connect(owner1).transfer(bank1A.address, parseEther("100"));

    expect(await erc20.balanceOf(bank1A.address)).to.equal(parseEther("100"));
  });

  it("Should transfer fund to my account without any fee", async function () {    
    expect(bank1A.connect(owner2).transferUsingName(erc20.address, "Bank 1B", parseEther("100"))).to.be.revertedWith("Not owner");
    await bank1A.connect(owner1).transferUsingName(erc20.address, "Bank 1B", parseEther("100"));

    expect(await erc20.balanceOf(bank1A.address)).to.equal(parseEther("0"));
    expect(await erc20.balanceOf(bank1B.address)).to.equal(parseEther("100"));

    // Over transfer
    expect(bank1B.connect(owner1).transferUsingName(erc20.address, "Bank 1A", parseEther("1000"))).to.be.reverted;

    // Bank not exists
    expect(bank1B.connect(owner1).transferUsingName(erc20.address, "Bank 1C", parseEther("1"))).to.be.revertedWith("Bank not exists");
  });

  it("Should transfer fund to other account with fee", async function () {
    const erc20Address = [erc20.address, erc20.address, erc20.address]
    const to = ["Bank 1A", "Bank 2A", "Bank 2B"];
    const amount = [parseEther("40"), parseEther("20"), parseEther("10")]

    expect(bank1B.connect(owner2).batchTransfer(erc20Address, to, amount)).to.be.revertedWith("Not owner");
    await bank1B.connect(owner1).batchTransfer(erc20Address, to, amount);

    expect(await erc20.balanceOf(bank1A.address)).to.equal(parseEther("40"));
    expect(await erc20.balanceOf(bank1B.address)).to.equal(parseEther("30"));
    expect(await erc20.balanceOf(bank2A.address)).to.equal(parseEther("19.8"));
    expect(await erc20.balanceOf(bank2B.address)).to.equal(parseEther("9.9"));
    expect(await erc20.balanceOf(deployer.address)).to.equal(parseEther("0.3"));
  });

  it("Should be able to withdraw to self without any fee", async function () {
    await bank1A.connect(owner1).transfer(erc20.address, owner1.address, parseEther("10"));
    
    expect(await erc20.balanceOf(bank1A.address)).to.equal(parseEther("30"));
    expect(await erc20.balanceOf(owner1.address)).to.equal(parseEther("9910"));
  });

  it("Should be able to withdraw to other with fee", async function () {
    await bank1A.connect(owner1).transfer(erc20.address, owner2.address, parseEther("10"));
    
    expect(await erc20.balanceOf(bank1A.address)).to.equal(parseEther("20"));
    expect(await erc20.balanceOf(owner2.address)).to.equal(parseEther("9.9"));
    expect(await erc20.balanceOf(deployer.address)).to.equal(parseEther("0.4"));
  });

});
