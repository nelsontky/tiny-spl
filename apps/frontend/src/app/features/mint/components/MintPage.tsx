import { Window, WindowHeader } from "react95";

import { LoadingScreen } from "@/app/common/components/LoadingScreen";
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
    return <LoadingScreen />;
  }

  return (
    <div className="pt-12 pb-24">
      <Window className="w-full">
        <WindowHeader>
          {data.collectionName} (Owner: {truncatePublicKey(publicKey)})
        </WindowHeader>
        <MintInformation ownerPublicKey={publicKey} ownerMintInfo={data} />
        <h2 className="text-lg">Balances:</h2>
        <MintBalances
          ownerPublicKey={publicKey}
          balances={data.assets}
          mutate={mutate}
        />
      </Window>
    </div>
  );
};
