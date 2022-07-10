import { ethers } from "ethers";
import { useEffect, useState } from "react";
import { useConnectWallet } from "../store/web3Modal/connectWallet";
import { createweb3Modal } from "../store/web3Modal/createweb3Modal";

export function useSigner() {
  const { connectWallet, web3, address, networkId, connected } =
    useConnectWallet();
  const [web3Modal, setModal] = useState<any>(null);
  const [signer, setSigner] = useState<any>(null);

  useEffect(() => {
    setModal(createweb3Modal);
  }, []);

  useEffect(() => {
    if (web3Modal && web3Modal.cachedProvider) {
      web3Modal.connect().then(instance => {
        const provider = new ethers.providers.Web3Provider(instance);
        const signer = provider.getSigner();
        setSigner(signer)
      });
    } else {
      setSigner(null);
    }
  }, [web3Modal, web3Modal?.cachedProvider, address]);

  return signer;
}