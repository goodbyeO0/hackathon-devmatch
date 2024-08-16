// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract HealthItemPurchase is ERC721URIStorage, Ownable {
    // Define the structure of an Item
    struct Item {
        uint256 id; // Unique identifier for the item
        string name; // Name of the item
        uint256 price; // Price of the item in wei
        bool isLegit; // Indicates if the item is legitimate
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
    mapping(uint256 => Item) public items; // Mapping from item ID to Item details
    mapping(uint256 => Receipt) public receipts; // Mapping from receipt ID to Receipt details
    mapping(address => uint256[]) public userReceipts; // Mapping from user address to list of receipt IDs
    mapping(uint256 => address) public itemToOwner; // Mapping from item ID to the address of the owner

    // Reserve a range for receipt IDs, assuming item IDs will not exceed 1,000,000
    uint256 constant RECEIPT_ID_START = 1000000;

    // Constructor to initialize the ERC721 contract with name and symbol
    constructor() ERC721("HealthItemNFT", "HINFT") Ownable(msg.sender) {}

    // Function to add a new item to the contract
    // Only callable by the owner of the contract
    function addItem(
        string memory name,
        uint256 price,
        bool isLegit,
        string memory imageUri,
        string memory description,
        string memory tokenUri
    ) external onlyOwner {
        itemCounter++;
        items[itemCounter] = Item(
            itemCounter,
            name,
            price,
            isLegit,
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
        uint256[] memory itemIds,
        string memory tokenUri
    ) external payable {
        uint256 totalPrice = 0;

        // Calculate the total price of the items and validate legitimacy
        for (uint256 i = 0; i < itemIds.length; i++) {
            require(
                itemToOwner[itemIds[i]] == msg.sender,
                "Transaction sender does not own these items"
            ); // Ensure the caller owns the items
            require(
                items[itemIds[i]].isLegit,
                "One or more items are not legit"
            ); // Ensure all items are legitimate
            totalPrice += items[itemIds[i]].price; // Sum up the total price
        }

        require(
            msg.value >= totalPrice,
            "Insufficient funds to complete the purchase"
        ); // Ensure sufficient funds are provided

        // Create a new receipt with an ID offset by the constant
        receiptCounter++;
        uint256 receiptId = RECEIPT_ID_START + receiptCounter;
        receipts[receiptId] = Receipt(
            receiptId,
            msg.sender,
            itemIds,
            totalPrice,
            block.timestamp,
            ""
        );
        userReceipts[msg.sender].push(receiptId); // Add receipt to the user's list

        // Mint a new NFT receipt
        _mint(msg.sender, receiptId);
        _setTokenURI(receiptId, tokenUri);

        // Transfer each item NFT to the buyer
        for (uint256 i = 0; i < itemIds.length; i++) {
            _transfer(owner(), msg.sender, itemIds[i]); // Transfer ownership of each item NFT
            itemToOwner[itemIds[i]] = msg.sender; // Update the item owner mapping
        }
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
}
