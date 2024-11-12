import React, { useEffect, useState } from 'react';
import Web3 from 'web3';
import './MyNFT.css';
import nftContractABI from './nftContractABI.json';

function MyNFTs({ account, web3 }) {
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Contract address deployed on opBNB Testnet
  const contractAddress = "0x16c69df921b83bf0abe15349869bed46ecfb66ee";

  // Create contract instance
  const contract = new web3.eth.Contract(nftContractABI, contractAddress);

  // Load user's NFTs
  const loadNFTs = async () => {
    if (!account) {
      setMessage('Please connect your wallet.');
      return;
    }

    setLoading(true);
    setMessage('Loading your NFTs...');

    try {
      const tokenCount = await contract.methods.tokenCounter().call();
      const ownedNFTs = [];

      for (let tokenId = 0; tokenId < tokenCount; tokenId++) {
        const owner = await contract.methods.ownerOf(tokenId).call();
        if (owner.toLowerCase() === account.toLowerCase()) {
          const metadata = await contract.methods.nftMetadata(tokenId).call();
          const tokenURI = await contract.methods.tokenURI(tokenId).call();
          ownedNFTs.push({
            tokenId,
            name: metadata.name,
            description: metadata.description,
            price: Web3.utils.fromWei(metadata.price, 'ether'), // Convert price to human-readable format
            imageUrl: tokenURI,
            isForSale: metadata.isForSale,
          });
        }
      }

      setNfts(ownedNFTs);
      setMessage(ownedNFTs.length ? '' : 'No NFTs found in your wallet.');
    } catch (error) {
      console.error('Error loading NFTs:', error);
      setMessage('Failed to load NFTs. Please try again.');
    }

    setLoading(false);
  };

  // Set NFT for sale
  const setNFTForSale = async (tokenId, price) => {
    try {
      // Check if the price entered is valid
      if (!price || isNaN(price) || Number(price) <= 0) {
        alert('Please enter a valid price in tBNB.');
        return;
      }

      // Interact with the contract to set the NFT for sale
      await contract.methods
        .setForSale(tokenId, Web3.utils.toWei(price, 'ether'))
        .send({ from: account });

      alert('NFT listed for sale successfully!');
      loadNFTs(); // Refresh the NFT list
    } catch (error) {
      console.error('Error setting NFT for sale:', error);
      alert('Failed to set NFT for sale. Please try again.');
    }
  };

  useEffect(() => {
    if (web3 && account) {
      loadNFTs();
    }
  }, [account, web3]);

  return (
    <div>
      <h2>Your Minted NFTs</h2>
      {message && <p>{message}</p>}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="nft-container">
          {nfts.map((nft) => (
            <div className="nft-card" key={nft.tokenId}>
              <img src={nft.imageUrl} alt={nft.name} />
              <h3>{nft.name}</h3>
              <p>{nft.description}</p>
              <p>Price: {nft.price} tBNB</p>
              {nft.isForSale ? (
                <button onClick={() => alert('NFT is already listed for sale!')}>
                  Listed for Sale
                </button>
              ) : (
                <button
                  onClick={() =>
                    setNFTForSale(
                      nft.tokenId,
                      prompt('Enter sale price in tBNB')
                    )
                  }
                >
                  Set for Sale
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyNFTs;
