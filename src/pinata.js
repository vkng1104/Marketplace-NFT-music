import axios from "axios";
import FormData from "form-data";
import "dotenv/config";

console.log(process.env);

const key = process.env.PINATA_API_KEY;
const secret = process.env.PINATA_API_SECRET;
// const JWT = "Bearer " + process.env.PINATA_JWT;
const JWT =
  "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiI4N2ZhNmZmNC03YjY4LTQyNWYtYjU0Zi1hYzQ1NDI2ZGY4NGQiLCJlbWFpbCI6ImtoYW5obWVubHkxMjNAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInBpbl9wb2xpY3kiOnsicmVnaW9ucyI6W3siaWQiOiJGUkExIiwiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjF9LHsiaWQiOiJOWUMxIiwiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjF9XSwidmVyc2lvbiI6MX0sIm1mYV9lbmFibGVkIjpmYWxzZSwic3RhdHVzIjoiQUNUSVZFIn0sImF1dGhlbnRpY2F0aW9uVHlwZSI6InNjb3BlZEtleSIsInNjb3BlZEtleUtleSI6ImUwZjUxNzhmYWE3MDEyOGU0NGI4Iiwic2NvcGVkS2V5U2VjcmV0IjoiOTljYmM0MWQ4MmY2ZTYxODk2MzUxMDc2MGYyNTY1ZmFkNmYxNzIzNjg0YzY1Y2Y0YzI4NmU3ZjhlNzU0ZTg3ZSIsImlhdCI6MTcwMDYzOTM3OH0.Q2LHoXKPo2DqBFonXH_ndJmR5rVCECQcd8G3csJK1Qw";

console.log(JWT);
console.log(key);
console.log(secret);

export const uploadJSONToIPFS = async (JSONBody) => {
  const url = `https://api.pinata.cloud/pinning/pinJSONToIPFS`;
  //making axios POST request to Pinata ⬇️
  try {
    const response = await axios.post(url, JSONBody, {
      headers: {
        Authorization: JWT,
      },
    });
    console.log("JSON file uploaded", response.data.IpfsHash);
    return {
      success: true,
      pinataURL: "https://gateway.pinata.cloud/ipfs/" + response.data.IpfsHash,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: error.message,
    };
  }
};

export const uploadFileToIPFS = async (file) => {
  const data = new FormData();
  data.append("file", file);

  const metadata = JSON.stringify({
    name: "file name",
    keyvalues: {
      exampleKey: "exampleValue",
    },
  });
  data.append("pinataMetadata", metadata);

  const pinataOptions = JSON.stringify({
    cidVersion: 0,
  });
  data.append("pinataOptions", pinataOptions);

  const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;
  try {
    const response = await axios.post(url, data, {
      maxBodyLength: "Infinity",
      headers: {
        "Content-Type": `multipart/form-data; boundary=${data._boundary}`,
        Authorization: JWT,
      },
    });

    console.log("image uploaded", response.data.IpfsHash);
    return {
      success: true,
      pinataURL: "https://gateway.pinata.cloud/ipfs/" + response.data.IpfsHash,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: error.message,
    };
  }
};
