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
import {
  batchTransfer,
  createBankAccount,
  deposit,
  SUPPORTED_TOKENS,
  withdraw,
} from "../utils/bank";
import TokenSelect from "./TokenSelect";

export default function TransferDialog({
  open,
  handleClose,
  signer,
  bankAddress,
  refreshData,
}) {
  const [name, setName] = useState<string[]>([""]);
  const [amount, setAmount] = useState<string[]>([""]);
  const [tokenAddress, setTokenAddress] = useState<string[]>([
    SUPPORTED_TOKENS[0].address,
  ]);
  const [running, setRunning] = useState(false);

  const handleTransfer = useCallback(async () => {
    try {
      setRunning(true);
      await batchTransfer(
        signer,
        bankAddress,
        tokenAddress,
        name,
        amount.map((x) => parseEther(x))
      );
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
      setName([""]);
      setAmount([""]);
      setTokenAddress([SUPPORTED_TOKENS[0].address]);
    }
  }, [open]);

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Transfer</DialogTitle>
      <DialogContent>
        {/* <DialogContentText>
          Please enter your account name
        </DialogContentText> */}

        {name.map((_, i) => (
          <div key={i}>
            <TextField
              autoFocus
              margin="dense"
              id="name"
              label="Recipient account name"
              type="text"
              fullWidth
              variant="standard"
              value={name[i]}
              disabled={running}
              onChange={(e) => {
                const nameClone = [...name];
                nameClone[i] = e.target.value;
                setName(nameClone);
              }}
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
                  value={amount[i]}
                  disabled={running}
                  onChange={(e) => {
                    const amountClone = [...amount];
                    amountClone[i] = e.target.value;
                    setAmount(amountClone);
                  }}
                />
              </Grid>
              <Grid item xs={5}>
                <TokenSelect
                  disabled={running}
                  onChange={(x) => {
                    const tokenAddressClone = [...tokenAddress];
                    tokenAddressClone[i] = x;
                    setTokenAddress(tokenAddressClone);
                  }}
                ></TokenSelect>
              </Grid>
            </Grid>

            <hr />
          </div>
        ))}

        <div style={{ marginTop: 8, marginBottom: 16 }}>
          <Button
            fullWidth
            variant="contained"
            disabled={running}
            onClick={() => {
              setName([...name, ""]);
              setAmount([...amount, ""]);
              setTokenAddress([...tokenAddress, SUPPORTED_TOKENS[0].address]);
            }}
          >
            + Add recipient
          </Button>
        </div>

        <Typography color={"darkred"}>
          * 1% fee for withdrawing to other address
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={running}>
          Cancel
        </Button>
        <Button onClick={handleTransfer} disabled={running}>
          Transfer
        </Button>
      </DialogActions>
    </Dialog>
  );
}
