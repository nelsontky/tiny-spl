import { useWallet } from "@solana/wallet-adapter-react";
import dynamic from "next/dynamic";
import { Button } from "react95";

const AppWalletMultiButton = dynamic(
  () =>
    import("@/app/common/components/AppWalletMultiButton").then(
      ({ AppWalletMultiButton }) => AppWalletMultiButton
    ),
  { ssr: false }
);

export const MintButton = () => {
  const { publicKey } = useWallet();

  if (!publicKey) {
    return <AppWalletMultiButton>Connect wallet to mint</AppWalletMultiButton>;
  }

  return <Button className="font-bold !text-xl !p-5">Mint now!</Button>;
};
