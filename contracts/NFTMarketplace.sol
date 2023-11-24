// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.20;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract NFTMarketplace is ERC721URIStorage {
    uint256 private _tokenIds;
    uint256 private _itemsSold;

    address payable owner;
    uint256 listPrice = 0.01 ether;

    struct ListedToken {
        uint256 tokenId;
        address payable owner;
        address payable seller;
        uint256 price;
        bool currentlyListed;
    }

    event TokenListedSuccess(
        uint256 indexed tokenId,
        address owner,
        address seller,
        uint256 price,
        bool currentlyListed
    );

    mapping(uint256 => ListedToken) private idToListedToken;

    constructor() ERC721("NFTMarketplace", "NFTM") {
        owner = payable(msg.sender);
    }

    function updateListPrice(uint256 _listPrice) public payable {
        require(owner == msg.sender, "Only owner can update listing price");
        listPrice = _listPrice;
    }

    function getListPrice() public view returns (uint256) {
        return listPrice;
    }

    function getLatestIdToListedToken()
        public
        view
        returns (ListedToken memory)
    {
        return idToListedToken[_tokenIds];
    }

    function getListedTokenForId(
        uint256 tokenId
    ) public view returns (ListedToken memory) {
        return idToListedToken[tokenId];
    }

    function getCurrentToken() public view returns (uint256) {
        return _tokenIds;
    }

    function createToken(
        string memory tokenURI,
        uint256 price
    ) public payable returns (uint) {
        _tokenIds++;
        uint256 newTokenId = _tokenIds;

        _safeMint(msg.sender, newTokenId);
        _setTokenURI(newTokenId, tokenURI);

        createListedToken(newTokenId, price);

        return newTokenId;
    }

    function createListedToken(uint256 tokenId, uint256 price) private {
        require(msg.value == listPrice, "Incorrect listing price sent");
        require(price > 0, "Price must be greater than zero");

        idToListedToken[tokenId] = ListedToken(
            tokenId,
            payable(address(this)),
            payable(msg.sender),
            price,
            true
        );

        _transfer(msg.sender, address(this), tokenId);
        emit TokenListedSuccess(
            tokenId,
            address(this),
            msg.sender,
            price,
            true
        );
    }

    function getAllNFTs() public view returns (ListedToken[] memory) {
        uint256 itemCount = 0;

        for (uint256 i = 1; i <= _tokenIds; i++) {
            if (idToListedToken[i].currentlyListed) {
                itemCount++;
            }
        }

        ListedToken[] memory items = new ListedToken[](itemCount);
        uint256 currentIndex = 0;

        for (uint256 i = 1; i <= _tokenIds; i++) {
            if (idToListedToken[i].currentlyListed) {
                items[currentIndex] = idToListedToken[i];
                currentIndex++;
            }
        }

        return items;
    }

    function getMyNFTs() public view returns (ListedToken[] memory) {
        uint256 itemCount = 0;

        for (uint256 i = 1; i <= _tokenIds; i++) {
            if (idToListedToken[i].seller == msg.sender) {
                itemCount++;
            }
        }

        ListedToken[] memory items = new ListedToken[](itemCount);
        uint256 currentIndex = 0;

        for (uint256 i = 1; i <= _tokenIds; i++) {
            if (idToListedToken[i].seller == msg.sender) {
                items[currentIndex] = idToListedToken[i];
                currentIndex++;
            }
        }

        return items;
    }

    function executeSale(uint256 tokenId) public payable {
        // Check if the token is currently listed
        require(
            idToListedToken[tokenId].currentlyListed,
            "Token is not listed for sale"
        );

        uint256 price = idToListedToken[tokenId].price;
        address payable seller = idToListedToken[tokenId].seller;

        // Ensure that the payment amount is correct
        require(msg.value == price, "Incorrect payment amount");

        // Ensure that the buyer is not the same as the seller
        require(msg.sender != seller, "You cannot buy your own NFT");

        // Update the token's status
        idToListedToken[tokenId].currentlyListed = false;
        idToListedToken[tokenId].seller = payable(msg.sender);

        // Transfer the token to the buyer
        _transfer(address(this), msg.sender, tokenId);

        // Transfer the payment to the seller
        payable(seller).transfer(msg.value);

        _itemsSold++;
    }
}
