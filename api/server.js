const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

const port = 3001;
// const dataFilePath = './data.json';
// const nftIDFilePath = './nftID.json';
// const walletFilePath = './wallet.json';

//NFT selected by user
let nftIDs = [];
let walletInfo = null;

//NFT selected by user
app.post("/postNFT", (req, res) => {
  const { nftID } = req.body; // Extract nftID from the request body
  console.log("Request Body: ", req.body); // Debugging step
  console.log("nftID: ", nftID); // Debugging step

  if (nftID === undefined) {
    return res.status(400).send({ message: "NFT ID is missing or undefined" });
  }

  try {
    // Add the new NFT ID to the global array
    nftIDs.push(nftID);

    // Send a success response
    res.status(200).send({ message: "NFT ID received successfully" });
  } catch (err) {
    console.log("Error processing the request: ", err);
    res.status(500).send({ message: "Failed to process data" });
  }
});

app.post("/postWallet", (req, res) => {
  const { walletAddress } = req.body;
  console.log("Request Body: ", req.body);
  console.log("Wallet: ", walletAddress);

  try {
    // Store the new wallet information in the global variable
    walletInfo = walletAddress;

    // Send a success response
    res
      .status(200)
      .send({ message: "Wallet information received successfully" });
  } catch (err) {
    console.log("Error processing the request: ", err);
    res.status(500).send({ message: "Failed to process data" });
  }
});

app.get("/getNFT", (req, res) => {
  try {
    // Transform the nftIDs array into an array of objects with prodId property
    const transformedNFTs = nftIDs.map((id) => ({ prodId: id.toString() }));

    // Send the transformed array as the response
    res.status(200).json(transformedNFTs);
  } catch (err) {
    console.log("Error processing the request: ", err);
    res.status(500).send({ message: "Failed to retrieve data" });
  }
});

app.get("/getWalletAddress", (req, res) => {
  try {
    // Wrap the walletInfo object in another object
    res.status(200).json({ publicKey: walletInfo });
  } catch (err) {
    console.log("Error processing the request: ", err);
    res.status(500).send({ message: "Failed to retrieve data" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
