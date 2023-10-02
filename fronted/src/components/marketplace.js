// import Container from 'react-bootstrap/Container';
// import Button from 'react-bootstrap/Button';
// import { useEffect, useState } from 'react';
// import algosdk, { waitForConfirmation } from 'algosdk';
// import "./dashboardStyle.css"
// import Row from 'react-bootstrap/esm/Row';
// import Col from 'react-bootstrap/Col';
// import {PeraWalletConnect} from '@perawallet/connect';
// import setAccountAddress from './Navbar';

// const peraWallet = new PeraWalletConnect();
// const appIndex = 405619740;
// const algod = new algosdk.Algodv2('', 'https://testnet-api.algonode.cloud', 443);

// const products = [
//     {
//       id: 1,
//       name: 'Basic Tee',
//       href: '#',
//       imageSrc: 'https://tailwindui.com/img/ecommerce-images/product-page-01-related-product-01.jpg',
//       imageAlt: "Front of men's Basic Tee in black.",
//       price: '$35',
//       color: 'Black',
//     },
//   ]
  
//   export default function Marketplace(accountAddress, optInToApp, isOptIn ) {
//     const [userCurrencyTokenCount, setUserCurrencyTokenCount] = useState(null);
//     const [userEnergyTokenCount, setUserEnergyTokenCount] = useState(null);
//     const [userEnergyUploadCount, setUserEnergyUploadCount] = useState(null);
//     const [userEnergyPurchaseCount, setUserEnergyPurchaseCount] = useState(null);

//     useEffect(() => {
//       checkUserCurrencyTokenCount();
//       checkUserEnergyTokenCount();
//       checkUserEnergyUploadCount();
//       checkUserEnergyPurchaseCount();

//       // Reconnect to session when the component is mounted
//       peraWallet.reconnectSession().then((accounts) => {
//         // Setup disconnect event listener
//         peraWallet.connector?.on('disconnect', handleDisconnectWalletClick);

//         if (accounts.length) {
//           // Set the user's Algorand address here
//           // setAccountAddress(accounts[0]);
//         }
//       });
//     }, []);

//     function handleDisconnectWalletClick() {
//       peraWallet.disconnect();
//       // Clear the user's Algorand address here
//       // setAccountAddress(null);
//     }
  
//     async function checkUserCurrencyTokenCount() {
//       try {
//         const accountInfo = await algod.accountApplicationInformation(accountAddress, appIndex).do();
//         if (accountInfo['app-local-state']) {
//           const currencyTokenCount = accountInfo['app-local-state']['key-value'][0].value.uint;
//           setUserCurrencyTokenCount(currencyTokenCount);
//         } else {
//           setUserCurrencyTokenCount(0);
//         }
//       } catch (e) {
//         console.error('There was an error connecting to the Algorand node: ', e);
//       }
//     }
  
//     async function checkUserEnergyTokenCount() {
//       try {
//         const accountInfo = await algod.accountApplicationInformation(accountAddress, appIndex).do();
//         if (accountInfo['app-local-state']) {
//           const energyTokenCount = accountInfo['app-local-state']['key-value'][1].value.uint;
//           setUserEnergyTokenCount(energyTokenCount);
//         } else {
//           setUserEnergyTokenCount(0);
//         }
//       } catch (e) {
//         console.error('There was an error connecting to the Algorand node: ', e);
//       }
//     }
  
//     async function checkUserEnergyUploadCount() {
//       try {
//         const counter = await algod.getApplicationByID(appIndex).do();
//         if (!!counter.params['global-state'][1].value.uint) {
//           setUserEnergyUploadCount(counter.params['global-state'][1].value.uint);
//         } else {
//           setUserEnergyUploadCount(0);
//         }
//       } catch (e) {
//         console.error('There was an error connecting to the algorand node: ', e)
//       }
//     }
  
//     async function checkUserEnergyPurchaseCount() {
//       try {
//         const counter = await algod.getApplicationByID(appIndex).do();
//         if (!!counter.params['global-state'][0].value.uint) {
//           setUserEnergyPurchaseCount(counter.params['global-state'][0].value.uint);
//         } else {
//           setUserEnergyPurchaseCount(0);
//         }
//       } catch (e) {
//         console.error('There was an error connecting to the algorand node: ', e)
//       }
//     }
    


