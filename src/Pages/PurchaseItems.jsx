import React, { useState, useEffect } from "react";
import { useEthers } from "@usedapp/core";
import { ethers, Contract, utils } from "ethers";
import { useNavigate } from "react-router-dom";
import healthItemPurchase from "../artifacts/contracts/HealthItemPurchase.sol/HealthItemPurchase.json";

function PurchaseItems() {
  const { account, library } = useEthers();
  const navigate = useNavigate();
  const [ownedItems, setOwnedItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [totalPrice, setTotalPrice] = useState("0");
  const [isLoading, setIsLoading] = useState(false);

  const contractAddress = "0x12D7a9f11070ecAd0a39238887AF880703eB0919"; // Replace with your contract address

  useEffect(() => {
    if (account && library) {
      fetchOwnedItems();
    }
  }, [account, library]);

  const fetchOwnedItems = async () => {
    try {
      const provider =
        library || new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner(account);
      const contract = new Contract(
        contractAddress,
        healthItemPurchase.abi,
        signer
      );

      const allItems = await contract.getAllItems(); // Fetch all items

      const userItems = []; // Array to store items owned by the user

      for (let i = 0; i < allItems.length; i++) {
        const itemId = allItems[i][0].toString(); // Ensure itemId is a string
        const owner = await contract.itemToOwner(itemId); // Get item owner by item ID
        if (owner.toLowerCase() === account.toLowerCase()) {
          userItems.push(allItems[i]);
        }
      }

      setOwnedItems(userItems); // Update the state with the owned items
    } catch (error) {
      console.error("Error fetching owned items:", error);
    }
  };

  const handleItemSelect = (itemId) => {
    setSelectedItems((prevSelected) => {
      const newSelected = new Set(prevSelected);
      if (newSelected.has(itemId)) {
        newSelected.delete(itemId);
      } else {
        newSelected.add(itemId);
      }
      calculateTotalPrice(newSelected);
      return newSelected;
    });
  };

  const calculateTotalPrice = (selectedItems) => {
    const total = [...selectedItems].reduce((acc, itemId) => {
      const item = ownedItems.find((item) => item[0].toString() === itemId);
      return acc + parseFloat(utils.formatEther(item[2]));
    }, 0);
    setTotalPrice(total.toString());
  };

  const handlePurchase = async () => {
    if (selectedItems.size === 0) return;

    setIsLoading(true);
    try {
      const provider =
        library || new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner(account);
      const contract = new Contract(
        contractAddress,
        healthItemPurchase.abi,
        signer
      );

      const itemIds = [...selectedItems].map((id) => ethers.BigNumber.from(id));
      const tx = await contract.purchaseItems(itemIds, {
        value: utils.parseEther(totalPrice),
      });

      await tx.wait();

      if (tx) {
        // Make a POST request to the server
        const response = await fetch(
          "http://localhost:3000/api/payment-success",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              prodId: itemIds,
              account, // Send the account/public key as well
              success: true,
            }),
          }
        );

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        alert("Purchase successful!");
        navigate("/thank-you"); // Redirect to the ThankYou page
      }
    } catch (error) {
      console.error("Error during purchase:", error);
      alert("Purchase failed!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Purchase Items</h1>

      <div className="text-center mb-4">
        {ownedItems.length === 0 ? (
          <div className="text-center text-gray-500">
            No items available for purchase.
          </div>
        ) : (
          <div>
            <h2>Select Items to Purchase:</h2>
            {ownedItems.map((item) => (
              <div key={item[0].toString()}>
                <input
                  type="checkbox"
                  id={`item-${item[0]}`}
                  checked={selectedItems.has(item[0].toString())}
                  onChange={() => handleItemSelect(item[0].toString())}
                />
                <label htmlFor={`item-${item[0]}`}>
                  {item[1]} -{" "}
                  {parseFloat(utils.formatEther(item[2])).toFixed(4)} ETH
                </label>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="text-center">
        <button
          onClick={handlePurchase}
          className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-700"
          disabled={isLoading || selectedItems.size === 0}
        >
          {isLoading ? "Processing..." : `Purchase for ${totalPrice} ETH`}
        </button>
      </div>
    </div>
  );
}

export default PurchaseItems;
