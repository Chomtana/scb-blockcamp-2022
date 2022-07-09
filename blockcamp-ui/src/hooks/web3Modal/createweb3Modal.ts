import Web3Modal from "web3modal";
import { providerOptions } from "./getNetworks";

export const createweb3Modal = new Web3Modal({
  network: "rinkeby", // optional or "binance"
  cacheProvider: true, // optional
  providerOptions: providerOptions as any, // required
  disableInjectedProvider: false,
  // theme: {
  //   background: "#380033a8",
  //   main: "#fff",
  //   secondary: "#00c0d4",
  //   border: "#380033a8",
  //   hover: "#ff0a9c78"
  // }
  //providerOptions // required
});
