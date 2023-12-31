"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import dynamic from "next/dynamic";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Anchor, Avatar, Window, WindowContent, WindowHeader } from "react95";

import { Faq } from "../../../common/components/Faq";

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
    <div className="py-12">
      <Window>
        <WindowHeader className="flex gap-1 items-center">
          <img width={24} height={24} src="/assets/smiley-face.png" alt="hi" />
          <span>Welcome!</span>
        </WindowHeader>
        <WindowContent>
          <div className="flex gap-1 items-center mb-4">
            <div className="hidden sm:block">
              <Avatar
                size={128}
                square
                src="/assets/rotated-tree.webp"
                alt="tree"
              />
              <p className="italic">
                A tree rotated to better resemble a{" "}
                <Anchor
                  href="https://docs.solana.com/learn/state-compression"
                  target="_blank"
                >
                  merkle tree
                </Anchor>
                .
              </p>
            </div>
            <img
              className="min-w-0"
              src="/assets/tinyspl-wordart.webp"
              alt="word art"
            />
          </div>
          <div className="space-y-4">
            <p>
              Tiny SPL is a new token standard that lets you own tokens on
              Solana without worrying about rent fees!
            </p>
            <p>
              Easily manage your Tiny SPL tokens on this site! Click below to
              connect your Solana wallet or read on for more details before
              connecting later!
              <div className="mt-4 w-full flex justify-center">
                <AppWalletMultiButton>Get started!</AppWalletMultiButton>
              </div>
            </p>
          </div>
          <Faq />
        </WindowContent>
      </Window>
    </div>
  );
};
