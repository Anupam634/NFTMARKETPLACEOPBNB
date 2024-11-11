import React, { useEffect, useState } from 'react';
import Web3 from 'web3';
import './MyNFT.css';
import nftContractABI from './nftContractABI.json';

function MyNFTs({ account, web3 }) {
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const contractAddress = "0xec6334c3ab02e41daa0d4993fa2e66526be0a227"; 

  const contract = new web3.eth.Contract(nftContractABI, contractAddress);

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
            price: Web3.utils.fromWei(metadata.price, 'ether'),
            imageUrl: tokenURI,
            isForSale: metadata.isForSale
          });
        }
      }

      setNfts(ownedNFTs);
      setMessage(ownedNFTs.length ? '' : 'No NFTs minted yet.');
    } catch (error) {
      console.error("Error loading NFTs:", error);
      setMessage('Failed to load NFTs.');
    }

    setLoading(false);
  };

  const setNFTForSale = async (tokenId, price) => {
    try {
      await contract.methods.setForSale(tokenId, Web3.utils.toWei(price, 'ether')).send({ from: account });
      alert("NFT set for sale successfully!");
      loadNFTs();
    } catch (error) {
      console.error("Error setting NFT for sale:", error);
    }
  };

  useEffect(() => {
    loadNFTs();
  }, [account]);

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
              <p>Price: {nft.price} ETH</p>
              {nft.isForSale ? (
                <button onClick={() => alert("NFT already listed for sale!")}>Listed for Sale</button>
              ) : (
                <button onClick={() => setNFTForSale(nft.tokenId, prompt("Enter sale price in ETH"))}>Set for Sale</button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyNFTs;
