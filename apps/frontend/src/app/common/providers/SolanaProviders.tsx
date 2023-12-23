"use client";

import { Adapter } from "@solana/wallet-adapter-base";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { type ConnectionConfig } from "@solana/web3.js";

import "@solana/wallet-adapter-react-ui/styles.css";

const WALLETS: Adapter[] = [];
const CONNECTION_CONFIG: ConnectionConfig = { commitment: "confirmed" };

export const SolanaProviders = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <ConnectionProvider
      endpoint={process.env.NEXT_PUBLIC_SOLANA_RPC_URL!}
      config={CONNECTION_CONFIG}
    >
      <WalletProvider wallets={WALLETS} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};
