import React, { useEffect, useState } from 'react';
import Web3 from 'web3';
import nftContractABI from './nftContractABI.json';

function Marketplace({ web3, account }) {
  const [nftsForSale, setNftsForSale] = useState([]);
  const [loading, setLoading] = useState(true);
  const contractAddress = "0xec6334c3ab02e41daa0d4993fa2e66526be0a227"; 

  // Load NFTs listed for sale
  const loadNFTsForSale = async () => {
    if (!web3 || !account) {
      setLoading(false);
      return;
    }

    try {
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
            price: Web3.utils.fromWei(metadata.price, 'ether'),
            imageUrl: tokenURI,
            owner: metadata.owner
          });
        }
      }
      setNftsForSale(forSale);
      setLoading(false);
    } catch (error) {
      console.error("Error loading NFTs for sale:", error);
      setLoading(false);
    }
  };

  // Buy NFT function
  const buyNFT = async (tokenId, price, owner) => {
    if (!web3 || !account) {
      alert("Please connect your wallet.");
      return;
    }

    if (owner.toLowerCase() === account.toLowerCase()) {
      alert("You cannot buy your own NFT.");
      return;
    }

    try {
      const contract = new web3.eth.Contract(nftContractABI, contractAddress);
      await contract.methods.buyNFT(tokenId).send({
        from: account,
        value: Web3.utils.toWei(price, 'ether'),
      });
      alert("NFT purchased successfully!");
      loadNFTsForSale();
    } catch (error) {
      console.error("Error purchasing NFT:", error);
    }
  };

  useEffect(() => {
    if (account) {
      setLoading(true);
      loadNFTsForSale();
    } else {
      // Clear NFTs when account is disconnected
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
        <p>Loading, please wait...</p>
      ) : nftsForSale.length > 0 ? (
        <div className="nft-container">
          {nftsForSale.map((nft) => (
            <div className="nft-card" key={nft.tokenId}>
              <img src={nft.imageUrl} alt={nft.name} />
              <h3>{nft.name}</h3>
              <p>{nft.description}</p>
              <p>Price: {nft.price} ETH</p>
              <button onClick={() => buyNFT(nft.tokenId, nft.price, nft.owner)}>Buy</button>
            </div>
          ))}
        </div>
      ) : (
        <p>No NFTs available for sale.</p>
      )}
    </div>
  );
}

export default Marketplace;
