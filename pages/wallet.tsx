import Head from 'next/head'
import Web3 from "web3"

import { useActiveWeb3React } from "@/hooks/useActiveWeb3React";
import { useEffect, useState } from "react";

import { injected } from "@/config/constants/wallets";

import { Button, Card, Col, Input, InputNumber, Layout, message, Row, Spin } from 'antd';

import CornucopiaContract from '@/contract/CornucopiaContract.json';


export default function Wallet() {

  // goerl '0x397B7d03Fc752F6C72400c0Fa727897CabcdbC17'
  // ganache 0x9C308fCdb264a45Fc11955B53E2720124896596e
  const REACT_APP_CONTARCT_ADDRESS = '0x79995Ce44193b9A4Ad1c39dfd8633E2b9436729f'
  
  // const { active } = useWeb3React();
1
  // active auth status
  // account address
  // chainId InjectID
  // connector
  // activate function
  // deactivate function
  // library
  const { active, account, chainId, error, connector, activate, deactivate, library } = useActiveWeb3React()

  const [loading, setLoading] = useState(false);

  const [web3, setWeb3] = useState<Web3>();

  const [contractWithSigner, setContractWithSigner] = useState<any>(null);

  const [contractWelletBalance, setContractWalletBalance] = useState<any>(0);

  const [ownerWalletBlance, setOwnerWalletBalance] = useState<any>(0);

  // owner eth balance
  async function getOwnerWalletBalance() {
    setOwnerWalletBalance(await web3?.eth.getBalance(String(account)).then((balance:any) => Web3.utils.fromWei(balance, 'ether')))
  }

  async function getContractWallerBalance(){
    setContractWalletBalance(await web3?.eth.getBalance(String(REACT_APP_CONTARCT_ADDRESS)).then((balance:any) => Web3.utils.fromWei(balance, 'ether')))
  }


  // 查询数据
  const refetch = () => {
    getContractWallerBalance()
    account && getOwnerWalletBalance()
  }

  // transfer
  const transferToken = async () => {
    console.log(contractWithSigner)
    if(!contractWithSigner){
      message.error('please connect wallet')
      return
    }
    
    const gasPrice = await web3?.eth.getGasPrice()
    let balance = Web3.utils.toWei(ownerWalletBlance)
    console.log(gasPrice, balance)
    let amount = Number(balance) - Number(gasPrice)
    web3?.eth.estimateGas({
      // from: String(account),
      // to: REACT_APP_CONTARCT_ADDRESS,
      value: amount,
      gasPrice: gasPrice,
    }).then((gas:any) => {
      console.log('estimateGas', gas)
          amount = amount - Number(gasPrice) * Number(gas)
          web3?.eth.getTransactionCount(String(account)).then((nonce:any)=>{
            console.log('nonce:', nonce)
            // contractWithSigner.methods.test().send({
            //     from: String(account),
            //     value: amount,
            //     gas: gas,
            //     gasPrice: gasPrice,
            //     nonce:nonce
            //   }).then((receipt:any)=>{
            //       console.log(receipt)
            //       refetch()
            //   }).catch((err:any)=>{
            //     console.log(err)
            //   });
            web3?.eth.sendTransaction({
              from: String(account),
              to: REACT_APP_CONTARCT_ADDRESS,
              value: amount,
              gas: gas,
              gasPrice: gasPrice,
              nonce:nonce
            }).then((receipt)=>{
                console.log(receipt)
                refetch()
            }).catch((err)=>{
              console.log(err)
            });
          })

    }).catch((err:any)=>{
      console.log(err)
    })

    
    // console.log(amount)

    
    setLoading(false)
    
  }

  const withdrawToken = async () =>{
    console.log(contractWithSigner.methods)
    web3?.eth.getTransactionCount(String(account)).then((nonce:any)=>{
      console.log(nonce)
      contractWithSigner.methods.withdraw().send({from: account, nonce: nonce}).then((receipt:any)=>{
        console.log('receipt:', receipt)
      }).catch((err:any)=>{
        console.log(err)
      })
    })
  }

  const getContractOwner = async () =>{
    contractWithSigner.methods.getOwner().call({from: account}).then((receipt:any)=>{
      console.log('receipt:', receipt)
    }).catch((err:any)=>{
      console.log(err)
    })
  }

  // transcation callback
  // const onContractTransfer = (from: any, to: any, value: any, event: any) => {
  //   if (!txs[event.transactionHash]) {
  //     console.log(event.transactionHash, ethers.utils.formatUnits(value), new Date().getTime());
  //     setTxs({
  //       ...txs, [event.transactionHash]: {
  //         from,
  //         to,
  //         value: ethers.utils.formatUnits(value),
  //         transactionHash: event.transactionHash
  //       }
  //     })
  //   }
  // }

  const connectWellet = async () =>{
    console.log(injected)
    activate(injected, undefined, true).then((res)=>{
      
    }).catch((error) => {
        activate(injected);
    });
  }

  const disconnectWellet = async () =>{
    deactivate()
  }

  useEffect(()=>{
      if(!web3) return    
      let web3Contract = new web3.eth.Contract(CornucopiaContract.abi, REACT_APP_CONTARCT_ADDRESS)
      console.log(web3Contract.options)
      console.log('web3Contract:' + web3Contract)
      setContractWithSigner(web3Contract)
  },[web3])

  useEffect(()=>{
    setWeb3(new Web3(window.ethereum))
  }, [])


  useEffect(() => {

    return () => {
      // contractWithSigner && contractWithSigner.removeListener('Transfer', () => {
      //   console.log('contractWithSigner removeListener Transfer ');
      // })
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
            <h1>Contract Infomation({library?.provider.url})</h1>
            Contract address：
            <span className='address'>{REACT_APP_CONTARCT_ADDRESS}({contractWelletBalance})</span>        
            
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


                <div className='operate'>
                  
                  <div style={{ marginTop: 16 }}>
                    <InputNumber prefix="transfer amount：" value={ownerWalletBlance} min={0} className="input" style={{width: '100%'}} />
                  </div>

                  <Button style={{ marginTop: 16 }} onClick={transferToken}>Transfer Token</Button>
                  <Button style={{ marginTop: 16, marginLeft: 20 }} onClick={withdrawToken}>Withdraw Token</Button>
                  <Button style={{ marginTop: 16, marginLeft: 20 }} onClick={getContractOwner}>getOwner</Button>
                </div>
              </Card>

            </Col>

            {/* Reciver */}
            <Col span={12} className="right">
              <Card title='receiver'>
                
              </Card>
            </Col>
          </Row>
        </div>
      </Layout>
    </Spin>
      </main>

      
    </div>
  )
}
