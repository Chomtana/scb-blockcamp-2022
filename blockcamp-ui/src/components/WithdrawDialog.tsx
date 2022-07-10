import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  TextField,
  Typography,
} from "@mui/material";
import { parseEther } from "ethers/lib/utils";
import React, { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { createBankAccount, deposit, withdraw } from "../utils/bank";
import TokenSelect from "./TokenSelect";

export default function WithdrawDialog({
  open,
  handleClose,
  signer,
  bankAddress,
  refreshData,
}) {
  const [address, setAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [tokenAddress, setTokenAddress] = useState("");
  const [running, setRunning] = useState(false);

  const handleWithdraw = useCallback(async () => {
    try {
      setRunning(true);
      await withdraw(signer, bankAddress, tokenAddress, address, parseEther(amount));
    } catch (err: any) {
      console.error(err);
      toast.error(err.error?.message || err.message);
    } finally {
      refreshData();
      handleClose();
      setRunning(false);
    }
  }, [signer, amount, bankAddress, tokenAddress]);

  useEffect(() => {
    if (signer) {
      signer.getAddress().then(address => setAddress(address))
    };
  }, [signer]);

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Withdraw</DialogTitle>
      <DialogContent>
        {/* <DialogContentText>
          Please enter your account name
        </DialogContentText> */}

        <TextField
          autoFocus
          margin="dense"
          id="name"
          label="Recipient wallet address"
          type="text"
          fullWidth
          variant="standard"
          value={address}
          disabled={running}
          onChange={(e) => setAddress(e.target.value)}
        />

        <Grid container rowSpacing={1} columnSpacing={1}>
          <Grid item xs={7}>
            <TextField
              autoFocus
              margin="dense"
              id="name"
              label="Amount"
              type="text"
              fullWidth
              variant="standard"
              value={amount}
              disabled={running}
              onChange={(e) => setAmount(e.target.value)}
            />
          </Grid>
          <Grid item xs={5}>
            <TokenSelect
              disabled={running}
              onChange={(x) => setTokenAddress(x)}
            ></TokenSelect>
          </Grid>
        </Grid>

        <Typography color={"darkred"}>
          * 1% fee for withdrawing to other address
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={running}>
          Cancel
        </Button>
        <Button onClick={handleWithdraw} disabled={running}>
          Withdraw
        </Button>
      </DialogActions>
    </Dialog>
  );
}
