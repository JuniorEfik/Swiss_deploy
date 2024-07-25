// Import necessary modules from Hardhat and SwisstronikJS
const hre = require("hardhat");
const { encryptDataField, decryptNodeResponse } = require("@swisstronik/utils");

// Function to send a shielded transaction using the provided signer, destination, data, and value
const sendShieldedTransaction = async (signer, destination, data, value) => {
  // Get the RPC link from the network configuration
  const rpcLink = hre.network.config.url;

  // Encrypt transaction data
  const [encryptedData] = await encryptDataField(rpcLink, data);

  // Construct and sign transaction with encrypted data
  return await signer.sendTransaction({
    from: signer.address,
    to: destination,
    data: encryptedData,
    value,
  });
};

async function main() {
  // Address of the deployed contract
  const contractAddress = "0x56dff66e0122d8d5288c2235aa5ab9b1b700e62d";

  // Get the signer (your account)
  const [signer] = await hre.ethers.getSigners();

  // Create a contract instance
  const contractFactory = await hre.ethers.getContractFactory("TestToken");
  const contract = contractFactory.attach(contractAddress);

  // Specify the recipient address and quantity for token transfer
  const recipientAddress = "0x16af037878a6cAce2Ea29d39A3757aC2F6F7aac1";
  const quantity = "10";

  // Send a shielded transaction to execute a transaction in the contract
  const functionName = "transfer";
  const functionArgs = [recipientAddress, quantity];
  
  // Encode the function data using the contract interface
  const encodedData = contract.interface.encodeFunctionData(functionName, functionArgs);

   // Send the transaction with encrypted data and value (set as zero in this case)
   const transaction = await sendShieldedTransaction(signer, contractAddress, encodedData, 0);

   await transaction.wait();

   console.log("Transaction Response: ", transaction);
}

// Using async/await pattern to handle errors properly
main().catch((error) => {
   console.error(error);
   process.exitCode = 1;
});
