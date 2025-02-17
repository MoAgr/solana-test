"use client";
import { useState, useEffect } from "react";
import { registerDomainNameV2 } from "@bonfida/spl-name-service";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import {
  Connection,
  PublicKey,
  Transaction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import {
  getAssociatedTokenAddressSync,
  createAssociatedTokenAccountInstruction,
} from "@solana/spl-token";
import dynamic from "next/dynamic";

const WalletMultiButton = dynamic(
  () =>
    import("@solana/wallet-adapter-react-ui").then(
      (mod) => mod.WalletMultiButton
    ),
  { ssr: false }
);

export default function ConnectWallet() {
  const [mounted, setMounted] = useState(false);
  const { publicKey, connected, sendTransaction } = useWallet();
  const wallet = useWallet();
  const connection = new Connection(
    "https://tiniest-long-vineyard.solana-mainnet.quiknode.pro/89c871fcb44543478164b00d02fcaf3807e3a83f/"
  );
  const testnetConnection = new Connection(
    "https://young-serene-fog.solana-devnet.quiknode.pro/045f57c7486b8976545b819d4e3f3a17a4845fe1"
  );
  const provider = window.phantom?.solana;

  const registerSolDomain = async () => {
    try {
      // Domain registration parameters
      const name = "moagrw"; // Domain to register
      const space = 1 * 1_000; // 1kB sized domain

      // Validate wallet connection
      if (!wallet.publicKey) {
        throw new Error("Wallet not connected");
      }
      const accountKey = getAssociatedTokenAddressSync(
        new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"),
        // new PublicKey("4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU"),
        wallet.publicKey
      );
      console.log(accountKey.toBase58());

      const transaction1 = new Transaction().add(
        createAssociatedTokenAccountInstruction(
          wallet.publicKey,
          accountKey,
          wallet.publicKey,
          new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v")
        )
      );

      const blockhash1 = await connection.getLatestBlockhash();

      transaction1.recentBlockhash = blockhash1.blockhash;
      transaction1.feePayer = publicKey;

      const signedTransaction1 = await provider.signAndSendTransaction(
        transaction1
      );
      console.log("ATA Created.");

      // Create registration instruction
      const ix = await registerDomainNameV2(
        connection,
        name,
        space,
        wallet.publicKey, // Use connected wallet's pubkey
        accountKey,
        new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v") // Assuming using wallet's token account
      );
      console.log("IX:", ix);
      // Create a new transaction
      const transaction = new Transaction();
      transaction.add(ix[0]);

      console.log("Connection:", connection);
      console.log("IX:", ix);
      const blockhash = await connection.getLatestBlockhash();

      transaction.recentBlockhash = blockhash.blockhash;
      transaction.feePayer = publicKey;

      // console.log("transaction:", transaction);
      // Request wallet to sign transaction
      console.log(publicKey);
      const signedTransaction = await provider.signAndSendTransaction(
        transaction
      );

      // await testnetConnection.confirmTransaction(
      //   signedTransaction,
      //   "processed"
      // );
      alert("Transaction confirmed!");
      console.log("Domain Bought!");

      // console.log("Domain registration successful:", confirmation);
      // return confirmation;
    } catch (error) {
      console.error("Domain registration error:", error);
      throw error;
    }
  };

  // const handleRegister = async () => {
  //   if (!connection) {
  //     console.error("Connection not initialized yet");
  //     return;
  //   }
  //   try {
  //     console.log("Latest block hash:", connection.getLatestBlockhash());
  //     await registerSolDomain(connection, wallet);
  //   } catch (error) {
  //     console.log("ERROR");
  //     console.log(connection);
  //   }
  // };

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
