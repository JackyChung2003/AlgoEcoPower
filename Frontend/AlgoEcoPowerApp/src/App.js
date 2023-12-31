import './App.css';
import {PeraWalletConnect} from '@perawallet/connect';
import algosdk, { waitForConfirmation } from 'algosdk';
import { useEffect, useState } from 'react';
import Navbar from "./components/Narbar";
import Dashboard from "./components/dashboard";
import Marketplace from "./components/marketplace";
import Community from "./components/community";
import SolarPanel from './components/solarPanel';
import { Routes, Route } from 'react-router-dom';

// Create the PeraWalletConnect instance outside the component
const peraWallet = new PeraWalletConnect();

// The app ID on testnet
const appIndex = 446975699;

// connect to the algorand node
const algod = new algosdk.Algodv2('','https://testnet-api.algonode.cloud', 443);

export default function App() {
  const [accountAddress, setAccountAddress] = useState(null);
  const [currentCount, setCurrentCount] = useState(null);
  const [localCount, setLocalCount] = useState(null);
  const [isOptIn, setIsOptIn] = useState(null);
  const isConnectedToPeraWallet = !!accountAddress;

  useEffect(() => {
    checkCounterState();
    checkLocalCounterState();
    // reconnect to session when the component is mounted
    peraWallet.reconnectSession().then((accounts) => {
      // Setup disconnect event listener
      peraWallet.connector?.on('disconnect', handleDisconnectWalletClick);

      if (accounts.length) {
        setAccountAddress(accounts[0]);
      }
    })

  },[]);
  
  return (
    <div className="App" id='main'>
      <div className="App-header">
        <Navbar isConnectedToPeraWallet={isConnectedToPeraWallet} handleConnectWalletClick={handleConnectWalletClick} handleDisconnectWalletClick={handleDisconnectWalletClick}/>
      </div>

      {isConnectedToPeraWallet ? (
        <Routes>
            <Route path='/' element={<Dashboard accountAddress={accountAddress} optInToApp={optInToApp} isOptIn={isOptIn} className="custom-bg"/>}/>
            <Route path='/Dashboard' element={<Dashboard accountAddress={accountAddress} optInToApp={optInToApp} isOptIn={isOptIn}/>}/>
            <Route path='/Marketplace' element={<Marketplace accountAddress={accountAddress} optInToApp={optInToApp} isOptIn={isOptIn} />}/>
            <Route path='/Community' element={<Community accountAddress={accountAddress} optInToApp={optInToApp} isOptIn={isOptIn}/>}/>
            <Route path='/SolarPanel' element={<SolarPanel accountAddress={accountAddress} optInToApp={optInToApp} isOptIn={isOptIn}/>}/>
          </Routes>
        ) : (
          <Routes>
            <Route path='/' element={<Dashboard accountAddress={accountAddress} optInToApp={optInToApp} isOptIn={isOptIn} className="custom-bg"/>}/>
          </Routes>
        )}
        
    </div>
  );

  function handleConnectWalletClick() {
    peraWallet.connect().then((newAccounts) => {
      // setup the disconnect event listener
      peraWallet.connector?.on('disconnect', handleDisconnectWalletClick);

      setAccountAddress(newAccounts[0]);
    });
  }

    function handleDisconnectWalletClick() {
      peraWallet.disconnect();
      setAccountAddress(null);
    }

    async function optInToApp() {
      const suggestedParams = await algod.getTransactionParams().do();
      const optInTxn = algosdk.makeApplicationOptInTxn(
        accountAddress,
        suggestedParams,
        appIndex
      );

      const optInTxGroup = [{txn: optInTxn, signers: [accountAddress]}];

        const signedTx = await peraWallet.signTransaction([optInTxGroup]);
        console.log(signedTx);
        const { txId } = await algod.sendRawTransaction(signedTx).do();
        const result = await waitForConfirmation(algod, txId, 2);
    }

    async function checkCounterState() {
      try {
        const counter = await algod.getApplicationByID(appIndex).do();
        if (!!counter.params['global-state'][0].value.uint) {
          setCurrentCount(counter.params['global-state'][0].value.uint);
        } else {
          setCurrentCount(0);
        }
      } catch (e) {
        console.error('There was an error connecting to the algorand node: ', e)
      }
    }

    async function checkLocalCounterState() {
      try {
        const accountInfo = await algod.accountApplicationInformation(accountAddress,appIndex).do();
        if (!!accountInfo['app-local-state']['key-value'][0].value.uint) {
          setLocalCount(accountInfo['app-local-state']['key-value'][0].value.uint);
        } else {
          setLocalCount(0);
        }
        console.log(accountInfo['app-local-state']['key-value'][0].value.uint);
      } catch (e) {
        console.error('There was an error connecting to the algorand node: ', e)
      }
    }

    async function callCounterApplication(action) {
      try {
        // get suggested params
        const suggestedParams = await algod.getTransactionParams().do();
        const appArgs = [new Uint8Array(Buffer.from(action))];
        
        const actionTx = algosdk.makeApplicationNoOpTxn(
          accountAddress,
          suggestedParams,
          appIndex,
          appArgs
          );

        const actionTxGroup = [{txn: actionTx, signers: [accountAddress]}];

        const signedTx = await peraWallet.signTransaction([actionTxGroup]);
        console.log(signedTx);
        const { txId } = await algod.sendRawTransaction(signedTx).do();
        const result = await waitForConfirmation(algod, txId, 2);
        checkCounterState();
        checkLocalCounterState();
      
      } catch (e) {
        console.error(`There was an error calling the counter app: ${e}`);
      }
    }
}


