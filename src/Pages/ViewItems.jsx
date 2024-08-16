import React, { useEffect, useState } from "react";
import { useEthers } from "@usedapp/core";
import { Contract, utils } from "ethers";
import healthItemPurchase from "../artifacts/contracts/HealthItemPurchase.sol/HealthItemPurchase.json";

function ViewItems() {
  const { account, library } = useEthers();
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const contractAddress = "0xf100B0Fe6d66B41994fFa699EA1A54901529c177"; // Replace with your contract address

  useEffect(() => {
    const fetchItems = async () => {
      if (library) {
        const signer = library.getSigner(account);
        const contract = new Contract(
          contractAddress,
          healthItemPurchase.abi,
          signer
        );
        try {
          const fetchedItems = await contract.getAllItems();
          setItems(fetchedItems);
        } catch (error) {
          console.error("Error fetching items:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchItems();
  }, [account, library]);

  const getIpfsUrl = (uri) => {
    if (uri.startsWith("ipfs://")) {
      return uri.replace("ipfs://", "https://ipfs.io/ipfs/");
    }
    return uri;
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Available Items</h1>
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
      ) : (
        <table className="table-auto w-full bg-white shadow-md rounded-lg overflow-hidden">
          <thead className="bg-gray-200">
            <tr>
              <th className="px-4 py-2">ID</th>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Price (ETH)</th>
              <th className="px-4 py-2">Legit</th>
              <th className="px-4 py-2">Image</th>
              <th className="px-4 py-2">Description</th>
              <th className="px-4 py-2">Token URI</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={index} className="border-b">
                <td className="px-4 py-2 text-center">{item.id.toString()}</td>
                <td className="px-4 py-2 text-center">{item.name}</td>
                <td className="px-4 py-2 text-center">
                  {parseFloat(utils.formatEther(item.price)).toFixed(4)}
                </td>
                <td className="px-4 py-2 text-center">
                  {item.isLegit ? "Yes" : "No"}
                </td>
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
    </div>
  );
}

export default ViewItems;
