import Head from 'next/head'
import Web3 from "web3"

import { useActiveWeb3React } from "@/hooks/useActiveWeb3React";
import { useEffect, useState } from "react";

import { injected } from "@/config/constants/wallets";

import { Button, Card, Col, Input, Layout, message, Row, Spin, Table } from 'antd';

import dayjs from 'dayjs';

import ContractABI from '@/contract/TicketContract.json';


export default function Ticket() {

  // goerl 
  // ganache 0x9DC77268BdFc38d5e6e02BE427774239fB074308
  const REACT_APP_CONTARCT_ADDRESS = '0x9C308fCdb264a45Fc11955B53E2720124896596e'
  
  // const { active } = useWeb3React();
1
  // active (BOOL) is a wallet actively connected right now
  // account (address) the blockchain address that is connected
  // chainId InjectID
  // connector the current connector. So, when we connect it will be the injected connector in this example
  // activate (wallet) the method to connect to a wallet
  // deactivate the method to disconnect from a wallet
  // library this is either web3 or ethers, depending what you passed in
  const { active, account, chainId, error, connector, activate, deactivate, library } = useActiveWeb3React()

  console.log(active, chainId, connector)
  console.log(library)

  const [loading, setLoading] = useState(false);

  const [web3, setWeb3] = useState<Web3>();

  const [contractWithSigner, setContractWithSigner] = useState<any>(null);

  const [contractWelletBalance, setContractWalletBalance] = useState<any>(0);

  const [ownerWalletBlance, setOwnerWalletBalance] = useState<any>(0);

  const [lucklyText, setLucklyText] = useState<string>('');

  const [dataSource, setDataSource] = useState<any[]>([])

  const columns = [
    {
      title: 'Player',
      dataIndex: 'address',
      key: 'address',
    },
    {
      title: 'Luckly Text',
      dataIndex: 'lucklyText',
      key: 'lucklyText',
    },
    {
      title: 'Random',
      dataIndex: 'random',
      key: 'random',
    },
    {
      title: 'Luckly Amount',
      dataIndex: 'amount',
      key: 'amount',
    },
    {
      title: 'DateTime',
      dataIndex: 'timestamp',
      key: 'timestamp',
    }
  ];
  

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
    contractWithSigner && fetchSupportList()
    account && getOwnerWalletBalance()

  }

  const fetchSupportList = async () =>{
    contractWithSigner.methods.getSupports().call().then((receipt:any)=>{
      if(receipt.length > 0){
        let data:any[] = []
        receipt.forEach((item:any, index:number)=>{
          data.push({
            index: index,
            address: item.supportAddress,
            lucklyText: item.supportText,
            random: item.ratio,
            amount: Web3.utils.fromWei(item.amount, 'ether'),
            timestamp: dayjs.unix(item.timestamp).format('YYYY-MM-DD HH:mm:ss')
          })
        })
        setDataSource(data.reverse())
      }
    })
  }

  const handleLuckly = async () =>{
    setLoading(true)
    if(lucklyText === ''){
      message.error('transfer amount error')
      setLoading(false)
      return;
    }
    const value = 0.01 * 10 ** 18;
    const gasPrice = await web3?.eth.getGasPrice()
    web3?.eth.getTransactionCount(String(account)).then((nonce:any)=>{
      // console.log(nonce)
      contractWithSigner.methods.supportTicket(lucklyText).estimateGas({from: account, value: value}).then((_gas:any)=>{
        // console.log(_gas)
        contractWithSigner.methods.supportTicket(lucklyText).send({from: account, value: value, gas: _gas, gasPrice: gasPrice, nonce: nonce}).then((receipt:any)=>{
          console.log('receipt:', receipt)
          refetch()
        }).catch((err:any)=>{
          console.log(err)
          setLoading(false)
        })
      }).catch((err:any)=>{
        console.error(err)
        setLoading(false)
      })
    }).catch(err=>{
      console.error(err)
      setLoading(false)
    }).finally(()=>{
      setLoading(false)
    })
  }

  const connectWellet = async () =>{
    // console.log(injected)
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
      let web3Contract = new web3.eth.Contract(ContractABI.abi, REACT_APP_CONTARCT_ADDRESS)
      // console.log('web3Contract:', web3Contract)
      // console.log(web3Contract.options)
      setContractWithSigner(web3Contract)
  },[web3])

  useEffect(()=>{
    setWeb3(new Web3(window.ethereum))
  }, [])

  const onLog = (rnd: any, balance: any, uint256: any) => {
    // console.log(rnd, balance, uint256);
  }


  useEffect(() => {
    if(contractWithSigner){
      fetchSupportList()
      contractWithSigner.events.Log({},function(error:any){
        console.error(error) 
      }).on("connected", (subscriptionId:any)=>{
          console.log('subscriptionId:', subscriptionId);
      })
      .on('data', (event:any)=>{ // same results as the optional callback above
          console.log('data:', event); 
      })
      .on('changed', (event:any)=>{
          // remove event from local database
          console.log('changed:', event)
      })
      .on('error', (error:any, receipt:any) =>{ // If the transaction was rejected by the network with a receipt, the second parameter will be the receipt.
          console.error(error, receipt);
      });
    }
    return () => {}
  }, [contractWithSigner])

  useEffect(() => {
    account && refetch()
  },[account])

  return (
    <div>
      <Head>
        <title>Luckly DApp</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
      <Spin spinning={loading}>
      <Layout className='app'>
        <div>
          <div className='header'>
            <h1>Contract Infomation({active? `${library?.connection.url}- ${library?.provider.networkVersion}`:  library?.provider.url})</h1>
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
                    active ? <Button onClick={disconnectWellet}>Disconnect Wellet</Button>:<Button onClick={connectWellet}>Connect Wellet</Button>
                  }
                </div>
                <div>
                  ETH balance:<span className='address'>{ownerWalletBlance}</span>
                </div>


                <div className='operate'>                  
                  <div style={{ marginTop: 16 }}>
                    <Input prefix="Luckly Text：" value={lucklyText} className="input" onChange={e => setLucklyText(e.target.value)} style={{width: '100%'}} />
                  </div>

                  <Button style={{ marginTop: 16 }} onClick={handleLuckly}>Get Luckly</Button>
                </div>
              </Card>

            </Col>

            {/* support list */}
            <Col span={12} className="right">
              <Card title='Supports'>
              <Table rowKey={row=>row.index} dataSource={dataSource} columns={columns} />
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
