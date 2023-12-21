"use client";

import { Adapter } from "@solana/wallet-adapter-base";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";

import "@solana/wallet-adapter-react-ui/styles.css";

const wallets: Adapter[] = [];

export const SolanaProviders = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <ConnectionProvider endpoint={process.env.NEXT_PUBLIC_SOLANA_RPC_URL!}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};
