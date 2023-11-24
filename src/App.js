import React, { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import { Link } from "react-router-dom";

import "./App.css";
import Marketplace from "./components/Marketplace";
import Profile from "./components/Profile";
import SellNFT from "./components/SellNFT";
import NFTPage from "./components/NFTpage";

function App() {
  const [isMetaMaskInstalled, setIsMetaMaskInstalled] = useState(false);

  useEffect(() => {
    // Check if MetaMask is installed
    if (window.ethereum) {
      setIsMetaMaskInstalled(true);
    }
  }, []);

  return (
    <>
      {isMetaMaskInstalled ? (
        // MetaMask is installed, render the app
        <div className="container">
          <Routes>
            <Route path="/" element={<Marketplace />} />
            <Route path="/nftPage/:tokenId" element={<NFTPage />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/sellNFT" element={<SellNFT />} />
          </Routes>
        </div>
      ) : (
        // MetaMask is not installed, render a download banner
        <div className="metamask-banner">
          <p>
            MetaMask is not installed. Please click{" "}
            <a
              href="https://metamask.io/download.html"
              target="_blank"
              rel="noopener noreferrer"
            >
              here
            </a>{" "}
            to download metamask to use this application.
          </p>
        </div>
      )}
    </>
  );
}

export default App;
