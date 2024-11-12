import React, { useState } from 'react';
import Web3 from 'web3';
import axios from 'axios';
import './MintNFT.css';
import nftContractABI from './nftContractABI.json';

const PINATA_API_KEY = 'b17cd3c4251fc21e47ed';
const PINATA_SECRET_KEY = '692b522e060586e1c025d5c209e3d2cc503a00f34b1e0b2f1e6eb7386a069d13';
const PINATA_API_URL = 'https://api.pinata.cloud/pinning/pinFileToIPFS';

function MintNFT({ account, web3 }) {
  const [minting, setMinting] = useState(false);
  const [message, setMessage] = useState('');
  const [nftName, setNftName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState(null);
  const [imageURL, setImageURL] = useState('');

  // Only create the contract if web3 is defined
  const contractAddress = '0x16c69df921b83bf0abe15349869bed46ecfb66ee'; // Replace with your opBNB contract address
  const contract = web3 ? new web3.eth.Contract(nftContractABI, contractAddress) : null;

  const uploadToPinata = async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const res = await axios.post(PINATA_API_URL, formData, {
        maxBodyLength: Infinity,
        headers: {
          'Content-Type': 'multipart/form-data',
          pinata_api_key: PINATA_API_KEY,
          pinata_secret_api_key: PINATA_SECRET_KEY
        }
      });
      
      return res.data.IpfsHash;
    } catch (error) {
      console.error("Error uploading to Pinata:", error);
      throw new Error("Image upload failed.");
    }
  };

  const mintNFT = async () => {
    if (!account) {
      alert("Please connect your wallet.");
      return;
    }

    if (!web3 || !contract || !nftName || !description || !price || !image) {
      alert("Please fill in all fields and upload an image.");
      return;
    }

    if (window.ethereum.networkVersion !== '5611') { // Check for opBNB Testnet
      alert('Please connect to the opBNB Testnet to mint your NFT.');
      return;
    }

    if (price <= 0) {
      alert('Please set a valid price greater than 0.');
      return;
    }

    setMinting(true);
    setMessage('Uploading image to Pinata IPFS...');

    try {
      const imageIpfsHash = await uploadToPinata(image);
      const imageUrl = `https://gateway.pinata.cloud/ipfs/${imageIpfsHash}`;
      setImageURL(imageUrl);
      setMessage('Minting NFT...');

      console.log('NFT Details:', { nftName, description, price, account, image });

      const receipt = await contract.methods
        .mint(account, nftName, description, Web3.utils.toWei(price, 'ether'), imageUrl)
        .send({ from: account });

      setMessage('NFT minted successfully!');
      console.log('Transaction receipt:', receipt);

      // Clear form 
      setNftName('');
      setDescription('');
      setPrice('');
      setImage(null);
    } catch (error) {
      console.error('Error minting NFT:', error);
      setMessage(error.code === 4001 ? 'Transaction rejected by user.' : 'Minting failed. Please try again.');
    }

    setMinting(false);
  };

  return (
    <div className="mint-nft-container">
      <h2 className="title">Mint a New NFT</h2>
      <div className="input-container">
        <input
          type="text"
          placeholder="NFT Name"
          value={nftName}
          onChange={(e) => setNftName(e.target.value)}
          className="input-field"
          disabled={minting}
        />
      </div>
      <div className="input-container">
        <textarea
          placeholder="NFT Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="input-field"
          disabled={minting}
        />
      </div>
      <div className="input-container">
        <input
          type="number"
          placeholder="Price (in tBNB)"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="input-field"
          disabled={minting}
        />
      </div>
      <div className="input-container">
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files[0])}
          className="file-input"
          disabled={minting}
        />
      </div>
      <button onClick={mintNFT} disabled={minting} className="mint-button">
        {minting ? 'Minting...' : 'Mint NFT'}
      </button>
      <p className="message">{message}</p>
      {imageURL && (
        <div className="image-preview">
          <h3>Your NFT Image:</h3>
          <img src={imageURL} alt="NFT" className="nft-image" />
        </div>
      )}
    </div>
  );
}

export default MintNFT;
