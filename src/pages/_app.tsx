import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { Web3Provider } from '@ethersproject/providers'
import { Web3ReactProvider } from '@web3-react/core'
import Web3ReactManager from '@/components/Web3ReactManager'
import dynamic from 'next/dynamic'

import 'antd/dist/antd.css'

export function getLibrary(provider: any): Web3Provider {
  const library = new Web3Provider(provider);
  library.pollingInterval = 15000;
  return library;
}

const Web3ProviderNetwork = dynamic(() => import("../components/Web3ProviderNetwork/index"), { ssr: false });

export default function App({ Component, pageProps }: AppProps) {
  return <Web3ReactProvider getLibrary={getLibrary}>
          <Web3ProviderNetwork getLibrary={getLibrary}>
            <Web3ReactManager>
              <Component {...pageProps} />
            </Web3ReactManager>
          </Web3ProviderNetwork>
        </Web3ReactProvider>
}
