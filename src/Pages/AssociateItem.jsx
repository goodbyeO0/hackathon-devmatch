import React, { useState } from "react";
import { useEthers } from "@usedapp/core";
import { Contract, utils } from "ethers";
import healthItemPurchase from "../artifacts/contracts/HealthItemPurchase.sol/HealthItemPurchase.json";

function RealTimeProductScanner() {
  const { account, library } = useEthers();
  const [products, setProducts] = useState([]);
  const [publicKey, setPublicKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const contractAddress = "0x12D7a9f11070ecAd0a39238887AF880703eB0919"; // Replace with your contract address

  const fetchScannedProducts = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:3001/getNFT");
      const data = await response.json();
      console.log("Fetched product data:", data);

      if (data.length > 0) {
        const signer = library.getSigner(account);
        const contract = new Contract(
          contractAddress,
          healthItemPurchase.abi,
          signer
        );
        const items = [];

        for (let prod of data) {
          const item = await contract.items(parseInt(prod.prodId));
          items.push(item);
        }

        console.log("Fetched contract items:", items);
        setProducts(items);
      }
    } catch (error) {
      console.error("Error fetching scanned products:", error);
    } finally {
      setIsLoading(false); // Ensure loading state is set to false
    }
  };

  const fetchPublicKey = async () => {
    try {
      const response = await fetch("http://localhost:3001/getWalletAddress");
      const data = await response.json();
      console.log("Fetched public key:", data);
      setPublicKey(data.publicKey);
    } catch (error) {
      console.error("Error fetching public key:", error);
    }
  };

  const handleFetchData = async () => {
    await fetchScannedProducts();
    await fetchPublicKey();
  };

  const getIpfsUrl = (uri) => {
    return uri.startsWith("ipfs://")
      ? uri.replace("ipfs://", "https://ipfs.io/ipfs/")
      : uri;
  };

  const associateProducts = async () => {
    setIsLoading(true);
    try {
      const signer = library.getSigner(account);
      const contract = new Contract(
        contractAddress,
        healthItemPurchase.abi,
        signer
      );

      for (let product of products) {
        // Ensure product.id is correctly formatted as a uint256
        const tx = await contract.associateItemWithUser(product.id, publicKey);
        await tx.wait();
      }

      console.log("Products associated successfully");
      alert("Products associated successfully");
    } catch (error) {
      console.error("Error associating products:", error);
      alert("Error associating products");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Scanned Products</h1>

      <div className="text-center mb-4">
        <button
          onClick={handleFetchData}
          className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-700"
          disabled={isLoading}
        >
          {isLoading ? "Fetching..." : "Fetch Data"}
        </button>
      </div>

      {publicKey && (
        <div className="text-center mb-4">
          <p className="text-lg font-semibold">Public Key to be Associated:</p>
          <p className="text-sm text-gray-700 break-all">{publicKey}</p>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center">
          <svg
            className="animate-spin h-8 w-8 text-blue-500"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center text-gray-500">No products scanned.</div>
      ) : (
        <table className="table-auto w-full bg-white shadow-md rounded-lg overflow-hidden">
          <thead className="bg-gray-200">
            <tr>
              <th className="px-4 py-2">ID</th>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Price (ETH)</th>
              <th className="px-4 py-2">ATC Code</th> {/* Updated column */}
              <th className="px-4 py-2">Image</th>
              <th className="px-4 py-2">Description</th>
              <th className="px-4 py-2">Token URI</th>
            </tr>
          </thead>
          <tbody>
            {products.map((item, index) => (
              <tr key={index} className="border-b">
                <td className="px-4 py-2 text-center">{item.id.toString()}</td>
                <td className="px-4 py-2 text-center">{item.name}</td>
                <td className="px-4 py-2 text-center">
                  {parseFloat(utils.formatEther(item.price)).toFixed(4)}
                </td>
                <td className="px-4 py-2 text-center">{item.atcCode}</td>
                <td className="px-4 py-2 text-center">
                  <img
                    src={getIpfsUrl(item.imageUri)}
                    alt={item.name}
                    className="h-12 w-12 object-cover rounded-full"
                  />
                </td>
                <td className="px-4 py-2 text-center">{item.description}</td>
                <td className="px-4 py-2 text-center">
                  <a
                    href={getIpfsUrl(item.tokenUri)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 underline"
                  >
                    View Token
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div className="text-center mt-4">
        <button
          onClick={associateProducts}
          className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-700"
          disabled={isLoading || products.length === 0 || !publicKey}
        >
          {isLoading ? "Associating..." : "Associate Products"}
        </button>
      </div>
    </div>
  );
}

export default RealTimeProductScanner;
