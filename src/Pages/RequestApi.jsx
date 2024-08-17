import React, { useState } from "react";

function RequestApi() {
  const [prodId, setProdId] = useState("");

  const handlePostRequest = async () => {
    try {
      const response = await fetch("http://localhost:3000/prodId", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prodId }),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      console.log("Success:", data);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div>
      <input
        type="text"
        value={prodId}
        onChange={(e) => setProdId(e.target.value)}
        placeholder="Enter Product ID"
      />
      <button onClick={handlePostRequest}>Send POST Request</button>
    </div>
  );
}

export default RequestApi;
