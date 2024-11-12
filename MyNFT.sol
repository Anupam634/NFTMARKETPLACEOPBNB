// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract MyNFT is ERC721URIStorage {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIdCounter;

    constructor() ERC721("MyNFT", "MNFT") {}

    // Struct to store additional metadata
    struct NFTMetadata {
        string name;
        string description;
        uint256 price;
        address owner;
        bool isForSale;
    }

    mapping(uint256 => NFTMetadata) public nftMetadata;

    function mint(
        address to,
        string memory name,
        string memory description,
        uint256 price,
        string memory imageURI // Expecting a direct URI for IPFS or external storage
    ) public returns (uint256) {
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();

        // Mint the NFT to the recipient
        _mint(to, tokenId);

        // Directly set the token URI to the provided IPFS URI or metadata link
        _setTokenURI(tokenId, imageURI);

        // Store additional metadata and mark it for sale
        nftMetadata[tokenId] = NFTMetadata(name, description, price, to, true);

        return tokenId;
    }

    function buyNFT(uint256 tokenId) public payable {
        NFTMetadata storage nft = nftMetadata[tokenId];

        // Check if the NFT is for sale and if the correct price is paid
        require(nft.isForSale, "NFT is not for sale");
        require(msg.value == nft.price, "Incorrect price");

        address previousOwner = nft.owner;

        // Transfer the NFT to the buyer
        _transfer(previousOwner, msg.sender, tokenId);

        // Update NFT metadata
        nft.owner = msg.sender;
        nft.isForSale = false;

        // Transfer payment to the previous owner
        payable(previousOwner).transfer(msg.value);
    }

    function setForSale(uint256 tokenId, uint256 price) public {
        require(ownerOf(tokenId) == msg.sender, "Only the owner can sell this NFT");

        nftMetadata[tokenId].price = price;
        nftMetadata[tokenId].isForSale = true;
    }

    function tokenCounter() public view returns (uint256) {
        return _tokenIdCounter.current();
    }
}
