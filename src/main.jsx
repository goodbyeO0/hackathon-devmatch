import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { DAppProvider } from "@usedapp/core";
import { getDefaultProvider } from "ethers";

const SEPOLIA_SCROLL_CHAIN_ID = 534351;

const config = {
  readOnlyChainId: SEPOLIA_SCROLL_CHAIN_ID,
  readOnlyUrls: {
    [SEPOLIA_SCROLL_CHAIN_ID]: getDefaultProvider("sepolia"),
  },
};

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <DAppProvider config={config}>
      <App />
    </DAppProvider>
  </StrictMode>
);
