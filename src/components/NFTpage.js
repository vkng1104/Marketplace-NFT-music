import Navbar from "./Navbar";
import { useParams } from "react-router-dom";
import MarketplaceJSON from "../Marketplace.json";
import axios from "axios";
import { useState, useEffect } from "react";
import { ethers, utils as etherUtils } from "ethers";

export default function NFTPage(props) {
  const [data, updateData] = useState({});
  const [dataFetched, updateDataFetched] = useState(false);
  const [message, updateMessage] = useState("");
  const [currAddress, updateCurrAddress] = useState("0x");
  const [pageFound, setPageFound] = useState(true);
  const [loading, setLoading] = useState(true);

  async function getNFTData(tokenId) {
    try {
      // After adding your Hardhat network to your metamask, this code will get providers and signers
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const addr = await signer.getAddress();
      // Pull the deployed contract instance
      let contract = new ethers.Contract(
        MarketplaceJSON.address,
        MarketplaceJSON.abi,
        signer
      );
      // Create an NFT Token
      const tokenURI = await contract.tokenURI(tokenId);
      const listedToken = await contract.getListedTokenForId(tokenId);
      let meta = await axios.get(tokenURI);
      meta = meta.data;
      console.log(listedToken);

      let item = {
        price: meta.price,
        tokenId: tokenId,
        seller: listedToken.seller,
        available: listedToken.currentlyListed,
        name: meta.name,
        description: meta.description,
        image: meta.image,
        beat: meta.beat,
      };
      console.log(item);
      updateData(item);
      updateDataFetched(true);
      setPageFound(true);
      setLoading(false);

      console.log("address", addr);
      updateCurrAddress(addr);
    } catch (err) {
      // Handle other errors
      console.error("Error fetching NFT data:", err);
      setPageFound(false);
      setLoading(false);
    }
  }

  async function buyNFT(tokenId) {
    try {
      //After adding your Hardhat network to your metamask, this code will get providers and signers
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      //Pull the deployed contract instance
      let contract = new ethers.Contract(
        MarketplaceJSON.address,
        MarketplaceJSON.abi,
        signer
      );
      const salePrice = etherUtils.parseUnits(data.price, "ether");
      updateMessage("Buying the NFT... Please Wait (Upto 5 mins)");
      //run the executeSale function
      let transaction = await contract.executeSale(tokenId, {
        value: salePrice,
      });
      await transaction.wait();

      alert("You successfully bought the NFT!");
      updateMessage("");
      window.location.replace("/profile");
    } catch (e) {
      alert("Upload Error" + e);
    }
  }

  const params = useParams();
  const tokenId = params.tokenId;
  if (!dataFetched) getNFTData(tokenId);

  const [isMounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (loading) {
    // Loading state while data is being fetched
    return (
      <div style={{ minHeight: "100vh" }}>
        <Navbar />
        <div className="mt-10 font-extrabold w-full text-center text-white">
          Loading...
        </div>
      </div>
    );
  }

  if (!isMounted || !pageFound) {
    // Component not mounted or page not found
    return (
      <div style={{ minHeight: "100vh" }}>
        <Navbar />
        <div className="mt-10 font-extrabold w-full text-center">
          Page Not Found
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh" }}>
      <Navbar />
      <div className="flex ml-20 mt-20">
        <img src={data.image} alt="" className="w-2/5" />

        <div className="text-xl ml-20 space-y-8 text-white shadow-2xl rounded-lg border-2 p-5">
          <div>Name: {data.name}</div>
          <div>Description: {data.description}</div>
          <div>
            Price: <span className="">{data.price + " ETH"}</span>
          </div>
          <div>
            Seller: <span className="text-sm">{data.seller}</span>
          </div>

          {/* Audio Player */}
          <audio controls autoplay style={{ width: "100%" }}>
            <source src={data.beat} type="audio/mpeg" />
            <source src={data.beat} type="audio/ogg" />
            <source src={data.beat} type="audio/wav" />
            Your browser does not support the audio element.
          </audio>

          {/* Buying Button */}
          <div>
            {console.log(data.owner)}
            {currAddress === data.owner || currAddress === data.seller ? (
              <div className="text-emerald-700">
                You are the owner of this NFT
              </div>
            ) : data.available ? (
              <>
                <button
                  className="enableEthereumButton bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-sm"
                  onClick={() => buyNFT(tokenId)}
                >
                  Buy this NFT
                </button>
                <div className="text-green text-center mt-3">{message}</div>
              </>
            ) : (
              <div className="text-emerald-700">This NFT has been sold</div>
            )}
          </div>
        </div>
      </div>
      )
    </div>
  );
}