//     return (
//       <div id='dashboard'>
//       <h1 id='Heading'>Welcome back, User {appIndex}</h1>

//       {/* Opt in to App notification */}
//       {isOptIn ? (
//         <div id='page_success'>Opt in successful, thank you for opting in.</div>
//       ) : (
//         <div id='page_ready'>
//           <h1 className='inline text-xl mr-4'>Opt-in to get more information.</h1>
//           <button id='optin_button' onClick={() => optInToApp()}>
//             Opt-in
//           </button>
//         </div>
//       )}
//       <div>
//         <Row>
//           <Col id='coin-section'>
//             <div className='d-flex align-items-center'>
//               <img id='coin' src='https://github.com/jc2003-2003/AlgoEcoPower/blob/main/images/coin3.jpg?raw=true' alt='Energy_upload' />
//               <h1 id='coin-name'>Token: {userCurrencyTokenCount}</h1>
//             </div>
//           </Col>
//           <Col id='coin-section'>
//             <div className='d-flex align-items-center'>
//               <img id='coin' src='https://github.com/jc2003-2003/AlgoEcoPower/blob/main/images/coin3.jpg?raw=true' alt='Energy_upload' />
//               <h1 id='coin-name'>Electric_token: {userEnergyTokenCount}</h1>
//             </div>
//           </Col>
//           <Col id='coin-section'>
//             <div className='d-flex align-items-center'>
//               <img id='coin' src='https://github.com/jc2003-2003/AlgoEcoPower/blob/main/images/coin3.jpg?raw=true' alt='Energy_upload' />
//               <h1 id='coin-name'>Energy_upload: {userEnergyUploadCount}</h1>
//             </div>
//           </Col>
//           <Col id='coin-section'>
//             <div className='d-flex align-items-center'>
//               <img id='coin' src='https://github.com/jc2003-2003/AlgoEcoPower/blob/main/images/coin3.jpg?raw=true' alt='Energy_upload' />
//               <h1 id='coin-name'>Energy_available: {userEnergyPurchaseCount}</h1>
//             </div>
//           </Col>
//         </Row>
//       </div><div className="bg-white">
//           <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
//             <h2 className="text-2xl font-bold tracking-tight text-gray-900">Prosumer who near by you</h2>

//             <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
//               {products.map((product) => (
//                 <div key={product.id} className="group relative">
//                   <div className="aspect-h-1 aspect-w-1 w-full overflow-hidden rounded-md bg-gray-200 lg:aspect-none group-hover:opacity-75 lg:h-80">
//                     <img
//                       src={product.imageSrc}
//                       alt={product.imageAlt}
//                       className="h-full w-full object-cover object-center lg:h-full lg:w-full" />
//                   </div>
//                   <div className="mt-4 flex justify-between">
//                     <div>
//                       <h3 className="text-sm text-gray-700">
//                         <a href={product.href}>
//                           <span aria-hidden="true" className="absolute inset-0" />
//                           {product.name}
//                         </a>
//                       </h3>
//                       <p className="mt-1 text-sm text-gray-500">{product.color}</p>
//                     </div>
//                     <p className="text-sm font-medium text-gray-900">{product.price}</p>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
//       </div>
//     )
//   }
  
import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';
import { useEffect, useState } from 'react';
import algosdk, { waitForConfirmation } from 'algosdk';
import "./dashboardStyle.css"
import Row from 'react-bootstrap/esm/Row';
import Col from 'react-bootstrap/Col';
import {PeraWalletConnect} from '@perawallet/connect';
import setAccountAddress from './Navbar';

// const peraWallet = new PeraWalletConnect();

// const appIndex = 405619740;
// const algod = new algosdk.Algodv2('','https://testnet-api.algonode.cloud', 443);

// export default function Dashboard({accountAddress, optInToApp, isOptIn}) { 
//   const [userCurrencyTokenCount, setUserCurrencyTokenCount] = useState(null);
//   const [userEnergyTokenCount, setUserCurrencyCount] = useState(null);
//   const [userEnergyUploadCount, setUserEnergyUploadCount] = useState(null);
//   const [userEnergyPurchaseCount, setUserEnergyPurchaseCount] = useState(null);
//   // const [userCurrencyTokenCount, setCurrentCount] = useState(null);
//   // const [userEnergyTokenCount, setLocalCount] = useState(null);
  
