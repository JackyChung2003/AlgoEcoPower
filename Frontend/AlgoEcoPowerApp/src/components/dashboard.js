import Button from 'react-bootstrap/Button';
import { useEffect, useState, Fragment} from 'react';
import algosdk, { waitForConfirmation } from 'algosdk';
import "./dashboardStyle.css"
import Row from 'react-bootstrap/esm/Row';
import Col from 'react-bootstrap/Col';
import {PeraWalletConnect} from '@perawallet/connect';
import { Switch } from '@headlessui/react'
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import RangeSlider from 'react-bootstrap-range-slider';
import { Dialog, Transition } from '@headlessui/react'

const peraWallet = new PeraWalletConnect();
const appIndex = 446975699;
const algod = new algosdk.Algodv2('', 'https://testnet-api.algonode.cloud', 443);

export default function Dashboard({ accountAddress, optInToApp, isOptIn }) {

  const gifData = [
    {
      url: 'https://i.gifer.com/7Zgl.gif',
      text: 'Solar panels work even on cloudy days.',
    },
    {
      url: 'https://media.tenor.com/ziD0fMWnsCwAAAAd/total-eclipse-solar-eclipse101.gif',
      text: 'Solar is the Most Abundant Energy Source on Earth',
    },
    {
      url: 'https://media.tenor.com/Ecz7xL-jDRwAAAAd/rocket-rocketship.gif',
      text: 'Solar is the Fastest and Most Popular Form of New Electricity Generation',
    },
    {
      url: 'https://media.tenor.com/y2hzNYo-MScAAAAC/solar-tracker-cool.gif',
      text: 'Solar Power Plants Can Last 40 Years or More',
    },
    {
      url: 'https://media.tenor.com/t4xjFD7i71EAAAAC/stupendium-spamton.gif',
      text: 'Solar Will Become 35% Cheaper By 2024',
    },
    {
      url: 'https://media.tenor.com/ICzPZWPsBUQAAAAC/solar-energy-solar-solutions.gif',
      text: 'The Biggest Solar Farm in the World is in Morocco',
    },
    {
      url: 'https://media.tenor.com/CrD3b_kQcMwAAAAd/super-stonks.gif',
      text: ' China’s Solar Power Capacity is the Fastest Growing in the World',
    },
    {
      url: 'https://media.tenor.com/uwqmyUF-BPcAAAAC/energy-solar.gif',
      text: 'Solar Technologies Are Getting More Efficient',
    },
    {
      url: 'https://media.tenor.com/OOIQjyM4yPEAAAAd/nasa-nasa-gifs.gif',
      text: 'Scientists Are Exploring the Idea of Building Solar Power Stations in Space',
    },
    
  ];

  const [userCurrencyTokenCount, setUserCurrencyTokenCount] = useState(null);
  const [userEnergyTokenCount, setUserEnergyTokenCount] = useState(null);
  const [userEnergyUploadCount, setUserEnergyUploadCount] = useState(null);
  const [userEnergyUploadRemainCount, setUserEnergyUploadRemainCount] = useState(null);
  const [userEnergyUploadSoldCount, setUserEnergyUploadSoldCount] = useState(null);
  
  const [userEnergyPurchaseCount, setUserEnergyPurchaseCount] = useState(null);
  const [userEnergyUploadPrice, setUserEnergyUploadPrice] = useState(0);
  // const [isFooterVisible, setFooterVisible] = useState(false);
  const [enabled, setEnabled] = useState(false)
  const [amountToBeModify, setAmountToBeModify] = useState(0); // State for slide bar 1
  let [isOpen, setIsOpen] = useState(false)
  const [currentButton, setCurrentButton] = useState(null); // State for current seller
  const [userEnergyThreshold, setUserEnergyThreshold] = useState(null);
  const [userEnergyThresholdTemporary, setUserEnergyThresholdTemporary] = useState(null);
  
  const [userEnergyUploadAmount, setUserEnergyUploadAmount] = useState(null);
  const userEnergyTokenCapacity = 20000;
  const [index, setIndex] = useState(0);

  const randomIndex = Math.floor(Math.random() * gifData.length);
  const randomGif = gifData[randomIndex];

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

  const handleSelect = (selectedIndex) => {
    setIndex(selectedIndex);
  };

  let hours = 0;

  if (userEnergyThreshold <= 25) {
    hours = 4;
  } else if (userEnergyThreshold <= 50) {
    hours = 3;
  } else if (userEnergyThreshold <= 75) {
    hours = 2;
  } else {
    hours = 1;
  }

  return (
    <div id='dashboard'>
      <h1 id='Heading'>Welcome back, User {accountAddress}</h1>

      {/* Opt in to App notification */}
      {isOptIn ? (
        <div id='page_success'>Opt in successful, thank you for opting in.</div>        // not able to show this currently
      ) : (
        <div id='page_ready'>
          <h1 className='inline text-xl mr-4'>Opt-in to get more information.</h1>
          <button id='optin_button' onClick={() => optInToApp()}>
            Opt-in
          </button>
        </div>
      )}

      <div >
        <Row id='coin-row-section' className="rounded-full shadow m-4" >

          <Col id='coin-section' className="blue-column">
            <div className='d-flex align-items-center ml-9 '>
              <img id='coin' src='https://github.com/jc2003-2003/AlgoEcoPower/blob/main/images/coin3.jpg?raw=true' alt='Energy_upload' />
              <h1 id='coin-name'>Token: {userCurrencyTokenCount}</h1>
            </div>
          </Col>
          <Col id='coin-section'>
            <div className='d-flex align-items-center'>
              <img id='coin' src='https://github.com/jc2003-2003/AlgoEcoPower/blob/main/images/coin3.jpg?raw=true' alt='Energy_upload' />
              <h1 id='coin-name'>Generated Energy: {userEnergyTokenCount}W</h1>
            </div>
          </Col>
          <Col id='coin-section'>
            <div className='d-flex align-items-center'>
              <img id='coin' src='https://github.com/jc2003-2003/AlgoEcoPower/blob/main/images/coin3.jpg?raw=true' alt='Energy_upload' />
              <h1 id='coin-name'>Uploaded Energy: {userEnergyUploadCount}W</h1>
            </div>
          </Col>
          <Col id='coin-section'>
            <div className='d-flex align-items-center'>
              <img id='coin' src='https://github.com/jc2003-2003/AlgoEcoPower/blob/main/images/coin3.jpg?raw=true' alt='Energy_upload' />
              <h1 id='coin-name'>Purchased Energy: {userEnergyPurchaseCount}W</h1>
            </div>
          </Col>
          <Col id="coin-section">
          <div className="d-flex align-items-center">
              <button onClick={setEnabled} id="reload-button">Top Up</button>
          </div>
            <Switch.Group>
              <Switch.Label passive id='Dev-mode'>DEV mode</Switch.Label>
              <Switch
                checked={enabled}
                onChange={setEnabled}
                className={`${enabled ? 'bg-teal-900' : 'bg-teal-700'}
                  relative inline-flex h-[38px] w-[74px] shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75`}
              >
                <span className="sr-only"></span>
                <span
                  aria-hidden="true"
                  className={`${enabled ? 'translate-x-9 ': 'translate-x-0'}
                  relative inset-x-0 pointer-events-none inline-block h-[34px] w-[34px] transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out`}
                />
              </Switch>
            </Switch.Group> 
          </Col> 
        </Row>
      </div>

      <div className="dashboard">
        <div className="upper-section">
          <div className="upper-left " id='border'>
            {/* Content for the upper-left section */}
            <img
              src='https://raw.githubusercontent.com/JackyChung2003/AlgoEcoPower/fff5861d9674e91073e32412358be459dd28d148/images/Artboard%203.svg'
              alt='Energy_upload'
            />
          </div>
          <div className="upper-right" id='border'>
            {/* Content for the upper-right section */}
            <div className="energy-app">
              <div className="congrats">
                <h2>Congrats!</h2>
                <p>Today, you have saved RM {userCurrencyTokenCount}</p>
                <p>Power generated: {userEnergyTokenCount + userEnergyUploadCount}W</p>
                <p>Exceeding 83.3% of the state ranking.</p>
              </div>
              
              <div className="notenough">
                <p className="text-sm text-white mt-5">
                  Feel like power generated is not enough?
                </p>
              </div> 


              <div className="additional-options">
                <p id='additional-options-title'>Explore more options:</p>
                <div className="mt-2">
                    <p className="text-sm text-white">
                      <a href="/marketplace" className="clickable-text"> Purchase energy from community</a>
                    </p>
                  </div> 
                  <div className="mt-2">
                    <p className="text-sm text-white">
                      <a href="/" className="clickable-text">   Purchase more solar panels</a>
                    
                    </p>
                  </div> 
                  <div className="mt-2">
                    <p className="text-sm text-white">
                      <a href="/" className="clickable-text">  Join Community Solar Project</a>
                     
                    </p>
                  </div>
              </div>
            </div>
          </div>
        </div>
        <div className="lower-section">
          <div className="low-section" id='border'>
             <div className="section-title">Energy Summary</div>

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
                  <div className="section-title1">Battery Status:</div>
                  <div className="section-content">
                    <p>Current battery status: Charging</p>
                  </div>
                  <div className="section-title1">PV Output:</div>
                  <div className="section-content">
                    <p>Current solar power output: 3500W</p>
                    <p>Total solar power generated today: {userEnergyTokenCount + userEnergyUploadCount} kWh</p>
                  </div>
                  <div className="section-title1">Solar Panel Temperature:</div>
                  <div className="section-content">
                    <p>Current panel temperature: 33°C</p>
                  </div>
                  <div className="section-title1">Estimation Time to Reach Threshold Value:</div>
                  <div className="section-content mr-3">
                    <p>Estimated time to reach {userEnergyThreshold}%: {hours} hour{hours !== 1 ? 's' : ''}</p>
                  </div>
                  <div className="buttons" id='button-section-2'>
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

          <div className="low-section" id='border'>
            <div className="section-title">Weather Forecast</div>
            <div className="section-content">
              <img
              src='https://github.com/JackyChung2003/AlgoEcoPower/blob/main/images/dashboard%20weather.jpg?raw=true'
              alt='Dashboard weather forecast'
            />
            </div>
          </div>
          <div className="low-section " id='border'>
            <div className="section-title ">Solar Fun Fact</div>
            <div className="section-content mt-14">
              <p>{randomGif.text}</p>
              <img src={randomGif.url} alt="Random GIF" />
            </div>
          </div>
        </div>
      </div>
      {enabled && (
        <footer className="rounded-full shadow dark:bg-gray-800 " id="myFooter">
          <div className="w-full mx-auto max-w-screen-xl p-4 md:flex md:items-center md:justify-between">
          <span className="text-sm text-gray-500 sm:text-center dark:text-gray-400 mx-auto ">© 2023 <a href="/about" className="hover:underline">AlgoEcoPower</a>. All Rights Reserved.</span>
          <ul className="flex flex-wrap items-center my-1 text-sm font-medium text-gray-500 dark:text-gray-400 sm:mt-0">
          <div className="mb-2 ">
            {['Token', 'Energy_Token', 'Energy_upload', 'Energy_purchase'].map(
              (section) => (
                <DropdownButton
                  as={ButtonGroup}
                  key={section}
                  id={`dropdown-button-drop-up`}
                  drop={"up"}
                  variant="secondary"
                  title={` Modify ${section} `}
                  style={{ marginRight:  '10px'}}
                >
                  <Dropdown.Item 
                  className="text-center border border-gray-200 dark:border-gray-700"
                    eventKey={`Increase-${section}`}
                    onClick={() => {
                      if (section === 'Token') {
                        callCounterApplication('Add_Currency_100');
                      } else if (section === 'Energy_Token') {
                        callCounterApplication('Add_Energy_100');
                      } else if (section === 'Energy_upload') {
                        callCounterApplication('Add_Energy_upload_100');
                      } else if (section === 'Energy_purchase') {
                        callCounterApplication('Add_Energy_purchase_100');
                      }
                    }}>
                    {`Increase 100 ${section}`}
                  </Dropdown.Item>
                  
                  <Dropdown.Item 
                  className="text-center border border-gray-200 dark:border-gray-700"
                    eventKey={`Decrease-${section}`}
                    onClick={() => {
                      if (section === 'Token') {
                        callCounterApplication('Deduct_Currency_100');
                      } else if (section === 'Energy_Token') {
                        callCounterApplication('Deduct_Energy_100');
                      } else if (section === 'Energy_upload') {
                        callCounterApplication('Deduct_Energy_upload_100');
                      } else if (section === 'Energy_purchase') {
                        callCounterApplication('Deduct_Energy_purchase_100');
                      }
                    }}>
                    {`Decrease 100 ${section}`}
                  </Dropdown.Item>

                  <Dropdown.Divider />
                    <h1 className='text-center font-semibold w-max px-3'>Advanced {section} Modifier</h1>
                    <RangeSlider
                      value={amountToBeModify}
                      onChange={changeEvent => setAmountToBeModify(changeEvent.target.value)}
                      min = {-100}
                      max = {200}
                      tooltip='off'
                      className='px-2 py-2 w-64'
                    />
                    {amountToBeModify >= 0 ? (
                      <p className='text-center font-mono'>+{amountToBeModify *100} {section}</p>
                    ) : (
                      <p className='text-center font-mono'>{amountToBeModify *100} {section}</p>
                    )}

                  <Dropdown.Item 
                    className="text-center border border-gray-200 dark:border-gray-700"
                    eventKey={`Modify-${section}`}
                    onClick={() => {
                      if (amountToBeModify >= 0) {
                        if (section === 'Token') {
                          callCounterApplication('Modify_Currency_Add', parseInt(amountToBeModify, 10));
                        } else if (section === 'Energy_Token') {
                          callCounterApplication('Modify_Energy_Add', parseInt(amountToBeModify, 10));
                        } else if (section === 'Energy_upload') {
                          callCounterApplication('Modify_Energy_Upload_Add', parseInt(amountToBeModify, 10));
                        } else if (section === 'Energy_purchase') {
                          callCounterApplication('Modify_Energy_Purchase_Add', parseInt(amountToBeModify, 10));
                        }
                      } else if(amountToBeModify < 0){
                        if (section === 'Token') {
                          callCounterApplication('Modify_Currency_Deduct', parseInt(Math.abs(amountToBeModify), 10));
                        } else if (section === 'Energy_Token') {
                          callCounterApplication('Modify_Energy_Deduct', parseInt(Math.abs(amountToBeModify), 10));
                        } else if (section === 'Energy_upload') {
                          callCounterApplication('Modify_Energy_Upload_Deduct', parseInt(Math.abs(amountToBeModify), 10));
                        } else if (section === 'Energy_purchase') {
                          callCounterApplication('Modify_Energy_Purchase_Deduct', parseInt(Math.abs(amountToBeModify), 10));
                        }
                      }
                    }}>
                    {amountToBeModify >= 0 ? (
                      <p className='text-center'>Increase {amountToBeModify *100} {section}</p>
                    ) : (
                      <p className='text-center'>Decrease {Math.abs(amountToBeModify *100)} {section}</p>
                    )}
                  </Dropdown.Item>
                </DropdownButton>
              ),
            )}
          </div>
          
          <div className="mb-2">
            {['EnergySold'].map(
              (section) => (
                
                <DropdownButton
                  as={ButtonGroup}
                  key={section}
                  id={`dropdown-button-drop-up`}
                  drop={"up"}
                  variant="secondary"
                  title={` Energy Sold Demo `}
                  style={{ marginRight:  '10px'}}
                >
                  <h1 className='text-center font-semibold w-max px-3'>Demo User 123 purchase energy from you</h1>
                  <Dropdown.Divider />
                
                  <Dropdown.Divider />
                    <h1 className='text-center font-semibold w-max px-3'>User 123 want to purchase...</h1>
                    <RangeSlider
                      value={amountToBeModify}
                      onChange={changeEvent => setAmountToBeModify(changeEvent.target.value)}
                      min = {0}
                      max = {100}
                      tooltip='off'
                      className='px-2 py-2 w-64'
                    />
                      <p className='text-center font-mono'>{amountToBeModify *100} energy with {userEnergyUploadPrice} Token each!</p>

                  <Dropdown.Item 
                    className="text-center border border-gray-200 dark:border-gray-700"
                    eventKey={`Modify-${section}`}
                    onClick={() => {
                      // callCounterApplication('Modify_Currency_Add', (parseInt(amountToBeModify, 10)));
                        callCounterApplication('Energy_Upload_Purchase_By_Someone', parseInt(amountToBeModify, 10), parseInt(userEnergyUploadPrice, 10));
                    }}>
                      <p className='text-center'>Approve Transaction!</p>
                  </Dropdown.Item>
                </DropdownButton>
              ),
            )}

          <Button 
            id="reset_Button" 
            variant="warning"
            onClick={() => {
              callCounterApplication('Reset');
            }}
          >Reset</Button>
          </div>
            </ul>
          </div>
        </footer>
      )}

    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={closeModal}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>
              
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900"
                >
                  {
                    currentButton === 'Set_Threshold' ? (
                      <div>
                        <h1 className='text-center font-semibold w-max px-3'>Advanced Energy Threshold Control Panel</h1>
                      </div>
                    ) : currentButton === 'Upload_Energy' ? (
                      'Upload Energy'
                    ) : null // Add a default value or handle other cases if needed
                  }
                </Dialog.Title>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                  {
                    currentButton === 'Set_Threshold' ? (
                      
                      <div>
                        
                        <h1 className='text-center font-semibold w-max px-3'>Please note that the threshold cannot be lower than 15% </h1>
                        <RangeSlider
                          value={userEnergyThresholdTemporary}
                          onChange={changeEvent => {
                            let newValue = changeEvent.target.value;
                            if (newValue < 15) {
                              newValue = 15;
                            }
                            setUserEnergyThresholdTemporary(changeEvent.target.value);
                          }}
                          min = {15}
                          max = {100}
                          tooltip = 'off'
                          className='px-2 py-2 w-64'
                        />
                        <p className='text-center font-mono'>Reminder: When your energy production exceeds the set threshold, any excess energy will be automatically sold with {userEnergyUploadPrice} Tokens per energy.</p>
                        <p className='text-center text-orange-950 font-semibold'>Do you want to set the threshold value to {userEnergyThresholdTemporary}%?</p>
                      </div>
                    ) : currentButton === 'Upload_Energy' ? (
                      <div >
                        <h1 className='text-left font-semibold w-max px-3'>Advanced {currentButton} Modifier</h1>
                        <p className="text-left font-mono ml-3 ">
                          You currently have {userEnergyTokenCount} energy.
                        </p>
                        <p className="text-left font-mono ml-3">
                          You have uploaded {userEnergyUploadCount} energy.
                        </p>
                        {userEnergyUploadCount > 0 && (
                          <p className="text-left font-mono ml-3">
                            <span style={{ color: 'red' }}>
                              Energy remaining: {userEnergyUploadRemainCount} energy.      |
                            </span>
                            <span style={{ color: 'green' }}>
                              |       Energy sold: {userEnergyUploadSoldCount} energy.
                            </span>
                          </p>
                        )}

                        <RangeSlider
                          value={userEnergyUploadAmount}
                          onChange={(changeEvent) => setUserEnergyUploadAmount(changeEvent.target.value)}
                          min={0}
                          max={userEnergyTokenCount}
                          step={100}
                          tooltip="off"
                          className="px-2 py-2 w-64"
                        />
                        
                        <div className="flex items-center">
                          <label className="ml-2 mt-2 font-semibold">Amount: {userEnergyUploadAmount}</label>
                          <label className="ml-2 mt-2 font-semibold">Energy</label>
                        </div>

                        <div className="flex items-center">
                          <label className="ml-4 mt-2 font-semibold"> Price:</label>
                          <input
                            type="number"
                            value={userEnergyUploadPrice}
                            onChange={(event) => setUserEnergyUploadPrice(event.target.value)}
                            placeholder="Enter energy price"
                            className="ml-1 text-center w-20 px-2 py-2 border border-gray-300 rounded-md"
                          />
                          <label className="ml-2 mt-2 font-semibold">Token / 1 Energy</label>
                        </div>

                        <p className="text-center text-orange-950 font-semibold">
                          Do you want to upload {userEnergyUploadAmount} energy with the price of {userEnergyUploadPrice}Token/ 1Energy?
                        </p>
                      </div>
                    ) : null // Add a default value or handle other cases if needed
                  }
                  </p>
                </div>
              
                <div className="mt-4 flex justify-between">
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-transparent bg-red-100 px-4 py-2 text-sm font-medium text-red-900 hover:bg-red-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
                    onClick={closeModal}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-transparent bg-green-100 px-4 py-2 text-sm font-medium text-green-900 hover:bg-green-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2"
                    onClick={() => {
                      if (currentButton === 'Set_Threshold') {
                        callCounterApplication('Set_Threshold', parseInt(userEnergyThresholdTemporary, 10),parseInt(userEnergyTokenCapacity/100, 10));
                      } else if (currentButton === 'Upload_Energy') {
                        callCounterApplication('Upload_Energy', parseInt(userEnergyUploadAmount/100, 10), parseInt(userEnergyUploadPrice, 10));
                      }
                      closeModal();
                    }}
                  >
                    Confirm
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
    </div>
  );
}
