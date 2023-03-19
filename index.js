import { ethers } from "./ethers-5.2.esm.min.js";
import { abi, contractAddress } from "./constants.js"

async function connect() {
    if (typeof window.ethereum !== "undefined") {
        // Connects to the browser.
        await window.ethereum.request({ method: "eth_requestAccounts" });
        console.log("Connected!");
        document.getElementById("connectButton").innerHTML = "Connected";
    }
    else {
        document.getElementById("connectButton").innerHTML = "Please install Metamask!";
    }
}

async function fund() {
    console.log(document.getElementById("ethAmount"));
    const ethAmount = document.getElementById("ethAmount").value;
    console.log(`Funding with ${ethAmount} ethers...`);
    if (typeof window.ethereum !== "undefined") {
        /**
         * We need the following things to fund the contract:
         * 1) provider/connection to blockchain 
         * 2) sender/ wallet / someone with gas
         * 3) ABI and Address of contracct that we want to interact with 
        */
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        // ABI and addrress may change so keep them in a different file.
        const contract = new ethers.Contract(contractAddress, abi, signer);
        try{
            const txnResponse = await contract.fund({value:ethers.utils.parseEther(ethAmount)});
            /**
             * You need to run ==> yarn hardhat node
             * Then you need to connect metamask to localhost
             * Then add an account from your localhost to metamask
             */
            await listenForTxnMine(txnResponse,provider);
        }
        catch(err){
            console.log(err);
        }
    }
    else {
        document.getElementById("connectButton").innerHTML = "Please install Metamask!";
    }
}

async function getBalance() {
    if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const balance = await provider.getBalance(contractAddress);
        console.log(ethers.utils.formatEther(balance));
    }
}

async function withdraw() {
    if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(contractAddress,abi,signer);
        try{
            const txnResponse = await contract.withdraw();
            await listenForTxnMine(txnResponse,provider);
        }
        catch(err){
            console.log(err);
        }
    }
}

function listenForTxnMine(txnResponse,provider){
    console.log(`Mining ${txnResponse.hash}...`);
    /**
    * Once the provider sees this txnHash get mined, it will trigger the following event. and pass thee reciept.
    */
    return new Promise((resolve,reject)=>{
        provider.once(txnResponse.hash,(txnReciept)=>{
            console.log(`Completed with ${txnReciept.confirmations} confirmations`);
            resolve();
        });
    })
}

const connectButton = document.getElementById('connectButton');
const fundButton = document.getElementById('fundButton');
const withdrawButton = document.getElementById('withdrawButton');
const getBalanceBtn = document.getElementById('getBalance');
connectButton.onclick = connect;
withdrawButton.onclick = withdraw;
fundButton.onclick = fund;
getBalanceBtn.onclick = getBalance;
