import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { DAppProvider, Sepolia } from "@usedapp/core";
import { getDefaultProvider } from "ethers";

const config = {
  readOnlyChainId: Sepolia.chainId,
  readOnlyUrls: {
    [Sepolia.chainId]: getDefaultProvider("sepolia"),
  },
};

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <DAppProvider config={config}>
      <App />
    </DAppProvider>
  </StrictMode>
);
