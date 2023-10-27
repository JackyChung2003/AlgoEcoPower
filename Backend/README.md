# AlgoEcoPower Smart Contract

This is the AlgoEcoPower smart contract repository. AlgoEcoPower is a decentralized platform that revolutionizes peer-to-peer (P2P) and consumer-to-consumer (C2C) interaction, enabling seamless buying, selling, and trading of energy. This smart contract plays a crucial role in facilitating these energy transactions on the Algorand blockchain.

## Table of Contents

- [Overview](#overview)
- [Smart Contract Details](#smart-contract-details)
- [Deployment](#deployment)

## Overview

This repository contains a PyTeal-based smart contract designed for the Algorand blockchain.
The purpose of this smart contract is to address a pressing challenge in the energy industry.
Each year, billions of kilowatt-hours of energy go to waste in the traditional consumption model.
AlgoEcoPower is on a mission to revolutionize the energy landscape by introducing a decentralized energy trading platform.
This platform empowers users to participate in energy commerce, facilitating the efficient utilization of this valuable resource.
Our smart contract plays a pivotal role in facilitating these energy transactions on the Algorand blockchain.

## Smart Contract Details

The smart contract is already deployed on the Algorand Testnet and can be found using app index `446975699` on [AlgoExplorer Testnet](https://testnet.algoexplorer.io/).

## Deployment

If you want to deploy this smart contract on the Algorand Testnet, follow these steps:

1. Set up your Algorand development environment with the Pre-requisites inside the [Pyteal-course Lab 1](https://github.com/Algo-Hub-io/pyteal-course/tree/main/Lab1).

2. Clone the sandbox repository:

   ```bash
   git clone https://github.com/algorand/sandbox.git
   ```

3. Redirect to the sandbox directory:

   ```bash
   cd /sandbox
   ```

4. Update the `docker-compose.yml` file to enable access to your local machine's files from within the Docker container.

   4.1. Open the `docker-compose.yml` file by running `code .` in your terminal. Add the following configuration at the end of the `algod` service:

   Existing Algod service;

   ```yaml
   algod:
     container_name: "algorand-sandbox-algod"
     build:
       context: .
       dockerfile: ./images/algod/Dockerfile
       args:
         CHANNEL: "${ALGOD_CHANNEL}"
         URL: "${ALGOD_URL}"
         BRANCH: "${ALGOD_BRANCH}"
         SHA: "${ALGOD_SHA}"
         BOOTSTRAP_URL: "${NETWORK_BOOTSTRAP_URL}"
         GENESIS_FILE: "${NETWORK_GENESIS_FILE}"
         TEMPLATE: "${NETWORK_TEMPLATE:-images/algod/template.json}"
         TOKEN: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
         ALGOD_PORT: "4001"
         KMD_PORT: "4002"
         CDT_PORT: "9392"
     ports:
       - 4001:4001
       - 4002:4002
       - 9392:9392
   ```

   4.2 add the following after ports section

   ```yaml
   volumes:
     - type: bind
       source: ../Backend
       target: /data
   ```

5. Open the Docker Desktop, then bring up the sandbox in Testnet using the linux system so that we can deploy to the test network.

```bash
./sandbox up testnet -v
```

6. enter the aglod container and move into the directory that we have bound to our computer.

```bash
./sandbox enter algod
cd /data
```

7. If you are new to sandbox, please follow the steps in the [Sandbox Deployment](https://github.com/Algo-Hub-io/pyteal-course/blob/main/Lab2/sandboxDeploy.md).

   7.1 But if you already have deploy this smart contract already, continue with this

   ```bash
   goal account list
   ```

   7.2 Save your address in an environment variable using the format `export ONE=<YOUR ADDRESS>`. Example is `export ONE=ZZGQZNLZ33I4RC7MLGPJEIMRRKRMIJJVKT376CZXNAFJP3C5B7NZUB4AXY`

   ```bash
   export ONE=
   ```

   _you can check your `ONE` variable by using command of `echo $ONE`_
   
8. Deploy our newly compiled smart contract to the Testnet.

```bash
  goal app create --creator $ONE --approval-prog approval.teal --clear-prog clear.teal --global-ints 8 --global-byteslices 0 --local-ints 4    --local-byteslices 0
```

9. We can see the app id returned after the app has been deployed.

10. Once deployed, you can find the relevant app index on [AlgoExplorer Testnet](https://testnet.algoexplorer.io/) to view detail of the smartcontract.

