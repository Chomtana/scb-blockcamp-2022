import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField } from "@mui/material";
import React, { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { createBankAccount } from "../utils/bank";

export default function CreateAccountDialog({ open, handleClose, signer, refreshData }) {
  const [name, setName] = useState("");
  const [running, setRunning] = useState(false);

  const handleCreate = useCallback(async () => {
    try {
      setRunning(true);
      await createBankAccount(signer, name);
    } catch (err: any) {
      console.error(err);
      toast.error(err.error?.message || err.message);
    } finally {
      refreshData();
      handleClose();
      setRunning(false);
    }
  }, [signer, name]);

  useEffect(() => {
    if (!open) {
      setName("")
    }
  }, [open])

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Create new account</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Please enter your account name
        </DialogContentText>
        <TextField
          autoFocus
          margin="dense"
          id="name"
          label="Account Name"
          type="text"
          fullWidth
          variant="standard"
          value={name}
          disabled={running}
          onChange={e => setName(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={running}>Cancel</Button>
        <Button onClick={handleCreate} disabled={running}>Create</Button>
      </DialogActions>
    </Dialog>
  )

}