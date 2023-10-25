import Button from 'react-bootstrap/Button';
import { useEffect, useState, Fragment} from 'react';
import algosdk, { waitForConfirmation } from 'algosdk';
import "./marketPlaceStyle.css"
import Row from 'react-bootstrap/esm/Row';
import Col from 'react-bootstrap/Col';
import {PeraWalletConnect} from '@perawallet/connect';
import RangeSlider from 'react-bootstrap-range-slider';
import { Dialog, Transition } from '@headlessui/react'
import ProgressBar from 'react-bootstrap/ProgressBar';

const peraWallet = new PeraWalletConnect();
const appIndex = 446975699;
const algod = new algosdk.Algodv2('', 'https://testnet-api.algonode.cloud', 443);

const sellers = [
  {
    id: 1,
    name: 'Seller 1',
    imageSrc: 'https://images.unsplash.com/flagged/photo-1566838634698-48b165cb0a9d?auto=format&fit=crop&q=80&w=2070&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    imageAlt: 'Seller 1 Image',
    href: 'seller-1-link',
    price: 2,
  },
  {
    id: 2,
    name: 'Seller 2',
    imageSrc: 'https://plus.unsplash.com/premium_photo-1680302170723-1318f0a8859b?auto=format&fit=crop&q=80&w=2071&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    imageAlt: 'Seller 2 Image',
    href: 'seller-2-link',
    price: 3,
  },
  {
    id: 3,
    name: 'Seller 3',
    imageSrc: 'https://images.unsplash.com/flagged/photo-1566838803980-56bfa5300e8c?auto=format&fit=crop&q=80&w=2071&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    imageAlt: 'Seller 3 Image',
    href: 'seller-3-link',
    price: 2,
  },
  {
    id: 4,
    name: 'You',
    imageSrc: 'https://images.unsplash.com/photo-1630608354129-6a7704150401?auto=format&fit=crop&q=80&w=2069&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    imageAlt: 'user Image',
    href: '',
  },
];

