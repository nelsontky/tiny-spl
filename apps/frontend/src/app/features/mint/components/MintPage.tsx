import { redirect, useParams, useSearchParams } from "react-router-dom";
import { Hourglass, Window, WindowContent, WindowHeader } from "react95";

import { truncatePublicKey } from "@/app/common/utils/truncatePublicKey";

import { useOwnerTinySplMint } from "../../swr-hooks/hooks/useOwnerTinySplMint";
import { MintBalances } from "./MintBalances";
import { MintInformation } from "./MintInformation";

interface MintPageProps {
  publicKey: string;
  mint: string;
}

export const MintPage = ({ mint, publicKey }: MintPageProps) => {
  const { data, mutate } = useOwnerTinySplMint(publicKey, mint);

  if (!data) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <Hourglass size={48} />
      </div>
    );
  }

  return (
    <div className="py-12">
      <Window className="w-full">
        <WindowHeader>
          {data.collectionName} (Owner: {truncatePublicKey(publicKey)})
        </WindowHeader>
        <MintInformation ownerMintInfo={data} />
        <h2 className="text-lg">Balances:</h2>
        <MintBalances balances={data.assets} mutate={mutate} />
      </Window>
    </div>
  );
};
