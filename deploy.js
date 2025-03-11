const { Web3 } = require('web3');
const { tx } = require("@ethereumjs/tx");
const path = require('node:path');
const fs = require('fs-extra');

const web3Instance = new Web3('http://127.0.0.1:8545');

web3Instance.eth.net.isListening()
  .then(() => console.log('is connected'))
  .catch(e => console.log('Wow. Something went wrong: '+ e));

// use an existing account, or make an account
const privateKey =
"0x8f2a55949038a9610f50fb23b5883af3b4ecb3c3bb792cbcefbd1542c692be63";
const account = web3Instance.eth.accounts.privateKeyToAccount(privateKey);
console.log('Account Data ==>', account);
console.log('Account Address ==>',account.address);

// read in the contracts
/*const contractJsonPath = path.resolve(__dirname,'SimpleStorage.json');
const contractJson = JSON.parse(fs.readFileSync(contractJsonPath));
const contractAbi = contractJson.abi;
const contractBinPath = path.resolve(__dirname,'SimpleStorage.bin');
const contractBin = fs.readFileSync(contractBinPath);*/


const contractJsonPath = path.resolve(__dirname,'../','contracts','MainContract.json');
const contractJson = JSON.parse(fs.readFileSync(contractJsonPath));
const contractAbi = contractJson.abi;
const contractBin = contractJson.evm.bytecode.object

//console.log(contractBin)

createAndSign();

// get txnCount for the nonce value
async function createAndSign() {
    const gasPrice = await web3Instance.eth.getGasPrice();
    console.log("Gas Price:", gasPrice);



    const txnCount = await web3Instance.eth.getTransactionCount(account.address);
    console.log('TX Count ==>',txnCount);


    //const contractConstructorInit =
    //    "000000000000000000000000000000000000000000000000000000000000002F";
    const rawTxOptions = {
        nonce: web3Instance.utils.numberToHex(txnCount),
        from: account.address,
        to: null, //public tx
        value: "0x00",
        data: "0x" + contractBin, // contract binary appended with initialization value
        gasPrice: "0x0", //ETH per unit of gas
        gasLimit: "0xFFFFF", //max number of gas units the tx is allowed to use
    };
    /*let rawTxOptions = {
        nonce: web3Instance.utils.numberToHex(txnCount),
        gasPrice: gasPrice,
        gasLimit: 3000000,
        to: "0xa5411deC249187862D1fd3C082BEFA7D22887F5a",
        value: web3Instance.utils.numberToHex(web3Instance.utils.toWei(0.001, "ether")),
        data: '0x'
    };*/



    console.log("Signing the txn")
    const signedTx = await web3Instance.eth.accounts.signTransaction(rawTxOptions, privateKey);
    //console.log('Txn Signed ==> ',signedTx.rawTransaction);

    console.log("Sending transaction...");
    const pTx = await web3Instance.eth.sendSignedTransaction(signedTx.rawTransaction);
    console.log('Transaction sent ==>', pTx.contractAddress);
}