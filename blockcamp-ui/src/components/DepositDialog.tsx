import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  TextField,
} from "@mui/material";
import { parseEther } from "ethers/lib/utils";
import React, { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { createBankAccount, deposit, SUPPORTED_TOKENS } from "../utils/bank";
import TokenSelect from "./TokenSelect";

export default function DepositDialog({
  open,
  handleClose,
  signer,
  bankAddress,
  refreshData,
}) {
  // const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [tokenAddress, setTokenAddress] = useState(SUPPORTED_TOKENS[0].address);
  const [running, setRunning] = useState(false);

  const handleDeposit = useCallback(async () => {
    try {
      setRunning(true);
      await deposit(signer, tokenAddress, bankAddress, parseEther(amount));
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
    if (!open) {
      setAmount("")
      setTokenAddress(SUPPORTED_TOKENS[0].address)
    }
  }, [open])

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Deposit</DialogTitle>
      <DialogContent>
        {/* <DialogContentText>
          Please enter your account name
        </DialogContentText> */}

        {/* <TextField
          autoFocus
          margin="dense"
          id="name"
          label="Account Name"
          type="text"
          fullWidth
          variant="standard"
          value={name}
          disabled={running}
          onChange={(e) => setName(e.target.value)}
        /> */}

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
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={running}>
          Cancel
        </Button>
        <Button onClick={handleDeposit} disabled={running}>
          Deposit
        </Button>
      </DialogActions>
    </Dialog>
  );
}