//   useEffect(() => {
//       // checkCounterState();
//       // checkLocalCounterState();
//       checkUserCurrencyTokenCount();
//       checkUserEnergyCount();
//       checkUserEnergyUploadCount();
//       checkUserEnergyPurchaseCount();

//       // reconnect to session when the component is mounted
//       peraWallet.reconnectSession().then((accounts) => {
//         // Setup disconnect event listener
//         peraWallet.connector?.on('disconnect', handleDisconnectWalletClick);
  
//         if (accounts.length) {
//           setAccountAddress(accounts[0]);
//         }
//       })
  
//     },[]);
  
//     // async function checkCounterState() {
//     //   try {
//     //     const counter = await algod.getApplicationByID(appIndex).do();
//     //     if (!!counter.params['global-state'][0].value.uint) {
//     //       setCurrentCount(counter.params['global-state'][0].value.uint);
//     //     } else {
//     //       setCurrentCount(0);
//     //     }
//     //   } catch (e) {
//     //     console.error('There was an error connecting to the algorand node: ', e)
//     //   }
//     // }
//     // async function checkLocalCounterState() {
//     //   try {
//     //     const accountInfo = await algod.accountApplicationInformation(accountAddress,appIndex).do();
//     //     if (!!accountInfo['app-local-state']['key-value'][0].value.uint) {
//     //       setLocalCount(accountInfo['app-local-state']['key-value'][0].value.uint);
//     //     } else {
//     //       setLocalCount(0);
//     //     }
//     //     console.log(accountInfo['app-local-state']['key-value'][0].value.uint);
//     //   } catch (e) {
//     //     console.error('There was an error connecting to the algorand node: ', e)
//     //   }
//     // }

//     function handleDisconnectWalletClick() {
//       peraWallet.disconnect();
//       setAccountAddress(null);
//     }
    
//   async function checkUserCurrencyTokenCount() {
//       try {
//           const accountInfo = await algod.accountApplicationInformation(accountAddress,appIndex).do();
//           if (!!accountInfo['app-local-state']['key-value'][0].value.uint) {
//               setUserCurrencyTokenCount(accountInfo['app-local-state']['key-value'][0].value.uint);
//           } else {
//               setUserCurrencyTokenCount(0);
//           }
//           console.log(accountInfo['app-local-state']['key-value'][0].value.uint);
//       } catch (e) {
//           console.error('There was an error connecting to the algorand node: ', e)
//       }
//   }
  

//   async function checkUserEnergyCount(accountAddress) {
//       try {
//           const accountInfo = await algod.accountApplicationInformation(accountAddress,appIndex).do();
//           if (!!accountInfo['app-local-state']['key-value'][0].value.uint) {
//               setUserCurrencyCount(accountInfo['app-local-state']['key-value'][0].value.uint);
//           } else {
//               setUserCurrencyCount(0);
//           }
//           console.log(accountInfo['app-local-state']['key-value'][0].value.uint);
//         } catch (e) {
//           console.error('There was an error connecting to the algorand node: ', e)
//         }
//       }

  

//   async function checkUserEnergyUploadCount() {
//       try {
//           const accountInfo = await algod.accountApplicationInformation(accountAddress,appIndex).do();
//           if (!!accountInfo['global-state']['key-value'][0].value.uint) {
//               setUserEnergyUploadCount(accountInfo['global-state']['key-value'][0].value.uint);
//           } else {
//               setUserEnergyUploadCount(0);
//           }
//           console.log(accountInfo['global-state']['key-value'][0].value.uint);
//         } catch (e) {
//           console.error('There was an error connecting to the algorand node: ', e)
//         }
//       }

//   async function checkUserEnergyPurchaseCount(accountAddress) {
//       try {
//           const accountInfo = await algod.accountApplicationInformation(accountAddress,appIndex).do();
//           if (!!accountInfo['global-state']['key-value'][0].value.uint) {
//             setUserEnergyPurchaseCount(accountInfo['global-state']['key-value'][0].value.uint);
//           } else {
//             setUserEnergyPurchaseCount(0);
//           }
//           console.log(accountInfo['global-state']['key-value'][0].value.uint);
//         } catch (e) {
//           console.error('There was an error connecting to the algorand node: ', e)
//         }
//       }

