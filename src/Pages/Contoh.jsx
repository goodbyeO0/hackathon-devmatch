import { useEtherBalance, useEthers } from "@usedapp/core";
import { formatEther } from "ethers/lib/utils";
import SimpleStorage from "../artifacts/contracts/SimpleStorage.sol/SimpleStorage.json";
import { utils, Contract } from "ethers";
import { useEffect, useState } from "react";

function Contoh() {
  const { activateBrowserWallet, deactivate, account, library } = useEthers();
  const etherBalance = useEtherBalance(account);
  const [favoriteNumber, setFavoriteNumber] = useState(null);
  const [newFavoriteNumber, setNewFavoriteNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const simpleStorageAbi = SimpleStorage.abi;
  const simpleStorageAddress = "0xFc78e0b5203eEA962742e3325C7eB20c58f78418"; // Replace with your deployed contract address

  useEffect(() => {
    if (account && library) {
      const simpleStorageContract = new Contract(
        simpleStorageAddress,
        simpleStorageAbi,
        library.getSigner()
      );

      const fetchFavoriteNumber = async () => {
        try {
          const number = await simpleStorageContract.retrieve();
          setFavoriteNumber(number.toString());
        } catch (error) {
          console.error("Error fetching favorite number:", error);
        }
      };

      fetchFavoriteNumber();
    }
  }, [account, library]);

  const handleStore = async (event) => {
    event.preventDefault();
    if (library) {
      const simpleStorageContract = new Contract(
        simpleStorageAddress,
        simpleStorageAbi,
        library.getSigner()
      );
      try {
        setIsLoading(true);
        const tx = await simpleStorageContract.store(newFavoriteNumber);
        await tx.wait();
        const updatedNumber = await simpleStorageContract.retrieve();
        setFavoriteNumber(updatedNumber.toString());
      } catch (error) {
        console.error("Error storing favorite number:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="container">
      {favoriteNumber !== null && <div>Favorite Number: {favoriteNumber}</div>}
      {isLoading && <div>Loading...</div>}
      <form onSubmit={handleStore}>
        <input
          type="number"
          value={newFavoriteNumber}
          onChange={(e) => setNewFavoriteNumber(e.target.value)}
          placeholder="Enter new favorite number"
        />
        <button type="submit">Store</button>
      </form>
    </div>
  );
}

export default Contoh;
