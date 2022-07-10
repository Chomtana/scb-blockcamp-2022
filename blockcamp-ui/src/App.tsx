import { useCallback, useEffect, useState } from "react";
import logo from "./logo.svg";
import "./App.css";
import ConnectWalletButton from "./components/ConnectWalletButton";
import {
  BankAccountData,
  getAllBankAccounts,
  getBankAccountTokens,
} from "./utils/bank";
import {
  Box,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
} from "@mui/material";
import { Container } from "@mui/system";
import { useSigner } from "./hooks/useSigner";
import { useConnectWallet } from "./store/web3Modal/connectWallet";
import CreateAccountDialog from "./components/CreateAccountDialog";
import addressParse from "./utils/addressParse";
import DepositDialog from "./components/DepositDialog";
import WithdrawDialog from "./components/WithdrawDialog";

function App() {
  const signer = useSigner();
  const { connectWallet, web3, address, networkId, connected } =
    useConnectWallet();

  const [bankAccounts, setBankAccounts] = useState<BankAccountData[]>([]);

  const [showCreateAccountDialog, setShowCreateAccountDialog] = useState(false);
  const [showDepositDialog, setShowDepositDialog] = useState<string | null>(null);
  const [showWithdrawDialog, setShowWithdrawDialog] = useState<string | null>(null);
  const [showTransferDialog, setShowTransferDialog] = useState<string | null>(null);

  const refreshData = useCallback(async () => {
    setBankAccounts(await getAllBankAccounts(address));
  }, [address]);

  useEffect(() => {
    if (address) {
      refreshData();
    }
  }, [address]);

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            10X Bank
          </Typography>
          <ConnectWalletButton></ConnectWalletButton>
        </Toolbar>
      </AppBar>

      <Container
        fixed
        style={{
          paddingTop: 24,
          paddingBottom: 24,
        }}
      >
        {connected && signer && address ? (
          <div>
            <Typography
              variant="h4"
              component="div"
              sx={{ flexGrow: 1 }}
              align="center"
            >
              My Accounts
            </Typography>

            {bankAccounts.map((bankAccount) => (
              <Card
                sx={{ minWidth: 275 }}
                style={{ marginTop: 16 }}
                key={bankAccount.address}
              >
                <CardContent>
                  <Typography variant="h5" gutterBottom>
                    {bankAccount.name}
                  </Typography>

                  <Typography color="text.secondary" variant="body2">
                    {addressParse(bankAccount.address)}
                  </Typography>

                  <Typography marginTop={1}>
                    {bankAccount.tokens.map(token => <div>{token.balance} {token.symbol}</div>)}
                  </Typography>
                </CardContent>

                <CardActions>
                  <Button
                    size="small"
                    onClick={() => setShowDepositDialog(bankAccount.address)}
                  >
                    Deposit
                  </Button>
                  <Button
                    size="small"
                    onClick={() => setShowWithdrawDialog(bankAccount.address)}
                  >
                    Withdraw
                  </Button>
                  <Button
                    size="small"
                    onClick={() => setShowTransferDialog(bankAccount.address)}
                  >
                    Transfer
                  </Button>
                </CardActions>
              </Card>
            ))}

            <div style={{ marginTop: 16 }}>
              <Button
                variant="contained"
                fullWidth
                size="large"
                onClick={() => setShowCreateAccountDialog(true)}
              >
                + Create new account
              </Button>
            </div>
          </div>
        ) : (
          <Typography
            variant="h5"
            component="div"
            sx={{ flexGrow: 1 }}
            align="center"
          >
            Please connect your wallet.
          </Typography>
        )}
      </Container>

      <CreateAccountDialog
        open={showCreateAccountDialog}
        handleClose={() => setShowCreateAccountDialog(false)}
        signer={signer}
        refreshData={refreshData}
      ></CreateAccountDialog>

      <DepositDialog
        open={Boolean(showDepositDialog)}
        handleClose={() => setShowDepositDialog(null)}
        signer={signer}
        refreshData={refreshData}
        bankAddress={showDepositDialog}
      ></DepositDialog>

      <WithdrawDialog
        open={Boolean(showWithdrawDialog)}
        handleClose={() => setShowWithdrawDialog(null)}
        signer={signer}
        refreshData={refreshData}
        bankAddress={showWithdrawDialog}
      ></WithdrawDialog>
    </Box>
  );
}

export default App;
