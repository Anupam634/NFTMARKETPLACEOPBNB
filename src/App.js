import React, { useState } from 'react';
import Web3 from 'web3';
import MintNFT from './MintNFT';
import MyNFTs from './MyNFT';
import Marketplace from './Marketplace'; 
import './App.css';

const SEPOLIA_CHAIN_ID = '0xaa36a7'; 
function App() {
  const [account, setAccount] = useState(null);
  const [web3, setWeb3] = useState(null);
  const [activePage, setActivePage] = useState("home");
  const [showDisconnect, setShowDisconnect] = useState(false);

  // Function to connect the wallet
  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const web3Instance = new Web3(window.ethereum);

        // Check Sepolia network
        const networkId = await window.ethereum.request({ method: 'eth_chainId' });
        if (networkId !== SEPOLIA_CHAIN_ID) {
          alert("Please switch to the Sepolia testnet.");
          
          // automatic switch sepolia
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: SEPOLIA_CHAIN_ID }],
          });
        }

        const accounts = await web3Instance.eth.getAccounts();
        setAccount(accounts[0]);
        setWeb3(web3Instance);
      } catch (error) {
        console.error("Connection failed", error);
        if (error.code === 4902) {
          // network issue
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: SEPOLIA_CHAIN_ID,
              chainName: 'Sepolia Testnet',
              rpcUrls: ['https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID'],
              nativeCurrency: {
                name: 'SepoliaETH',
                symbol: 'ETH',
                decimals: 18,
              },
            }],
          });
        }
      }
    } else {
      alert("MetaMask is not installed");
    }
  };

  // Function to disconnect the wallet
  const disconnectWallet = () => {
    setAccount(null);
    setWeb3(null);
  };

  // Format the account address
  const formatAccountAddress = (address) => {
    if (address) {
      return `${address.slice(0, 5)}...${address.slice(-3)}`;
    }
    return '';
  };

  return (
    <div>
      <nav>
        <div className="navbar-left">
          <span className="brand-name">IGNITUS</span>
        </div>
        <div className="navbar-content">
          <button onClick={() => setActivePage("home")}>Home</button>
          <button onClick={() => setActivePage("mint")}>Mint NFT</button>
          <button onClick={() => setActivePage("myNFTs")}>My NFTs</button>
          <button onClick={() => setActivePage("marketplace")}>Marketplace</button> {/* New button for marketplace */}
        </div>

        <div 
          className="account-info" 
          onMouseEnter={() => setShowDisconnect(true)} 
          onMouseLeave={() => setShowDisconnect(false)}
        >
          {!account ? (
            <button onClick={connectWallet} className="connect-btn">Connect MetaMask</button>
          ) : (
            <>
              <p>Connected: {formatAccountAddress(account)}</p>
              {showDisconnect && (
                <div className="disconnect-popup">
                  <button onClick={disconnectWallet} className="disconnect-btn">Disconnect</button>
                </div>
              )}
            </>
          )}
        </div>
      </nav>

      <div className="app-container">
        
        {activePage === "home" && <p>Welcome to the NFT Minting Website. Use the options above to navigate.</p>}
        {activePage === "mint" && <MintNFT web3={web3} account={account} />}
        {activePage === "myNFTs" && 
          (account ? <MyNFTs web3={web3} account={account} /> : <p>Please connect your wallet to view your NFTs.</p>)
        }
        {activePage === "marketplace" && <Marketplace web3={web3} account={account} />} {/* New Marketplace component */}
      </div>
    </div>
  );
}

export default App;
