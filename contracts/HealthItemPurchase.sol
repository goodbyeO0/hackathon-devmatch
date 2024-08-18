// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract HealthItemPurchase is ERC721URIStorage, Ownable {
    // Define the structure of an Item
    struct Item {
        uint256 id; // Unique identifier for the item
        string name; // Name of the item
        uint256 price; // Price of the item in wei
        string atcCode; // ATC code of the item
        string imageUri; // URI to the image of the item
        string description; // Description of the item
        string tokenUri; // URI for the token metadata
    }

    // Define the structure of a Receipt
    struct Receipt {
        uint256 receiptId; // Unique identifier for the receipt
        address buyer; // Address of the buyer
        uint256[] itemIds; // List of item IDs included in this receipt
        uint256 totalPrice; // Total price of the items in wei
        uint256 purchaseDate; // Timestamp of the purchase
        string tokenUri; // URI for the token metadata
    }

    uint256 private receiptCounter; // Counter to generate unique receipt IDs
    uint256 private itemCounter; // Counter to generate unique item IDs
    uint256 private test;
    mapping(uint256 => Item) public items; // Mapping from item ID to Item details
    mapping(uint256 => Receipt) public receipts; // Mapping from receipt ID to Receipt details
    mapping(address => uint256[]) public userReceipts; // Mapping from user address to list of receipt IDs
    mapping(uint256 => address) public itemToOwner; // Mapping from item ID to the address of the owner
    mapping(address => uint256) private pendingPayments; // Mapping from user to pending payment amount

    // New mapping to track the number of tokens each customer has
    mapping(address => uint256) public customerTokens;

    // Reserve a range for receipt IDs, assuming item IDs will not exceed 1,000,000
    uint256 constant RECEIPT_ID_START = 1000000;
    uint256 constant DISCOUNT_THRESHOLD = 5; // Number of tokens needed to get a discount
    uint256 constant DISCOUNT_PERCENTAGE = 10; // Discount percentage

    // Constructor to initialize the ERC721 contract with name and symbol
    constructor() ERC721("HealthItemNFT", "HINFT") Ownable(msg.sender) {}

    // Function to add a new item to the contract
    // Only callable by the owner of the contract
    function addItem(
        string memory name,
        uint256 price,
        string memory atcCode,
        string memory imageUri,
        string memory description,
        string memory tokenUri
    ) external onlyOwner {
        itemCounter++;
        items[itemCounter] = Item(
            itemCounter,
            name,
            price,
            atcCode,
            imageUri,
            description,
            tokenUri
        );

        // Mint NFT for the item
        _mint(owner(), itemCounter);
        _setTokenURI(itemCounter, tokenUri);
    }

    // Function to associate an item with a specific user address
    // Only callable by the owner of the contract
    function associateItemWithUser(
        uint256 itemId,
        address userAddress
    ) external onlyOwner {
        require(items[itemId].id != 0, "Item does not exist"); // Check if item exists
        itemToOwner[itemId] = userAddress; // Set the owner of the item internally
        // Do not transfer the NFT here, just associate the item
    }

    // Function to purchase items
    // The caller must send enough ETH to cover the total price of the items
    function purchaseItems(
        uint256[] memory itemIds
    ) external payable returns (bool) {
        uint256 totalPrice = 0;

        // Calculate the total price of the items
        for (uint256 i = 0; i < itemIds.length; i++) {
            require(
                itemToOwner[itemIds[i]] == msg.sender,
                "Transaction sender does not own these items"
            ); // Ensure the caller owns the items
            totalPrice += items[itemIds[i]].price; // Sum up the total price
        }

        // Check if the customer has enough tokens for a discount
        if (customerTokens[msg.sender] >= DISCOUNT_THRESHOLD) {
            uint256 discountAmount = (totalPrice * DISCOUNT_PERCENTAGE) / 100;
            totalPrice -= discountAmount; // Apply the discount
            customerTokens[msg.sender] = 0; // Reset the tokens after applying the discount
        }

        require(
            msg.value >= totalPrice,
            "Insufficient funds to complete the purchase"
        ); // Ensure sufficient funds are provided

        // Transfer each item NFT to the buyer
        for (uint256 i = 0; i < itemIds.length; i++) {
            _transfer(owner(), msg.sender, itemIds[i]); // Transfer ownership of each item NFT
            itemToOwner[itemIds[i]] = msg.sender; // Update the item owner mapping
        }

        pendingPayments[msg.sender] = totalPrice; // Record the payment amount for the user

        // Check if the payment exceeds 0.005 ETH, if so, give the customer 1 token
        if (msg.value > 0.005 ether) {
            customerTokens[msg.sender]++;
        }

        return true; // Return true to indicate successful payment
    }

    // Function to mint a receipt after purchase
    // Only callable by the owner of the contract
    function mintReceipt(
        address recipient,
        uint256[] memory itemIds,
        string memory tokenUri
    ) external onlyOwner {
        require(itemIds.length > 0, "No items provided");

        // Ensure the recipient address is valid
        require(recipient != address(0), "Invalid recipient address");

        // Ensure the recipient owns all the items
        for (uint256 i = 0; i < itemIds.length; i++) {
            require(
                itemToOwner[itemIds[i]] == recipient,
                "Recipient does not own all items"
            );
        }

        uint256 totalPrice = pendingPayments[recipient]; // Retrieve the total payment amount

        require(totalPrice > 0, "No pending payment found for the recipient"); // Ensure there is a pending payment

        // Create a new receipt with an ID offset by the constant
        receiptCounter++;
        uint256 receiptId = RECEIPT_ID_START + receiptCounter;
        receipts[receiptId] = Receipt(
            receiptId,
            recipient,
            itemIds,
            totalPrice,
            block.timestamp,
            tokenUri
        );
        userReceipts[recipient].push(receiptId); // Add receipt to the recipient's list

        // Mint a new NFT receipt
        _mint(recipient, receiptId);
        _setTokenURI(receiptId, tokenUri);

        // Clear the pending payment for the recipient
        pendingPayments[recipient] = 0;
    }

    // Function to get all item details
    // Returns an array of Item structs
    function getAllItems() external view returns (Item[] memory) {
        Item[] memory allItems = new Item[](itemCounter);
        for (uint256 i = 1; i <= itemCounter; i++) {
            allItems[i - 1] = items[i];
        }
        return allItems;
    }

    // Function to get all receipt IDs for a specific user
    function getUserReceipts(
        address user
    ) external view returns (uint256[] memory) {
        return userReceipts[user];
    }

    // Function to get the details of a specific receipt by its ID
    function getReceiptDetails(
        uint256 receiptId
    ) external view returns (Receipt memory) {
        return receipts[receiptId];
    }

    // Function to allow the contract owner to withdraw the contract balance
    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance; // Get the balance of the contract
        require(balance > 0, "No funds to withdraw"); // Ensure there are funds to withdraw
        payable(owner()).transfer(balance); // Transfer the balance to the owner
    }
}
