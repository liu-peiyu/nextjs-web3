import { Web3Provider } from "@ethersproject/providers";
import { useWeb3React } from "@web3-react/core";
import { Web3ReactContextInterface } from "@web3-react/core/dist/types";
import { NetworkContextName } from "@/config/index";

export function useActiveWeb3React(): Web3ReactContextInterface<Web3Provider> {
  // console.log('useActiveWeb3React')
  const context = useWeb3React<Web3Provider>();

  // console.log('context', context)

  const contextNetwork = useWeb3React<Web3Provider>(NetworkContextName);

  // console.log('contextNetwork', contextNetwork)
  // context 连接钱包的网络  contextNetwork默认页面网络
  // return context.active ? { ...context } : { ...contextNetwork };

  return context
}