export default function Marketplace({ accountAddress, optInToApp, isOptIn }) {
  const [userCurrencyTokenCount, setUserCurrencyTokenCount] = useState('');
  const [userEnergyTokenCount, setUserEnergyTokenCount] = useState(0);
  const [userEnergyUploadCount, setUserEnergyUploadCount] = useState(0);
  const [UserEnergyBalanceCount, setUserEnergyBalanceCount] = useState(0);
  const [userEnergyPurchaseCount, setUserEnergyPurchaseCount] = useState(0);
  const [userEnergyUploadPrice, setUserEnergyUploadPrice] = useState(0);
  const [energy_upload_amount_seller_1, setSeller1EnergyUploadCount] = useState(null);
  const [energy_upload_amount_seller_2, setSeller2EnergyUploadCount] = useState(null);
  const [energy_upload_amount_seller_3, setSeller3EnergyUploadCount] = useState(null);
  const [amountToPurchase1, setAmount1] = useState(0); // State for slide bar 1
  const [amountToPurchase2, setAmount2] = useState(0); // State for slide bar 2
  const [amountToPurchase3, setAmount3] = useState(0); // State for slide bar 3
  const [currentSeller, setCurrentSeller] = useState(null); // State for current seller
  const [userEnergyUploadRemainCount, setUserEnergyUploadRemainCount] = useState(null); // State for energy remain
  const [userEnergyUploadSoldCount, setUserEnergyUploadSoldCount] = useState(null); // State for energy remain
  const [userRetrieveEnergyUpload, SetUserRetrieveEnergyUpload] = useState(null); // State for energy remain
  let [isOpen, setIsOpen] = useState(false)

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
        else if (accountInfo['app-local-state']['key-value'][i].key === btoa("energy_balance")) {
          setUserEnergyBalanceCount(accountInfo['app-local-state']['key-value'][i].value.uint);
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
        else if(counter.params["global-state"][i].key === btoa("seller_1_upload_energy")){
          setSeller1EnergyUploadCount(counter.params["global-state"][i].value.uint)
        }
        else if(counter.params["global-state"][i].key === btoa("seller_2_upload_energy")){
          setSeller2EnergyUploadCount(counter.params["global-state"][i].value.uint)
        }
        else if(counter.params["global-state"][i].key === btoa("seller_3_upload_energy")){
          setSeller3EnergyUploadCount(counter.params["global-state"][i].value.uint)
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

  return (
    <div id='marketplace'>

      <div>
        <Row id='coin-row-section'>
          <Col id='coin-section'>
            <div className='d-flex align-items-center ml-9'>
              <img id='coin' src='https://github.com/jc2003-2003/AlgoEcoPower/blob/main/images/coin3.jpg?raw=true' alt='Energy_upload' />
              <h1 id='coin-name'>Token: {userCurrencyTokenCount}</h1>
            </div>
          </Col>
          <Col id='coin-section'>
            <div className='d-flex align-items-center'>
              <img id='coin' src='https://github.com/jc2003-2003/AlgoEcoPower/blob/main/images/coin3.jpg?raw=true' alt='Energy_upload' />
              <h1 id='coin-name'>Generated Energy: {userEnergyTokenCount}W </h1>
            </div>
          </Col>
          <Col id='coin-section'>
            <div className='d-flex align-items-center'>
              <img id='coin' src='https://github.com/jc2003-2003/AlgoEcoPower/blob/main/images/coin3.jpg?raw=true' alt='Energy_upload' />
              <h1 id='coin-name'>Uploaded Energy: {userEnergyUploadCount}W </h1>
            </div>
          </Col>
          <Col id='coin-section'>
            <div className='d-flex align-items-center'>
              <img id='coin' src='https://github.com/jc2003-2003/AlgoEcoPower/blob/main/images/coin3.jpg?raw=true' alt='Energy_upload' />
              <h1 id='coin-name'>Purchased Energy: {userEnergyPurchaseCount}W </h1>
            </div>
          </Col>
        </Row>
      </div>
    
      <div className="">
        <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8" id='border-outside'>
          <h2 className="text-2xl font-bold tracking-tight text-white">Prosumers near you</h2>
  
          <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
            <div id='seller' className="group relative">
              {/* Seller 1 */}
              <div className="aspect-h-1 aspect-w-1 w-full overflow-hidden rounded-md bg-gray-200 lg:aspect-none  lg:h-40">
                {/* Seller 1 Image */}
                <img
                  src={sellers[0].imageSrc}
                  alt={sellers[0].imageAlt}
                  className="h-full w-full object-cover object-center lg:h-40 lg:w-full"
                />
              </div>
              <div className="mt-4 flex justify-between">
                <div>
                  {/* Seller 1 Name */}
                  <h3 className="text-sm text-gray-700 text-left" id='seller-name'>
                    <a>
                      <span aria-hidden="true" className="absolute inset-0" />
                      {sellers[0].name}
                    </a>
                  </h3>
                </div>
                {/* Seller 1 Energy Price */}
                <p className="text-sm font-medium text-white">{sellers[0].price}Token/1 Energy</p>
              </div>
  
              <div className='flex'>
                {/* Seller 1 Energy Uploaded */}
                <p className="mt-1 text-sm text-white">Energy available: {energy_upload_amount_seller_1}</p>
              </div>
  
              <div className="SlideBar">
                <RangeSlider
                  variant = 'info'
                  value={amountToPurchase1}
                  onChange={changeEvent => setAmount1(changeEvent.target.value)}
                  max = {energy_upload_amount_seller_1}
                  step={100}
                />
              </div>
  
              <div>
                <p className="mt-1 text-sm text-gray-500">Final Price: {amountToPurchase1 * sellers[0].price}</p>
                <p className="mt-1 text-sm text-gray-500">Amount: {amountToPurchase1}</p>
              </div>
  
              <div id = 'purchase_section'>
               <Button id = 'Purchase_button' 
               
                 onClick={
                 () => {
                  setCurrentSeller(1); // Set the current seller to 1 for Seller 1
                  openModal();
                }
                 }>
                 Purchase
               </Button>
             </div>
            </div>
  
            <div id='seller' className="group relative">
              {/* Seller 2 */}
              <div className="aspect-h-1 aspect-w-1 w-full overflow-hidden rounded-md bg-gray-200 lg:aspect-none lg:h-40">
                {/* Seller 2 Image */}
                <img
                  src={sellers[1].imageSrc}
                  alt={sellers[1].imageAlt}
                  className="h-full w-full object-cover object-center lg:h-40 lg:w-full"
                />
              </div>
              <div className="mt-4 flex justify-between">
                <div>
                  {/* Seller 2 Name */}
                  <h3 className="text-sm text-gray-700 text-left" id='seller-name'>
                    <a>
                      <span aria-hidden="true" className="absolute inset-0"  />
                      {sellers[1].name}
                    </a>
                  </h3>
                </div>
                {/* Seller 2 Energy Price */}
                <p className="text-sm font-medium text-white">{sellers[1].price}Token/1 Energy</p>
              </div>
  
              <div className='flex'>
                {/* Seller 2 Energy Uploaded */}
                <p className="mt-1 text-sm text-white">Energy available: {energy_upload_amount_seller_2}</p>
              </div>
  
              <div className="SlideBar">
                <RangeSlider
                  value={amountToPurchase2}
                  variant = 'info'
                  onChange={changeEvent => setAmount2(changeEvent.target.value)}
                  max={energy_upload_amount_seller_2}
                  step={100}
                />
              </div>
  
              <div>
                <p className="mt-1 text-sm text-gray-500">Final Price: {amountToPurchase2 * sellers[1].price}</p>
                <p className="mt-1 text-sm text-gray-500">Amount: {amountToPurchase2}</p>
              </div>
  
              <div id='purchase_section'>
              <Button id = 'Purchase_button' 
                 onClick={
                 () => {
                  setCurrentSeller(2); // Set the current seller to 2 for Seller 2
                  openModal();
                }
                 }>
                  Purchase
                </Button>
              </div>
            </div>
            
            {/* Seller 3 */}
            <div id='seller' className="group relative">
              <div className="aspect-h-1 aspect-w-1 w-full overflow-hidden rounded-md bg-gray-200 lg:aspect-none lg:h-40">
                {/* Seller 3 Image */}
                <img
                  src={sellers[2].imageSrc}
                  alt={sellers[2].imageAlt}
                  className="h-full w-full object-cover object-center lg:h-40 lg:w-full"
                />
              </div>
              <div className="mt-4 flex justify-between">
                <div>
                  {/* Seller 3 Name */}
                  <h3 className="text-sm text-gray-700 text-left" id='seller-name'>
                    <a>
                      <span aria-hidden="true" className="absolute inset-0" />
                      {sellers[2].name}
                    </a>
                  </h3>
                  
                </div>
                {/* Seller 3 Energy Price */}
                <p className="text-sm font-medium text-white">{sellers[2].price}Token/1 Energy</p>
              </div>
  
              <div className='flex'>
                {/* Seller 3 Energy Uploaded */}
                <p className="mt-1 text-sm text-white">Energy available: {energy_upload_amount_seller_3}</p>
              </div>
  
              <div className="SlideBar">
                <RangeSlider
                  value={amountToPurchase3}
                  variant = 'info'
                  onChange={changeEvent => setAmount3(changeEvent.target.value)}
                  max={energy_upload_amount_seller_3}
                  step={100}
  
                />
              </div>
                        
              <div>
                <p className="mt-1 text-sm text-gray-500">Final Price: {amountToPurchase3 * sellers[2].price}</p>
                <p className="mt-1 text-sm text-gray-500">Amount: {amountToPurchase3}</p>
              </div>
                        
              <div id='purchase_section'>
                <Button id = 'Purchase_button' 
                   onClick={
                   () => {
                    setCurrentSeller(3); // Set the current seller to 3 for Seller 3
                    openModal();
                    }
                   }>
                  Purchase
                </Button>
              </div>
            </div>

            {/* Conditionally render if userEnergyUploadCount is not equal to zero */}
            {userEnergyUploadCount !== 0 && (
              <div id='seller' className="group relative">
              <div className="aspect-h-1 aspect-w-1 w-full overflow-hidden rounded-md bg-gray-200 lg:aspect-none lg:h-40">
                {/* Seller 4 or user Image */}
                <img
                  src={sellers[3].imageSrc}
                  alt={sellers[3].imageAlt}
                  className="h-full w-full object-cover object-center lg:h-40 lg:w-full"
                />
              </div>
              <div className="mt-4 flex justify-between">
                <div>
                  {/* Seller 4 or user Name */}
                  <h3 className="text-sm text-w text-left">
                      <span aria-hidden="true" className="absolute inset-0" />
                      {sellers[3].name}
                  </h3>
                </div>
                {/* Seller 4 or user Energy Price */}
                <p className="text-sm font-medium text-white">{userEnergyUploadPrice}Token/1 Energy</p>
              </div>
              <div className='flex'>
                    {/* Seller 4 or user Energy Uploaded */}
                    <p className="mt-1 text-sm text-white">Energy uploaded:  </p>
                    <p className="mt-1 text-sm text-yellow-200"> {userEnergyUploadCount}</p>
                  </div>
              
              <div>
              <ProgressBar style={{ marginTop: '15px' , marginBottom: '15px'}}>
                <ProgressBar striped variant="success" animated now={userEnergyUploadSoldCount} key={1} />
                <ProgressBar striped variant="danger" animated now={userEnergyUploadRemainCount} key={2} />
              </ProgressBar>
  
              </div>
              <div className="flex justify-between">
                <div>
                  <h3 className="text-sm text-green-100 text-left">
                    <span aria-hidden="true" className="absolute inset-0" />
                    <strong>Energy Sold:</strong>
                  </h3>
                  <p className="mt-1 text-sm text-green-400">{userEnergyUploadSoldCount}</p>
                </div>
                <div>
                  <h3 className="text-sm  text-red-100 text-left">
                    <span aria-hidden="true" className="absolute inset-0" />
                    <strong>Energy Remain: </strong>
                  </h3>
                  <p className="mt-1 text-sm text-red-400">{userEnergyUploadRemainCount}</p>
                </div>
              </div>
                        
              <div id='purchase_section'>
                <Button id = 'Purchase_button' 
                   onClick={
                   () => {
                    setCurrentSeller(4); // Set the current seller(just temp) to indicating self page
                    openModal();
                    }
                   }>
                  Edit
                </Button>
              </div>
            </div>
            )}
          </div>
        </div>
      </div>

      <Transition appear show={isOpen} as={Fragment}>
        {currentSeller === 4 ? (
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
                  <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                    <Dialog.Title
                      as="h3"
                      className="text-lg font-medium leading-6 text-gray-900"
                    >
                      Power Uploaded Adjustment Center
                    </Dialog.Title>
                    
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Edit Price Per Unit:
                        <input
                          type="number"
                          className="border border-gray-300 rounded-md p-1"
                          value={userEnergyUploadPrice}
                          onChange={(event) => setUserEnergyUploadPrice(event.target.value)}
                        />
                      </p>
                    </div>
  
                    {/* Reminder Section */}
                    <div className="mt-2">
                      <p className="text-sm text-gray-500 font">
                        Reminder: Please review and adjust the price per unit as needed.
                      </p>
                    </div>
  
                    <div className="SlideBar">
                    <h1 className='text-center font-semibold w-max mt-3'>Retrieve Energy:</h1>
                      <RangeSlider
                        value={userRetrieveEnergyUpload}
                        onChange={changeEvent => SetUserRetrieveEnergyUpload(changeEvent.target.value)}
                        max={userEnergyUploadRemainCount}
                        step={100}
                      />
                    </div>
                              
                    <div>
                      <p className="mt-1 text-sm text-gray-500">Amount to retrieve: {userRetrieveEnergyUpload} Energy</p>
                    </div>
                              
                    <div id='purchase_section'>
                      <Button id = 'Purchase_button' 
                         onClick={
                         () => {
                          callCounterApplication('Retrieve_Energy_Upload', userRetrieveEnergyUpload/100);
                          }
                         }>
                        Retrieve
                      </Button>
                    </div>
  
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Or retrieve all energy upload: 
                        <Button id = 'Purchase_button' 
                          onClick={
                           () => {
                            callCounterApplication('Retrieve_Energy_Upload_All');
                            }
                           }>
                          Retrieve All
                        </Button>
                      </p>
                    </div>  
  
                    <div className="mt-4 flex justify-between">
                      <button
                        type="button"
                        className="inline-flex justify-center rounded-md border border-transparent bg-red-100 px-4 py-2 text-sm font-medium text-red-900 hover:bg-red-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
                        onClick={closeModal}
                      >
                        Cancel Edit
                      </button>
                      <button
                        type="button"
                        className="inline-flex justify-center rounded-md border border-transparent bg-green-100 px-4 py-2 text-sm font-medium text-green-900 hover:bg-green-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2"
                        // onClick={handleRetrieveEnergy}
                      >
                        Save Edit
                      </button>
                    </div>

                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        ) : (
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
                  <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                    <Dialog.Title
                      as="h3"
                      className="text-lg font-medium leading-6 text-gray-900"
                    >
                      Payment Confirmation
                    </Dialog.Title>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                      Do you want to purchase {currentSeller === 1 ? amountToPurchase1 : currentSeller === 2 ? amountToPurchase2 : amountToPurchase3} energy from Seller {currentSeller} for a total price of {currentSeller === 1 ? amountToPurchase1 * sellers[0].price : currentSeller === 2 ? amountToPurchase2 * sellers[1].price : amountToPurchase3 * sellers[2].price}?
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
                          if (currentSeller === 1) {
                            callCounterApplication('Purchase_Energy_Seller_1', parseInt(amountToPurchase1/100, 10), sellers[0].price);
                          } else if (currentSeller === 2) {
                            // Call for Seller 2
                            callCounterApplication('Purchase_Energy_Seller_2', parseInt(amountToPurchase2/100, 10), sellers[1].price);
                          } else {
                            // Call for Seller 3
                            callCounterApplication('Purchase_Energy_Seller_3', parseInt(amountToPurchase3/100, 10), sellers[2].price);
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
        )}
      </Transition>
    </div>
  );
}
