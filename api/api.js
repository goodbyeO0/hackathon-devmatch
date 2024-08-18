const express = require("express");
const app = express();
const cors = require("cors");
const port = 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Configure CORS to allow requests from your frontend
app.use(
  cors({
    origin: "http://localhost:5173", // Replace with your frontend's URL
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  })
);

let postData = []; // Array to store POST data
let paymentData = {
  prodId: [1, 2],
  account: "0x12e442b53CA7A10D5038635bfCe8AA56498A47ED",
};

app.post("/api/payment-success", (req, res) => {
  const { prodId, account, success } = req.body;
  if (success) {
    paymentData = { prodId, account };
    res.status(200).json({ message: "Payment data stored successfully." });
  } else {
    res.status(400).json({ message: "Payment failed." });
  }
});

app.get("/api/fetch-payment-data", (req, res) => {
  if (paymentData.prodId && paymentData.account) {
    res.status(200).json(paymentData);
  } else {
    res.status(404).json({ message: "No payment data found." });
  }
});

// Define a GET endpoint to return stored POST data
app.get("/prodId", (req, res) => {
  res.json(postData); // Return the stored data directly as JSON
});

// Define a POST endpoint to receive and store data
app.post("/prodId", (req, res) => {
  postData.push(req.body); // Append the received data to the array
  res.json({ message: "Data received successfully", data: req.body });
});

// Define a GET endpoint to return a specific public key
app.get("/publicKey", (req, res) => {
  res.json({ publicKey: "0x12e442b53CA7A10D5038635bfCe8AA56498A47ED" });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
