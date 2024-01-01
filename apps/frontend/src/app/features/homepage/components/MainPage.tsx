"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import dynamic from "next/dynamic";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Window, WindowContent, WindowHeader } from "react95";

const AppWalletMultiButton = dynamic(
  () =>
    import("@/app/common/components/AppWalletMultiButton").then(
      ({ AppWalletMultiButton }) => AppWalletMultiButton
    ),
  { ssr: false }
);

export const MainPage = () => {
  const { publicKey } = useWallet();
  const base58 = publicKey?.toBase58();

  const navigate = useNavigate();

  useEffect(
    function redirectOnWalletConnect() {
      if (base58) {
        navigate(`/${base58}`);
      }
    },
    [base58, navigate]
  );

  return (
    <div className="h-full flex items-center justify-center">
      <Window>
        <WindowHeader>Welcome!</WindowHeader>
        <WindowContent>
          Welcome to Tiny SPL! On this site you will be able to manage your tiny
          SPL tokens. Click the button below to connect to your Solana wallet!
          <div className="mt-4 w-full flex justify-center">
            <AppWalletMultiButton>Get started!</AppWalletMultiButton>
          </div>
        </WindowContent>
      </Window>
    </div>
  );
};
