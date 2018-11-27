import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import web3 from './web3';
import Storehash from './Storehash';
import ipfs from './Ipfs';

class App extends Component {

  constructor(){
    super();
    this.state = {
      ipfsHash:null,
      buffer:'',
      ethAddress:'',
      transactionHash:'',
      txReceipt: ''
    }
  }

  

  //Take file input from user
  captureFile = (event)=>{
    event.stopPropagation()
    event.preventDefault();
    const file = event.target.files[0];
    let reader = new window.FileReader();
    reader.readAsArrayBuffer(file);
    reader.onloadend = () => this.convertToBuffer(reader);
    
  };

  //Convert the file to buffer to store on IPFS
  convertToBuffer = async(reader)=>{
    const buffer = await Buffer.from(reader.result);
    this.setState({buffer});
  }

  onClick = async ()=>{
    try {
      this.setState({blockNumber: "waiting..."});
      this.setState({gasUsed: "waiting..."});
      console.log("tx hash", this.state.transactionHash);
      await web3.eth.getTransactionReceipt(this.state.transactionHash, (err, txReceipt)=>{
        console.log(err, txReceipt);
        this.setState({txReceipt});
      });
    }catch(error){
      console.log(error);
    }
  };

  onSubmit = async (event)=> {
    event.preventDefault();
    const accounts = await web3.eth.getAccounts();
    const ethAddress = await Storehash.options.address;
    this.setState({ethAddress});
    await ipfs.add(this.state.buffer, (err, ipfsHash)=>{
      console.log(err, ipfsHash);
      this.setState({ipfsHash: ipfsHash[0].hash})
      Storehash.methods.setHash(this.state.ipfsHash).send({
        from: accounts[0]
      }, (error, transactionHash)=>{
        console.log(transactionHash);
        this.setState({transactionHash});
      })
    });


  }



  render() {
    return (
      <div className="App">
        <header className="App-header">
          <h1>Ethereum and IPFS using Infura</h1>
        </header>
        <hr />
        <div>
          <h3>Choose file to send to IPFS</h3>
          <form onSubmit={this.onSubmit}>
            <input type="file" onChange={this.captureFile} />
            <button type="submit">Send it</button>
          </form>
          <hr/>
          <button onClick={this.onClick}>Get Transaction Receipt </button>
          <hr/>
          <table bordered="true" responsive="true">
            <thead>
              <tr>
                <th>Tx Receipt Category</th>
                <th></th>
                <th>Values</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>IPFS Hash stored on Ethereum</td>
                <td>:</td>
                <td>{this.state.ipfsHash}</td>
              </tr>
              <tr>
                <td>Ethereum Contract Address</td>
                <td>:</td>
                <td>{this.state.ethAddress}</td>
              </tr>
              <tr>
                <td>Tx #</td>
                <td>:</td>
                <td>{this.state.transactionHash}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  }
}

export default App;
