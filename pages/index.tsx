import type { NextPage } from "next";
import Head from 'next/head'

import { useActiveWeb3React } from "@/hooks/useActiveWeb3React";
import { useEffect, useState } from "react";
import { UnsupportedChainIdError, useWeb3React } from "@web3-react/core";
import { injected } from "@/config/constants/wallets";
import { connectorLocalStorageKey } from "@/config/connectors/index";

import { ethers } from 'ethers';
import ReactJson from 'react-json-view'
import { Button, Card, Col, Input, InputNumber, Layout, message, Modal, Row, Spin } from 'antd';

import BDGToken from '@/contract/BuildDog.json';

export default function Home() {
  // const {
  //   REACT_APP_CONTARCT_ADDRESS,
  //   REACT_APP_DEPLOYER,
  //   REACT_APP_DEPLOYER_PRIVATE_KEY,
  //   REACT_APP_RECIVER,
  //   REACT_APP_RECIVER_PRIVATE_KEY
  // } = process.env

  //georil contract
  //const REACT_APP_CONTARCT_ADDRESS = '0x7316CeAF80BE6DE69FB9637D648C7EAf8FC8000F'

  //test contract Used please replace youself contract address
  const REACT_APP_CONTARCT_ADDRESS = '0x9C308fCdb264a45Fc11955B53E2720124896596e'
  

  
  // const { active } = useWeb3React();

  // active auth status
  // account address
  // chainId InjectID
  // connector
  // activate function
  // deactivate function
  // library
  const { active, account, chainId, error, connector, activate, deactivate, library } = useActiveWeb3React();

  // auto link
  // useEffect(() => {
  //     activate(injected, undefined, true).catch((error) => {
  //         activate(injected);
  //     });
  // }, []);

  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState<any>({});

  const [provider, setProvider] = useState<any>(null);

  const [contractWithSigner, setContractWithSigner] = useState<any>(null);

  const [name, setName] = useState('');
  const [symbol, setSymbol] = useState('');
  const [decimals, setDecimals] = useState('');

  const [supply, setSupply] = useState('');
  const [ownerBlance, setOwnerBlance] = useState('0');
  const [ownerWalletBlance, setOwnerWalletBlance] = useState('0');

  
  const [reciver, setReciver] = useState('0x0f39D017953E64382b34442064F9Fc585c521F28');
  const [reciverBlance, setReciverBlance] = useState('0');
  const [reciverWalletBlance, setReciverWalletBlance] = useState('0');

  const [number, setNumber] = useState<Number>(1);

  const [txs, setTxs] = useState<any>({})

  // let provider = new ethers.providers.JsonRpcProvider("http://localhost:7545");
  // let provider = new ethers.providers.Web3Provider(window.ethereum);
  

  useEffect(()=>{
    setProvider(new ethers.providers.Web3Provider(window.ethereum));
  }, [])

  // let singer = provider.getSigner();

  // let contractWithSigner = new ethers.Contract(REACT_APP_CONTARCT_ADDRESS!, BDGToken.abi, singer);

  // let contractRW = new ethers.Contract(REACT_APP_CONTARCT_ADDRESS!, FoolToken.abi, wallet) // Read-Write

  // let contractWithSigner = contract.connect(wallet);

  // contract name
  async function getName() {
    setName(await contractWithSigner.name());
  }

  // contract symbol
  async function getSymbol() {
    setSymbol(await contractWithSigner.symbol());
  }

  // contract Decimals
  async function getDecimals() {
    setDecimals(await contractWithSigner.decimals());
  }

  // contract total supply
  async function getSupply() {
    setSupply(await contractWithSigner.totalSupply().then((balance: any) => ethers.utils.formatEther(balance)))
  }

  // owner balance
  async function getOwnerBalance() {
    setOwnerBlance(await contractWithSigner.balanceOf(account).then((balance: any) => ethers.utils.formatEther(balance)))
  }

  // owner eth balance
  async function getOwnerWalletBalance() {
    setOwnerWalletBlance(await provider.getBalance(String(account)).then((balance: any) => ethers.utils.formatEther(balance)))
  }

  // reciver balance
  async function getReciverBalance() {
    setReciverBlance(await contractWithSigner.balanceOf(reciver).then((balance: any) => ethers.utils.formatEther(balance)))
  }

  // reciver eth balance
  async function getReceiverWalletBalance() {
    setReciverWalletBlance(await provider.getBalance(reciver).then((balance: any) => ethers.utils.formatEther(balance)))
  }

  // 查询数据
  const refetch = () => {
    account && getName()
    account && getSymbol()
    account && getDecimals()

    account && getSupply()
    account && getOwnerBalance()
    account && getOwnerWalletBalance()

    reciver && getReciverBalance()
    reciver &&  getReceiverWalletBalance()
  }

  // transfer
  const sendToken = async () => {
    if(!contractWithSigner){
      message.error('please connect wallet')
      return
    }
    setLoading(true);
    let numberOfTokens = ethers.utils.parseUnits(number.toString(), 18);
    const transaction = await contractWithSigner.transfer(reciver, numberOfTokens);
    await transaction.wait();
    console.log(`${number} Tokens successfully sent to ${reciver}`);
    setLoading(false)
    refetch()
  }

  // create cion
  const mintToken = async () =>{
    if(!contractWithSigner){
      message.error('please connect wallet')
      return
    }
    setLoading(true);
    let numberOfTokens = ethers.utils.parseUnits(number.toString(), 18);
    const transaction = await contractWithSigner.mint(account, numberOfTokens);
    await transaction.wait();
    setLoading(false)
    refetch()
  }

  // transcation callback
  const onContractTransfer = (from: any, to: any, value: any, event: any) => {
    if (!txs[event.transactionHash]) {
      console.log(event.transactionHash, ethers.utils.formatUnits(value), new Date().getTime());
      setTxs({
        ...txs, [event.transactionHash]: {
          from,
          to,
          value: ethers.utils.formatUnits(value),
          transactionHash: event.transactionHash
        }
      })
    }
  }


  // hash detail
  const showTxDetail = async ({ name, value }: any) => {
    if (name === "transactionHash") {
      const tx = await provider.getTransaction(value)
      setModal({
        hash: value,
        data: tx
      })
    }
  }

  const connectWellet = async () =>{
    activate(injected, undefined, true).then((res)=>{
      console.log(res)
      let signer = provider.getSigner();
      let contract = new ethers.Contract(REACT_APP_CONTARCT_ADDRESS!, BDGToken.abi, signer);
      console.log(contract)
      setContractWithSigner(contract);
    }).catch((error) => {
        activate(injected);
    });
  }

  const disconnectWellet = async () =>{
    deactivate()
  }

  useEffect(() => {
    contractWithSigner && contractWithSigner.on('Transfer', onContractTransfer)
    return () => {
      contractWithSigner && contractWithSigner.removeListener('Transfer', () => {
        console.log('contractWithSigner removeListener Transfer ');
      })
    }
  }, [contractWithSigner])

  useEffect(() => {
    account && refetch()
  },[account])

  return (
    <div>
      <Head>
        <title>Web3 DApp</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
      <Spin spinning={loading}>
      <Layout className='app'>
        <div>
          <div className='header'>
            <h1>{`ERC20 Infomation（Name：${name} Symbol：${symbol} Decimals：${decimals}）`}</h1>
            Contract address：
            <span className='address'>{REACT_APP_CONTARCT_ADDRESS}</span>
            <span className='address'>Total supply：</span>
            <span className='address'>{supply}</span>            
            
          </div>
          <Row className='content'>

            {/* Owner */}
            <Col span={12} className="left">
              <Card title='Creater'>
                <div>
                  connect account：
                  <span className='address'>{account}</span>
                  {
                    account!==null ? <Button onClick={disconnectWellet}>Disconnect Wellet</Button>:<Button onClick={connectWellet}>Connect Wellet</Button>
                  }
                </div>
                <div>
                  ETH balance：
                  <span className='address'>{ownerWalletBlance}</span>
                </div>
                <div>
                  {symbol} balance：
                  <span className='address'>{ownerBlance}</span>
                </div>


                <div className='operate'>
                  <div style={{ marginTop: 16 }}>
                    <Input prefix="receiver address：" value={reciver} className="input" onChange={e => setReciver(e.target.value)} />
                  </div>
                  <div style={{ marginTop: 16 }}>
                    <InputNumber prefix="transfer amount：" value={number} min={0} className="input" onChange={v => setNumber(Number(v))} style={{width: '100%'}} />
                  </div>

                  <Button style={{ marginTop: 16 }} onClick={sendToken}>Transfer Token</Button>
                  <Button style={{ marginTop: 16, marginLeft: 20 }} onClick={mintToken}>Mint Token</Button>
                  <Button style={{ marginTop: 16, marginLeft: 20 }} onClick={()=>{}}>Withdraw Token</Button>
                </div>
              </Card>

            </Col>

            {/* Reciver */}
            <Col span={12} className="right">
              <Card title='receiver'>
                <div>
                  receiver address：
                  <span className='address'>{reciver}</span>
                </div>
                <div>
                  ETH balance：
                  <span className='address'>{reciverWalletBlance}</span>
                </div>
                <div>
                {symbol} balance：
                  <span className='address'>{reciverBlance}</span>
                </div>
              </Card>

            </Col>
          </Row>

          <Card className='tx' title="trade detail" style={{ overflowY: "auto" }}>
            {/* <ReactJson displayDataTypes={false} name={false} src={Object.values(txs)} onSelect={showTxDetail} /> */}
          </Card>

          {/* <Modal
            centered
            destroyOnClose
            width={1000}
            visible={modal && modal.hash}
            title={`交易信息：${modal?.hash}`}
            onOk={() => setModal({})}
            onCancel={() => setModal({})}
          >
            <ReactJson
              style={{ height: 800, overflowY: 'auto' }}
              theme="chalk"
              src={modal && modal.data}
              collapseStringsAfterLength={100}
              onSelect={showTxDetail}
              name={false}
              displayDataTypes={false} />
          </Modal> */}
        </div>
      </Layout>
    </Spin>
      </main>

      
    </div>
  )
}
