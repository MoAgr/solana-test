"use client";
import { useState, useEffect } from "react";
import { registerDomainNameV2 } from "@bonfida/spl-name-service";
import { useWallet } from "@solana/wallet-adapter-react";
import { Connection, PublicKey, Transaction } from "@solana/web3.js";
import {
  getAssociatedTokenAddressSync,
  createAssociatedTokenAccountInstruction,
} from "@solana/spl-token";
import dynamic from "next/dynamic";

// Constants
const MAINNET_RPC = "QUICKNODE_RPC";
const USDC_TOKEN_ADDRESS = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
const DOMAIN_NAME = "moagrw";
const DOMAIN_SPACE = 1 * 1_000; // 1kB

const WalletMultiButton = dynamic(
  () =>
    import("@solana/wallet-adapter-react-ui").then(
      (mod) => mod.WalletMultiButton
    ),
  { ssr: false }
);

export default function ConnectWallet() {
  const [mounted, setMounted] = useState(false);
  const { publicKey, connected } = useWallet();
  const wallet = useWallet();
  const connection = new Connection(MAINNET_RPC);
  const walletName = wallet.wallet.adapter.name;
  const provider =
    walletName === "Phantom"
      ? window.phantom?.solana
      : walletName === "Solflare"
      ? window.solflare
      : null;

  const registerSolDomain = async () => {
    try {
      console.log(walletName);
      if (!wallet.publicKey) {
        throw new Error("Wallet not connected");
      }

      const accountKey = getAssociatedTokenAddressSync(
        new PublicKey(USDC_TOKEN_ADDRESS),
        wallet.publicKey
      );
      console.log(accountKey.toBase58());

      const accountInfo = await connection.getAccountInfo(accountKey);

      console.log("Account info:", accountInfo);

      if (!accountInfo) {
        // Create ATA transaction
        console.log("Creating ATA...");
        const ataTransaction = new Transaction().add(
          createAssociatedTokenAccountInstruction(
            wallet.publicKey,
            accountKey,
            wallet.publicKey,
            new PublicKey(USDC_TOKEN_ADDRESS)
          )
        );

        const { blockhash: ataBlockhash } =
          await connection.getLatestBlockhash();
        ataTransaction.recentBlockhash = ataBlockhash;
        ataTransaction.feePayer = publicKey;

        const ataSignedTx = await provider.signAndSendTransaction(
          ataTransaction
        );
        console.log("ATA Created.");
      }
      console.log("Registering Domain...");
      // Create domain registration transaction
      const [registerInstruction] = await registerDomainNameV2(
        connection,
        DOMAIN_NAME,
        DOMAIN_SPACE,
        wallet.publicKey,
        accountKey,
        new PublicKey(USDC_TOKEN_ADDRESS)
      );

      const domainTransaction = new Transaction().add(registerInstruction);
      const { blockhash } = await connection.getLatestBlockhash();

      domainTransaction.recentBlockhash = blockhash;
      domainTransaction.feePayer = publicKey;

      const domainSignedTx = await provider.signAndSendTransaction(
        domainTransaction
      );
      alert("Transaction confirmed!");
      console.log("Domain Bought!");
    } catch (error) {
      console.error("Domain registration error:", error);
      throw error;
    }
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="flex flex-col items-center gap-4">
      <div>
        {connected ? (
          <div>
            <p>Connected to: {publicKey.toBase58()}</p>
            <WalletMultiButton />
          </div>
        ) : (
          <WalletMultiButton />
        )}
      </div>
      <button onClick={registerSolDomain}>Buy Domain</button>
    </div>
  );
}
