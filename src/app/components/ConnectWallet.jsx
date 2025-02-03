"use client";
import { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
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
  const { publicKey, connected } = useWallet();

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
    </div>
  );
}
