import React from "react";
import { useEtherBalance, useEthers } from "@usedapp/core";
import { formatEther } from "ethers/lib/utils";

function Navbar() {
  const { activateBrowserWallet, deactivate, account } = useEthers();
  const etherBalance = useEtherBalance(account);

  return (
    <nav className="bg-gray-800 p-4 flex justify-between items-center">
      <h2 className="text-white text-2xl font-bold">My DApp</h2>
      <div className="wallet-info flex items-center">
        {!account ? (
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={() => activateBrowserWallet()}
          >
            Connect Wallet
          </button>
        ) : (
          <>
            <span className="text-white mr-4">
              {`Connected: ${account.substring(0, 6)}...${account.substring(
                account.length - 4
              )}`}
            </span>
            <button
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded mr-4"
              onClick={() => deactivate()}
            >
              Disconnect
            </button>
            {etherBalance && (
              <span className="text-white">
                Balance: {parseFloat(formatEther(etherBalance)).toFixed(3)} ETH
              </span>
            )}
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
