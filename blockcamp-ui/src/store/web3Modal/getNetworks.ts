import { connectors } from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";

export const providerOptions = {
  /* See Provider Options Section */
  walletconnect: {
    package: WalletConnectProvider,
    options: {
      infuraId: "8d49be66bd44413d8205327c236b48d5",
    }
  },
};
