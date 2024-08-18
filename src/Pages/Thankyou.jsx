import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

function ThankYou() {
  const location = useLocation();
  const navigate = useNavigate();
  const { paymentSuccess, itemIds } = location.state || {};

  const handleMintReceipt = () => {
    // Navigate to the MintReceipt page with itemIds passed in the state
    navigate("/mint-receipt", { state: { itemIds } });
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Thank You!</h1>
      <div className="text-center">
        <p>Your payment was successful!</p>
        <button
          onClick={handleMintReceipt}
          className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-700 mt-4"
        >
          Mint Receipt
        </button>
      </div>
    </div>
  );
}

export default ThankYou;
