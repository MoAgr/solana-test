"use client";
import ConnectWallet from "./components/ConnectWallet";
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from "@solana/wallet-adapter-wallets";
// import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
// import { clusterApiUrl } from "@solana/web3.js";
import { useEffect, useState } from "react";

import "@solana/wallet-adapter-react-ui/styles.css";

export default function Home() {
  const [endpoint, setEndpoint] = useState(null);
  const [wallets, setWallets] = useState([]);

  useEffect(() => {
    setEndpoint("QUICKNODE_RPC");
    setWallets([new PhantomWalletAdapter(), new SolflareWalletAdapter()]);
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-center font-mono text-sm lg:flex">
        {endpoint && wallets.length > 0 ? (
          <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={wallets} autoConnect>
              <WalletModalProvider>
                <ConnectWallet />
              </WalletModalProvider>
            </WalletProvider>
          </ConnectionProvider>
        ) : (
          <div>Loading...</div>
        )}
      </div>
    </main>
  );
}
