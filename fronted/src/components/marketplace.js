import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';
import { useEffect, useState } from 'react';
import algosdk, { waitForConfirmation } from 'algosdk';
import "./dashboardStyle.css"
import Row from 'react-bootstrap/esm/Row';
import Col from 'react-bootstrap/Col';
import {PeraWalletConnect} from '@perawallet/connect';
import setAccountAddress from './Navbar';

const peraWallet = new PeraWalletConnect();
const appIndex = 405619740;
const algod = new algosdk.Algodv2('', 'https://testnet-api.algonode.cloud', 443);

export default function Dashboard({ accountAddress, optInToApp, isOptIn }) {
  const [userCurrencyTokenCount, setUserCurrencyTokenCount] = useState(null);
  const [userEnergyTokenCount, setUserEnergyTokenCount] = useState(null);
  const [userEnergyUploadCount, setUserEnergyUploadCount] = useState(null);
  const [userEnergyPurchaseCount, setUserEnergyPurchaseCount] = useState(null);

  useEffect(() => {
    checkUserCurrencyTokenCount();
    checkUserEnergyTokenCount();
    checkUserEnergyUploadCount();
    checkUserEnergyPurchaseCount();

    // Reconnect to session when the component is mounted
    peraWallet.reconnectSession().then((accounts) => {
      // Setup disconnect event listener
      peraWallet.connector?.on('disconnect', handleDisconnectWalletClick);

      if (accounts.length) {
        // Set the user's Algorand address here
        // setAccountAddress(accounts[0]);
      }
    });
  }, []);

  function handleDisconnectWalletClick() {
    peraWallet.disconnect();
    // Clear the user's Algorand address here
    // setAccountAddress(null);
  }

  async function checkUserCurrencyTokenCount() {
    try {
      const accountInfo = await algod.accountApplicationInformation(accountAddress, appIndex).do();
      if (accountInfo['app-local-state']) {
        const currencyTokenCount = accountInfo['app-local-state']['key-value'][0].value.uint;
        setUserCurrencyTokenCount(currencyTokenCount);
      } else {
        setUserCurrencyTokenCount(0);
      }
    } catch (e) {
      console.error('There was an error connecting to the Algorand node: ', e);
    }
  }

  async function checkUserEnergyTokenCount() {
    try {
      const accountInfo = await algod.accountApplicationInformation(accountAddress, appIndex).do();
      if (accountInfo['app-local-state']) {
        const energyTokenCount = accountInfo['app-local-state']['key-value'][1].value.uint;
        setUserEnergyTokenCount(energyTokenCount);
      } else {
        setUserEnergyTokenCount(0);
      }
    } catch (e) {
      console.error('There was an error connecting to the Algorand node: ', e);
    }
  }

  async function checkUserEnergyUploadCount() {
    try {
      const counter = await algod.getApplicationByID(appIndex).do();
      if (!!counter.params['global-state'][1].value.uint) {
        setUserEnergyUploadCount(counter.params['global-state'][1].value.uint);
      } else {
        setUserEnergyUploadCount(0);
      }
    } catch (e) {
      console.error('There was an error connecting to the algorand node: ', e)
    }
  }

  async function checkUserEnergyPurchaseCount() {
    try {
      const counter = await algod.getApplicationByID(appIndex).do();
      if (!!counter.params['global-state'][0].value.uint) {
        setUserEnergyPurchaseCount(counter.params['global-state'][0].value.uint);
      } else {
        setUserEnergyPurchaseCount(0);
      }
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
      
    checkUserCurrencyTokenCount();
    checkUserEnergyTokenCount();
    checkUserEnergyUploadCount();
    checkUserEnergyPurchaseCount();
    } catch (e) {
      console.error(`There was an error calling the counter app: ${e}`);
    }
  }

  return (
    <div id='dashboard'>

      {/* Opt in to App notification */}
      {isOptIn ? (
        <div id='page_success'>Opt in successful, thank you for opting in.</div>
      ) : (
        <div id='page_ready'>
          <h1 className='inline text-xl mr-4'>Opt-in to get more information.</h1>
          <button id='optin_button' onClick={() => optInToApp()}>
            Opt-in
          </button>
        </div>
      )}

      <div>
        <Row>
          <Col id='coin-section'>
            <div className='d-flex align-items-center'>
              <img id='coin' src='https://github.com/jc2003-2003/AlgoEcoPower/blob/main/images/coin3.jpg?raw=true' alt='Energy_upload' />
              <h1 id='coin-name'>Token: {userCurrencyTokenCount}</h1>
            </div>
          </Col>
          <Col id='coin-section'>
            <div className='d-flex align-items-center'>
              <img id='coin' src='https://github.com/jc2003-2003/AlgoEcoPower/blob/main/images/coin3.jpg?raw=true' alt='Energy_upload' />
              <h1 id='coin-name'>Electric_token: {userEnergyTokenCount}</h1>
            </div>
          </Col>
          <Col id='coin-section'>
            <div className='d-flex align-items-center'>
              <img id='coin' src='https://github.com/jc2003-2003/AlgoEcoPower/blob/main/images/coin3.jpg?raw=true' alt='Energy_upload' />
              <h1 id='coin-name'>Energy_upload: {userEnergyUploadCount}</h1>
            </div>
          </Col>
          <Col id='coin-section'>
            <div className='d-flex align-items-center'>
              <img id='coin' src='https://github.com/jc2003-2003/AlgoEcoPower/blob/main/images/coin3.jpg?raw=true' alt='Energy_upload' />
              <h1 id='coin-name'>Energy_available: {userEnergyPurchaseCount}</h1>
            </div>
          </Col>
        </Row>
      </div>
        
      
    <Container>
        <Row>
          <Col><Button className="btn-add-local"
     onClick={
        () => callCounterApplication('Add_Local')
      }>
      Increase Token & Electric_token
    </Button></Col>
          <Col><Button className="btn-dec-local" 
     onClick={() => callCounterApplication('Add_Global')}>
      Sell Electric_token 
    </Button></Col>
        </Row>
        <Row>
          <h1>Developer Mode</h1>
        </Row>
        <Row>
        <Col><Button className="btn-dec-global" 
     onClick={() => callCounterApplication('Deduct_Local')}>
      Decrease Token & Electric_token
    </Button></Col>
          <Col><Button className="btn-add-global"
     onClick={
        () => callCounterApplication('Deduct_Global')
      }>
      Purchase Electric_token 
    </Button></Col>
        </Row>
      </Container>
      
    </div>
  );
}
