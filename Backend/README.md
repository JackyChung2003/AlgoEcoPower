# AlgoEcoPower Smart Contract 

This is the AlgoEcoPower smart contract repository. AlgoEcoPower is a decentralized platform that revolutionizes peer-to-peer (P2P) and consumer-to-consumer (C2C) interaction, enabling seamless buying, selling, and trading of energy. This smart contract plays a crucial role in facilitating these energy transactions on the Algorand blockchain.

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

2. We need to clone the sandbox from git

```bash
git clone https://github.com/algorand/sandbox.git
```

3. Redirect the directory to the sandbox folder.

```bash
   cd /sandbox
```

4. Update the sandbox file `docker-compose.yml` to allow us to access our files on our local machine from within the docker container.

  4.1. To do this, using `code .` open `docker-compose.yml` and add the following to the end of the algod service.

Existing Algod service;
```
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

```
volumes:
      - type: bind
        source: ../Backend
        target: /data
```

5. Open the Docker Desktop, then bring up the sandbox in Testnet so that we can deploy to the test network.

```bash
   ./sandbox up testnet -v
```

6. enter the aglod container and move into the directory that we have bound to our computer.

```bash
   ./sandbox enter algod
   cd /data
```

5. If you are new to sandbox, please follow the steps in the [Sandbox Deployment](https://github.com/Algo-Hub-io/pyteal-course/blob/main/Lab2/sandboxDeploy.md).
   5.1 But if you already have deploy this smart contract already, continue with this
```bash
  goal account list
```
  5.2 Save your address in an environment variable using the format `export ONE=<YOUR ADDRESS>`. Example is `export ONE=ZZGQZNLZ33I4RC7MLGPJEIMRRKRMIJJVKT376CZXNAFJP3C5B7NZUB4AXY` 
```bash
  export ONE=
```
  5.1 But if you already have deploy this smart contract already, continue with this
```bash
  goal account list
```

   
3. Compile the PyTeal scripts into Algorand smart contracts using the Algorand SDK. You can refer to Algorand's official documentation for more details.

4. Deploy the smart contract to the Algorand Testnet using your Algorand SDK and account credentials.

5. Once deployed, you can find the relevant app index on Algorand Network Explorer (e.g., AlgoExplorer) to interact with the contract.

## Usage

Provide instructions on how users or developers can interact with your smart contract. Include details on the functions available, how to call them, and what kind of data they can read and write to the smart contract's global and local states.

## Security and Validation

Explain the security measures and proper validation checks you've implemented to ensure the robustness and security of your smart contract. Highlight any potential vulnerabilities and how they have been mitigated.

## License

Specify the license under which your smart contract is released. You can choose from various open-source licenses, such as MIT, Apache, or others.

## Contact

Provide contact information or links to your social media profiles or email address in case users or developers have questions or need assistance with your smart contract.
