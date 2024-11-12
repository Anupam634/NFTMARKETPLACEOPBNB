import React, { useEffect, useState } from 'react';
import Web3 from 'web3';
import nftContractABI from './nftContractABI.json';

function Marketplace({ web3, account }) {
  const [nftsForSale, setNftsForSale] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false); // Indicates if a transaction is in progress
  const [activeTokenId, setActiveTokenId] = useState(null); // Tracks the active NFT being purchased
  const contractAddress = "0x16c69df921b83bf0abe15349869bed46ecfb66ee"; // Update with your opBNB contract address

  // Load NFTs listed for sale
  const loadNFTsForSale = async () => {
    if (!web3 || !account) {
      setMessage('Please connect your wallet.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setMessage('Loading NFTs for sale...');
      const contract = new web3.eth.Contract(nftContractABI, contractAddress);
      const tokenCount = await contract.methods.tokenCounter().call();
      const forSale = [];

      for (let tokenId = 0; tokenId < tokenCount; tokenId++) {
        const metadata = await contract.methods.nftMetadata(tokenId).call();
        if (metadata.isForSale) {
          const tokenURI = await contract.methods.tokenURI(tokenId).call();
          forSale.push({
            tokenId,
            name: metadata.name,
            description: metadata.description,
            price: Web3.utils.fromWei(metadata.price, 'ether'), // Pricing in tBNB
            imageUrl: tokenURI,
            owner: metadata.owner,
          });
        }
      }

      setNftsForSale(forSale);
      setMessage(forSale.length === 0 ? 'No NFTs available for sale.' : '');
    } catch (error) {
      console.error('Error loading NFTs for sale:', error);
      setMessage('Failed to load NFTs. Please try again.');
    }
    setLoading(false);
  };

  // Buy NFT function
  const buyNFT = async (tokenId, price, owner) => {
    if (!web3 || !account) {
      alert('Please connect your wallet.');
      return;
    }

    if (owner.toLowerCase() === account.toLowerCase()) {
      alert('You cannot buy your own NFT.');
      return;
    }

    if (isProcessing) {
      alert('A purchase is already in progress. Please wait.');
      return;
    }

    setIsProcessing(true);
    setActiveTokenId(tokenId); // Set the active NFT being purchased

    try {
      const contract = new web3.eth.Contract(nftContractABI, contractAddress);
      await contract.methods.buyNFT(tokenId).send({
        from: account,
        value: Web3.utils.toWei(price, 'ether'), // Payment in tBNB
      });
      alert('NFT purchased successfully!');
      loadNFTsForSale(); // Refresh the marketplace
    } catch (error) {
      console.error('Error purchasing NFT:', error);
      alert('Failed to purchase NFT. Please try again.');
    }

    setIsProcessing(false);
    setActiveTokenId(null); // Reset the active token ID after purchase
  };

  useEffect(() => {
    if (account) {
      loadNFTsForSale();
    } else {
      setNftsForSale([]);
      setLoading(false);
    }
  }, [account, web3]);

  return (
    <div>
      <h2>Marketplace</h2>
      {!account ? (
        <p>Please connect your wallet to view the marketplace.</p>
      ) : loading ? (
        <p>{message}</p>
      ) : nftsForSale.length > 0 ? (
        <div className="nft-container">
          {nftsForSale.map((nft) => (
            <div className="nft-card" key={nft.tokenId}>
              <img src={nft.imageUrl} alt={nft.name} />
              <h3>{nft.name}</h3>
              <p>{nft.description}</p>
              <p>Price: {nft.price} tBNB</p>
              <button
                onClick={() => buyNFT(nft.tokenId, nft.price, nft.owner)}
                disabled={isProcessing} // Disable all buttons if a transaction is in progress
              >
                {activeTokenId === nft.tokenId ? 'Buying...' : 'Buy'}
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p>{message}</p>
      )}
    </div>
  );
}

export default Marketplace;
