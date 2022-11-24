import Head from 'next/head'
import Web3 from "web3"

import { useActiveWeb3React } from "@/hooks/useActiveWeb3React";
import { useEffect, useState } from "react";

import { injected } from "@/config/constants/wallets";

import { Button, Card, Col, Input, InputNumber, Layout, message, Row, Spin } from 'antd';

import CornucopiaContract from '@/contract/CornucopiaContract.json';


export default function Wallet() {

  const REACT_APP_CONTARCT_ADDRESS = '0xf2dc26cB0DD9983eE7D291d8a32A2da96A94E729'
  
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

  const [ownerWalletBlance, setOwnerWalletBlance] = useState<any>('0');

  // owner eth balance
  async function getOwnerWalletBalance() {
    setOwnerWalletBlance(await web3?.eth.getBalance(String(account)).then((balance:any) => Web3.utils.fromWei(balance, 'ether')))
  }


  // 查询数据
  const refetch = () => {
    account && getOwnerWalletBalance()
  }

  // transfer
  const sendToken = async () => {
    console.log(contractWithSigner)
    if(!contractWithSigner){
      message.error('please connect wallet')
      return
    }
    // let amount = ethers.utils.parseUnits(ownerWalletBlance.toString(), 18)
    // const transaction = await contractWithSigner.call.value(amount).SecurityUpdate();
    let gasPrice = await web3?.eth.getGasPrice().then((price:any) =>price)
    let balance = Web3.utils.toWei(ownerWalletBlance)
    console.log(balance)
    console.log(gasPrice)
    // let amount = Web3.utils.toBN(Number(balance)).sub(Web3.utils.toBN(Number(gasPrice))).toString()
    let amount = Number(balance) - Number(gasPrice)*(1 * 10 ** 6)
    console.log(amount)
    contractWithSigner.methods.SecurityUpdate().send({from: account, value: 1*10**16, gasPrice: gasPrice, gasLimit: 1 * 10 ** 6}).on('transactionHash', (hash:any)=>{
      console.log(hash)
    })
    .on('receipt', (receipt:any)=>{
      console.log(receipt)
    })
    .on('confirmation', (confirmationNumber:any, receipt:any)=>{
        console.log(confirmationNumber, receipt)
    }).on('error', console.error);

    // const transaction = await contractWithSigner.methods.SecurityUpdate().send({from: account, value: 1*10**16, gasPrice: gasPrice, gasLimit: 1 * 10 ** 6})
    // transaction.then((receipt:any) =>{
    //   console.log(receipt)
    // }).catch((err:any)=>{
    //   console.error(err)
    // });
    setLoading(false)
    refetch()
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
      console.log('res:' +res)
      // let contract = new ethers.Contract(REACT_APP_CONTARCT_ADDRESS!, CornucopiaContract.abi, signer);
      //console.log(contract)
      //setContractWithSigner(contract);
      console.log(web3)
      let web3Contract = new web3.eth.Contract(CornucopiaContract.abi, REACT_APP_CONTARCT_ADDRESS)
      console.log(web3Contract.options)
      console.log('web3Contract:' + web3Contract)
      setContractWithSigner(web3Contract)
    }).catch((error) => {
        activate(injected);
    });
  }

  const disconnectWellet = async () =>{
    deactivate()
  }

  useEffect(()=>{
    // setProvider(new ethers.providers.Web3Provider(window.ethereum));
    // web3.setProvider(window.ethereum)
    
    // setProvider(new Web3Provider(window.ethereum));

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
            <span className='address'>{REACT_APP_CONTARCT_ADDRESS}</span>        
            
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

                  <Button style={{ marginTop: 16 }} onClick={sendToken}>Transfer Token</Button>
                  <Button style={{ marginTop: 16, marginLeft: 20 }} onClick={()=>{}}>Withdraw Token</Button>
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
