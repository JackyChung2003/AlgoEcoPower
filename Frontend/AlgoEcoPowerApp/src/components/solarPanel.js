import React from 'react';
import "./solarPanelStyle.css"
import { useEffect, useState, Fragment} from 'react';
import algosdk, { waitForConfirmation } from 'algosdk';
import "./dashboardStyle.css"
import {PeraWalletConnect} from '@perawallet/connect';
  
const peraWallet = new PeraWalletConnect();
const appIndex = 446975699;
const algod = new algosdk.Algodv2('', 'https://testnet-api.algonode.cloud', 443);

export default function SolarPanel({ accountAddress, optInToApp, isOptIn }) {
  const [userCurrencyTokenCount, setUserCurrencyTokenCount] = useState(null);
  const [userEnergyTokenCount, setUserEnergyTokenCount] = useState(null);
  const [userEnergyUploadCount, setUserEnergyUploadCount] = useState(null);
  const [userEnergyUploadRemainCount, setUserEnergyUploadRemainCount] = useState(null);
  const [userEnergyUploadSoldCount, setUserEnergyUploadSoldCount] = useState(null);
  
  const [userEnergyPurchaseCount, setUserEnergyPurchaseCount] = useState(null);
  const [userEnergyUploadPrice, setUserEnergyUploadPrice] = useState(0);
  let [isOpen, setIsOpen] = useState(false)
  const [currentButton, setCurrentButton] = useState(null); // State for current seller
  const [userEnergyThreshold, setUserEnergyThreshold] = useState(null);
  const [userEnergyThresholdTemporary, setUserEnergyThresholdTemporary] = useState(null);
  const userEnergyTokenCapacity = 20000;

  const [userEnergyBalanceCount, setUserEnergyBalanceCount] = useState(null);

  useEffect(() => {
    checkUserTokenEnergyCounts();
    checkGlobalCount();

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

  async function checkUserTokenEnergyCounts() {
    try {
      const accountInfo = await algod.accountApplicationInformation(accountAddress, appIndex).do();
  
      // Check if the account has local state data from the smart contract
      for (let i = 0; i < accountInfo['app-local-state']['key-value'].length; i++) {
        if (accountInfo['app-local-state']['key-value'][i].key === btoa("amount")) {
          setUserCurrencyTokenCount(accountInfo['app-local-state']['key-value'][i].value.uint);
        }
        else if (accountInfo['app-local-state']['key-value'][i].key === btoa("energy")) {
          setUserEnergyTokenCount(accountInfo['app-local-state']['key-value'][i].value.uint);
        }
        else if (accountInfo['app-local-state']['key-value'][i].key === btoa("energy_threshold")){
          setUserEnergyThreshold(accountInfo['app-local-state']['key-value'][i].value.uint);
        }
        
      }
    } catch (e) {
      console.error('There was an error connecting to the Algorand node: ', e);
    }
  }
  
  async function checkGlobalCount() {
    try {
      const counter = await algod.getApplicationByID(appIndex).do();
      
      for (let i = 0; i < counter.params["global-state"].length; i++){
        if (counter.params["global-state"][i].key === btoa("energy_purchase")){
          setUserEnergyPurchaseCount(counter.params["global-state"][i].value.uint)
        }
        else if(counter.params["global-state"][i].key === btoa("energy_upload")){
          setUserEnergyUploadCount(counter.params["global-state"][i].value.uint)
        }
        else if(counter.params["global-state"][i].key === btoa("energy_upload_price")){
          setUserEnergyUploadPrice(counter.params["global-state"][i].value.uint)
        }
        else if(counter.params["global-state"][i].key === btoa("energy_upload_remain")){
          setUserEnergyUploadRemainCount(counter.params["global-state"][i].value.uint)
        }
        else if(counter.params["global-state"][i].key === btoa("energy_upload_sold")){
          setUserEnergyUploadSoldCount(counter.params["global-state"][i].value.uint)
        }
        else if(counter.params["global-state"][i].key === btoa("energy_balance")){
          setUserEnergyBalanceCount(counter.params["global-state"][i].value.uint)
        }
      }
  
    } catch (e) {
      console.error('There was an error connecting to the Algorand node: ', e);
    }
  }

  async function callCounterApplication(action, amount, price) {
    try {
      // get suggested params
      const suggestedParams = await algod.getTransactionParams().do();
      const appArgs = [
        new Uint8Array(Buffer.from(action)),   // Pass the action as an argument 0
        new Uint8Array(Int32Array.of(amount)), // Pass the amount as an argument 1
        new Uint8Array(Int32Array.of(price))   // Pass the price as an argument 2
      ];
      
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
      
      checkUserTokenEnergyCounts();
      checkGlobalCount();
    } catch (e) {
      console.error(`There was an error calling the counter app: ${e}`);
    }
  }

  async function closeModal() {
    setIsOpen(false)
  }

  async function openModal() {
    setIsOpen(true)
  }

  return (
    <div className='solarpanel'>
      <div className="top-section">
        <div className='round-box'>
          <h1 class="round-box-text">Energy Balance:</h1>
          <h1 class="round-box-text-bold">{userEnergyTokenCount + userEnergyPurchaseCount}W</h1>
          <h1 class="round-box-text">(</h1>
          <h1 class="round-box-text-bold">{userEnergyTokenCount}W</h1>
          <h1 class="round-box-text">Energy Produced +</h1>
          <h1 class="round-box-text-bold">{userEnergyPurchaseCount}W</h1>
          <h1 class="round-box-text1">Energy Purchased)</h1>
          <h1 class="round-box-text-bold1">6 Solar Panels</h1>
          <h1 class="round-box-text2">Solar Battery Capacity:</h1>
          <h1 class="round-box-text-bold">20,000</h1>
          <h1 class="round-box-text1">W</h1>
          <h1 class="round-box-text2">Total Energy Generated Today:</h1>
          <h1 class="round-box-text-bold">{userEnergyTokenCount + userEnergyUploadCount} </h1>
          <h1 class="round-box-text">W</h1>

            
            
        </div>
      </div>
      <div className="middle-section">
        <div className="middle-left-section">
          <div className="solar-title">Battery Information</div>
          <div className="Charging-content">
            <div className="left-section">
              <div className="battery-icon">
                <div className="battery-body">
                   <div className="battery-charge" style={{ height: `${userEnergyTokenCount / 200}%` }}></div>
                </div>
                <div className="battery-level">
                {userEnergyTokenCount / 200}%
                </div>
              </div>
              <div className="section-content ml-2 mt-2">
                 <p>Threshold value: {userEnergyThreshold}%</p>
               </div>
            </div> 

            <div className="right-section">
              <div className="right-section-inner">
              <div className="section-title2">
                  <p className='mr-2'>Today total saved:</p>
                  RM2.43
                </div>
                <div className="section-title2">
                  <p className='mr-2'>PV output:</p>
                  2.43kWh
                </div>
                <div className="section-title2">
                  <p className='mr-2'>Solar panel temperature:</p>
                  34.5°C
                </div>
                <div className="section-title2">
                  <p className='mr-2'>Peak-hours energy production:</p>
                  6.5kWh
                </div>
                <div className="section-title2 mb-5">
                  <p className='mr-2'>Solar Battery Status:</p>
                  Charging
                </div>
                
                <div className="buttons mb-5 mr-2" id='button-section-2'>
                  <button class="styled-button"
                   onClick={
                    () => {
                      setCurrentButton('Set_Threshold');
                      setUserEnergyThresholdTemporary(userEnergyThreshold);
                      openModal();
                   }}
                   >Set Threshold</button>

                  <div className="button-space"></div> {/* Space between buttons */}

                  <button class="styled-button"
                  onClick={
                    () => {
                      setCurrentButton('Upload_Energy');
                      openModal();
                   }}
                  >Upload Energy</button>
                </div>
              </div>
            </div>
            

             </div>
        </div>
        <div className="middle-right-section">
          <div className="solar-title">Statistic Performance</div>
          <img
              src='https://raw.githubusercontent.com/JackyChung2003/AlgoEcoPower/b154ec44c4144113fe56087176e21facc202dcf0/images/Performance.svg'
              alt='Performance Analysis'
              className='performance-analysis'
            />
        </div>
      </div>
      <div className="bottom-section">
        <div className="bottom-left-section">
          <div className="solar-title">Solar Panel Monitoring</div>
          <img
              src='https://raw.githubusercontent.com/JackyChung2003/AlgoEcoPower/7fe8f6b18a97c78a423661fa5f41e82d1f98f928/images/Row%20Solar%20Panel%20Condition.svg'
              alt='Solar Conditon'
              className='solar-condition'
            />
        </div>
        <div className="bottom-right-section">
          <div>
            <div className="solar-title">Weather Forecast</div>
            <img
              src='https://raw.githubusercontent.com/JackyChung2003/AlgoEcoPower/3ad1adcd97121e63d01d339f94522af76e261750/images/Weather%20forecast.svg'
              alt='Weather Forecast'
              className='weather-forecast'
            />
          </div>
        </div>
      </div>
    </div>
  );
}