//   // async function callCounterApplication(accountAddress,action) {
//   //   try {
//   //     // get suggested params
//   //     const suggestedParams = await algod.getTransactionParams().do();
//   //     const appArgs = [new Uint8Array(Buffer.from(action))];
      
//   //     const actionTx = algosdk.makeApplicationNoOpTxn(
//   //       accountAddress,
//   //       suggestedParams,
//   //       appIndex,
//   //       appArgs
//   //       );

//   //     const actionTxGroup = [{txn: actionTx, signers: [accountAddress]}];

//   //     const signedTx = await peraWallet.signTransaction([actionTxGroup]);
//   //     console.log(signedTx);
//   //     const { txId } = await algod.sendRawTransaction(signedTx).do();
//   //     const result = await waitForConfirmation(algod, txId, 2);
//   //     checkUserCurrencyTokenCount();
//   //     checkUserCurrencyCount();
//   //     checkUserEnergyUploadCount();
//   //     checkUserEnergyPurchaseCount();
    
//   //   } catch (e) {
//   //     console.error(`There was an error calling the counter app: ${e}`);
//   //   }
//   // }

//   return (
//     // start with container
//     <Container id = 'dashboard'>
//       <h1 id = 'Heading'>Welcome back, User {appIndex}</h1>
      
//         {/* Opt in to App notification */}
//         {isOptIn ?
//         <div id ='page_success'>
//           Opt in successful, thank you for opting in.
//         </div>
//         :
//         <div id = 'page_ready'>
//           <h1 className='inline text-xl mr-4'>Opt-in to get more information.</h1>
//           <Button id = 'optin_button' 
//             onClick={
//             () => optInToApp()
//             }>
//             Opt-in
//           </Button>
//         </div>}
        
//         <div>
//         <Row>
//           <Col id='coin-section'>
//             <div className="d-flex align-items-center">
//               <img id ='coin' src='https://github.com/jc2003-2003/AlgoEcoPower/blob/main/images/coin3.jpg?raw=true' alt='Enegy_upload'/>
//               <h1 id='coin-name'>Token: {userCurrencyTokenCount}</h1>
//             </div>
//           </Col>
//           <Col id='coin-section'>
//             <div className="d-flex align-items-center">
//               <img id ='coin' src='https://github.com/jc2003-2003/AlgoEcoPower/blob/main/images/coin3.jpg?raw=true' alt='Enegy_upload'/>
//               <h1 id='coin-name'>Electric_token: {userEnergyTokenCount}</h1>
//             </div>
//           </Col>
//           <Col id='coin-section'>
//             <div className="d-flex align-items-center">
//               <img id ='coin' src='https://github.com/jc2003-2003/AlgoEcoPower/blob/main/images/coin3.jpg?raw=true' alt='Enegy_upload'/>
//               <h1 id='coin-name'>Enegy_upload: {userEnergyUploadCount}</h1>
//             </div>
//           </Col>
//           <Col id='coin-section'>
//             <div className="d-flex align-items-center">
//               <img id ='coin' src='https://github.com/jc2003-2003/AlgoEcoPower/blob/main/images/coin3.jpg?raw=true' alt='Enegy_upload'/>
//               <h1 id='coin-name'>Energy_purchase: {userEnergyPurchaseCount}</h1>
//             </div>
//           </Col>
//         </Row>
//         </div>
        
//         <div class="performance">
//         <div class="left">
//             <h2>Solar Energy Charge</h2>
//             <div class="solar-charge">
//                 <img id ='battery' src='https://github.com/jc2003-2003/AlgoEcoPower/blob/main/images/battery.gif?raw=true' alt='Enegy_upload'/>
//                 <div id ="middle-pic">75%</div>
//             </div>
//         </div>
//         <div class="right">
//             <h2>Performance Over Weeks (per week)</h2>
//             <div class="performance-chart">
//             </div>
//               <img id ='battery' src='https://www.researchgate.net/profile/Abu-Bakar-Khan/publication/340226677/figure/fig3/AS:873663482048514@1585309014359/Monthly-Bar-Chart-of-Monthly-energy-Production-kWh-of-different-Power-modules.png' alt='Enegy_upload'/>
            
//         </div>
//     </div>


//     </Container>
//   )
// } 

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
      Increase
    </Button></Col>
        </Row>
      </Container>
      
    </div>
  );
}
