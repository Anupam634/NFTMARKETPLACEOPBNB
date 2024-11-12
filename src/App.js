import React, { useState } from 'react';
import Web3 from 'web3';
import MintNFT from './MintNFT';
import MyNFTs from './MyNFT';
import Marketplace from './Marketplace';
import './App.css';


const OPNBN_CHAIN_ID = '0x15eb'; 
const OPNBN_RPC_URL = 'https://opbnb-testnet-rpc.bnbchain.org'; 
const OPNBN_EXPLORER_URL = 'http://testnet.opbnbscan.com'; 

function App() {
  const [account, setAccount] = useState(null);
  const [web3, setWeb3] = useState(null);
  const [activePage, setActivePage] = useState('home');
  const [showDisconnect, setShowDisconnect] = useState(false);

  // Function to connect the wallet
  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const web3Instance = new Web3(window.ethereum);

        // Check if the user is on the opBNB Testnet
        const networkId = await window.ethereum.request({ method: 'eth_chainId' });
        if (networkId !== OPNBN_CHAIN_ID) {
          alert('Please switch to the opBNB Testnet.');

          // Attempt to switch to the opBNB Testnet
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: OPNBN_CHAIN_ID }],
          });
        }

        const accounts = await web3Instance.eth.getAccounts();
        setAccount(accounts[0]);
        setWeb3(web3Instance);
      } catch (error) {
        console.error('Connection failed', error);

        if (error.code === 4902) {
          // If the opBNB Testnet is not added to MetaMask
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: OPNBN_CHAIN_ID,
                chainName: 'opBNB Testnet',
                rpcUrls: [OPNBN_RPC_URL],
                nativeCurrency: {
                  name: 'Test BNB',
                  symbol: 'tBNB',
                  decimals: 18,
                },
                blockExplorerUrls: [OPNBN_EXPLORER_URL],
              },
            ],
          });
        }
      }
    } else {
      alert('MetaMask is not installed');
    }
  };
  
  const disconnectWallet = () => {
    setAccount(null);
    setWeb3(null);
  };

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
          <button onClick={() => setActivePage('home')}>Home</button>
          <button onClick={() => setActivePage('mint')}>Mint NFT</button>
          <button onClick={() => setActivePage('myNFTs')}>My NFTs</button>
          <button onClick={() => setActivePage('marketplace')}>Marketplace</button>
        </div>

        <div
          className="account-info"
          onMouseEnter={() => setShowDisconnect(true)}
          onMouseLeave={() => setShowDisconnect(false)}
        >
          {!account ? (
            <button onClick={connectWallet} className="connect-btn">
              Connect MetaMask
            </button>
          ) : (
            <>
              <p>Connected: {formatAccountAddress(account)}</p>
              {showDisconnect && (
                <div className="disconnect-popup">
                  <button onClick={disconnectWallet} className="disconnect-btn">
                    Disconnect
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </nav>

      <div className="app-container">
        {activePage === 'home' && (
          <p>Welcome to the NFT Minting Website. Use the options above to navigate.</p>
        )}
        {activePage === 'mint' && <MintNFT web3={web3} account={account} />}
        {activePage === 'myNFTs' &&
          (account ? (
            <MyNFTs web3={web3} account={account} />
          ) : (
            <p>Please connect your wallet to view your NFTs.</p>
          ))}
        {activePage === 'marketplace' && <Marketplace web3={web3} account={account} />}
      </div>
    </div>
  );
}

export default App;
