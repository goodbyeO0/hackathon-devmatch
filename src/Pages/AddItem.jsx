import { useEtherBalance, useEthers } from "@usedapp/core";
import { formatEther } from "ethers/lib/utils";
import healthItemPurchase from "../artifacts/contracts/HealthItemPurchase.sol/HealthItemPurchase.json";
import { utils, Contract } from "ethers";
import { useEffect, useState } from "react";

function AddItem() {
  const { activateBrowserWallet, deactivate, account, library } = useEthers();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [isLegit, setIsLegit] = useState(false);
  const [imageUri, setImageUri] = useState("");
  const [description, setDescription] = useState("");
  const [tokenUri, setTokenUri] = useState("");

  const healthItemPurchaseAbi = healthItemPurchase.abi;
  const healthItemPurchaseAddress =
    "0xf100B0Fe6d66B41994fFa699EA1A54901529c177"; // Replace with your deployed contract address

  const handleAddItem = async (event) => {
    event.preventDefault();
    setError(""); // Clear previous errors
    if (library && account) {
      const signer = library.getSigner(account);
      const healthItemPurchaseContract = new Contract(
        healthItemPurchaseAddress,
        healthItemPurchaseAbi,
        signer
      );
      try {
        setIsLoading(true);
        const tx = await healthItemPurchaseContract.addItem(
          name,
          utils.parseUnits(price, "ether"),
          isLegit,
          imageUri,
          description,
          tokenUri
        );
        await tx.wait();
        // Handle any additional logic after adding the item
      } catch (error) {
        console.error("Error adding item:", error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    } else {
      setError("Library or account is not available");
    }
  };

  return (
    <div className="container mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Add New Item</h2>
      <form onSubmit={handleAddItem}>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Name
          </label>
          <input
            type="text"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Price
          </label>
          <input
            type="number"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Image URI
          </label>
          <input
            type="text"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Image URI"
            value={imageUri}
            onChange={(e) => setImageUri(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Description
          </label>
          <textarea
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Token URI
          </label>
          <input
            type="text"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Token URI"
            value={tokenUri}
            onChange={(e) => setTokenUri(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Is Legit
          </label>
          <input
            type="checkbox"
            className="mr-2 leading-tight"
            checked={isLegit}
            onChange={(e) => setIsLegit(e.target.checked)}
          />
          <span className="text-sm">Is Legit</span>
        </div>
        {error && (
          <div className="mb-4 text-red-500">
            <p>Error: {error}</p>
          </div>
        )}
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="flex items-center">
              <svg
                className="animate-spin h-5 w-5 mr-3 text-white"
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
              Adding...
            </div>
          ) : (
            "Add Item"
          )}
        </button>
      </form>
    </div>
  );
}

export default AddItem;
