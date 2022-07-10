import React, { useState, useEffect, useCallback } from "react";
import { createweb3Modal } from "../store/web3Modal/createweb3Modal";
import {
  useConnectWallet,
  useDisconnectWallet,
} from "../store/web3Modal/hooks";
import Button from '@mui/material/Button';
import addressParse from "../utils/addressParse";

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
    if (window.confirm("Confirm logout of connected wallet?")) {
      disconnectWallet(web3, web3Modal);
    }
  }, [web3, web3Modal, disconnectWallet]);

  return (
    <Button
      color="inherit"
      onClick={() =>
        connected ? disconnectWalletCallback() : connectWalletCallback()
      }
    >
      {connected ? addressParse(address) : "Connect wallet"}
    </Button>
  );
}
