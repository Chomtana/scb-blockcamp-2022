import { FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import React, { useEffect, useState } from "react";
import useId from "../hooks/useId";
import { SUPPORTED_TOKENS } from "../utils/bank";

// Uncontrolled value only
export default function TokenSelect({ onChange, disabled = false }) {
  const labelId = useId();
  const [value, setValue] = useState(SUPPORTED_TOKENS[0].address);

  useEffect(() => {
    onChange(value);
  }, [value]);

  return (
    <FormControl variant="standard" sx={{ m: 1, minWidth: 120 }}>
      <InputLabel id={labelId}>Token</InputLabel>
      <Select
        labelId={labelId}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        disabled={disabled}
        label="Token"
      >
        {SUPPORTED_TOKENS.map((token) => (
          <MenuItem value={token.address} key={token.address}>{token.symbol}</MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
