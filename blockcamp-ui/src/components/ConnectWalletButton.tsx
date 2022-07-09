import React, { useState, useEffect, useCallback } from "react";
import { createweb3Modal } from "../hooks/web3Modal/createweb3Modal";
import {
  useConnectWallet,
  useDisconnectWallet,
} from "../hooks/web3Modal/hooks";

export default function ConnectWalletButton() {
  const { connectWallet, web3, address, networkId, connected } =
    useConnectWallet();
  const { disconnectWallet } = useDisconnectWallet();
  const [web3Modal, setModal] = useState<any>(null);

  useEffect(() => {
    setModal(createweb3Modal);
  }, []);

  useEffect(() => {
    if (web3Modal && (web3Modal.cachedProvider || window.ethereum)) {
      connectWallet(web3Modal);
    }
  }, [web3Modal]);

  const connectWalletCallback = useCallback(() => {
    connectWallet(web3Modal);
  }, [web3Modal, connectWallet]);

  const disconnectWalletCallback = useCallback(() => {
    disconnectWallet(web3, web3Modal);
  }, [web3, web3Modal, disconnectWallet]);

  return (
    <button
      className="btn btn-primary"
      onClick={() =>
        connected ? disconnectWalletCallback() : connectWalletCallback()
      }
    >
      {connected ? address : "Connect wallet"}
    </button>
  );
}
