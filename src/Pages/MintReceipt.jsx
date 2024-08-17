import React, { useState } from "react";
import { ethers, Contract } from "ethers";
import { useEthers } from "@usedapp/core";
import healthItemPurchase from "../artifacts/contracts/HealthItemPurchase.sol/HealthItemPurchase.json";

function MintReceipt() {
  const { account, library } = useEthers();
  const [recipientAddress, setRecipientAddress] = useState("");
  const [tokenUri, setTokenUri] = useState("");
  const [prodId, setProdId] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [txHash, setTxHash] = useState("");

  const contractAddress = "0x12D7a9f11070ecAd0a39238887AF880703eB0919"; // Replace with your contract address

  const handleFetchPaymentData = async () => {
    try {
      const response = await fetch(
        "http://localhost:3000/api/fetch-payment-data"
      );
      const data = await response.json();

      const prodIdNumbers = data.prodId.map((id) =>
        ethers.BigNumber.from(id.hex).toNumber()
      );

      setProdId(prodIdNumbers);
      setRecipientAddress(data.account);
    } catch (error) {
      console.error("Error fetching payment data:", error);
    }
  };

  const handleMintReceipt = async () => {
    if (!recipientAddress || !tokenUri || prodId.length === 0) return;

    setIsLoading(true);
    setTxHash("");

    try {
      console.log("Recipient Address:", recipientAddress);
      console.log("Token URI:", tokenUri);
      console.log("Product IDs:", prodId);

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = library.getSigner(account);
      const contract = new Contract(
        contractAddress,
        healthItemPurchase.abi,
        signer
      );

      // Log the values being passed to the mintReceipt function
      console.log("Calling mintReceipt with:");
      console.log("Recipient Address:", recipientAddress);
      console.log("Product IDs:", prodId);
      console.log("Token URI:", tokenUri);

      const tx = await contract.mintReceipt(recipientAddress, prodId, tokenUri);
      setTxHash(tx.hash);

      await tx.wait();
      alert("Receipt minted successfully!");
      setRecipientAddress("");
      setTokenUri("");
    } catch (error) {
      console.error("Error minting receipt:", error);
      alert(`Failed to mint receipt! Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <h1 className="text-4xl font-bold mb-8 text-center text-gray-800">
        Mint Receipt
      </h1>

      <div className="flex justify-center mb-6">
        <button
          onClick={handleFetchPaymentData}
          className="bg-blue-500 text-white py-2 px-6 rounded-lg shadow-md hover:bg-blue-600 transition duration-300"
        >
          Fetch Payment Data
        </button>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md mx-auto">
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Recipient Address
          </label>
          <input
            type="text"
            value={recipientAddress}
            onChange={(e) => setRecipientAddress(e.target.value)}
            placeholder="Enter recipient address"
            className="border border-gray-300 rounded-lg px-4 py-2 w-full"
            disabled
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Token URI
          </label>
          <input
            type="text"
            value={tokenUri}
            onChange={(e) => setTokenUri(e.target.value)}
            placeholder="Enter token URI"
            className="border border-gray-300 rounded-lg px-4 py-2 w-full"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Product IDs
          </label>
          <textarea
            value={prodId.join(", ")}
            readOnly
            className="border border-gray-300 rounded-lg px-4 py-2 w-full"
            rows="3"
          />
        </div>

        <div className="text-center">
          <button
            onClick={handleMintReceipt}
            className="bg-green-500 text-white py-2 px-6 rounded-lg shadow-md hover:bg-green-600 transition duration-300"
            disabled={isLoading || !tokenUri || !recipientAddress}
          >
            {isLoading ? "Minting..." : "Mint Receipt"}
          </button>
        </div>

        {txHash && (
          <div className="mt-6 text-center">
            <p className="text-gray-700">Transaction Hash:</p>
            <a
              href={`https://etherscan.io/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 underline"
            >
              {txHash}
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

export default MintReceipt;
