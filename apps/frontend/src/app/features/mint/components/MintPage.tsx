import { redirect, useParams, useSearchParams } from "react-router-dom";
import { Hourglass, Window, WindowHeader } from "react95";

import { truncatePublicKey } from "@/app/common/utils/truncatePublicKey";

import { useOwnerTinySplMint } from "../../swr-hooks/hooks/useOwnerTinySplMint";

export const MintPage = () => {
  const { publicKey } = useParams<{ publicKey: string }>();
  const [urlSearchParams] = useSearchParams();
  const mintAddress = urlSearchParams.get("mint");

  const { data } = useOwnerTinySplMint(publicKey, mintAddress);

  if (typeof publicKey !== "string" || typeof mintAddress !== "string") {
    // TODO: check if the public key is valid
    return <>{redirect("/")}</>;
  }

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
          {data.collectionName} ({truncatePublicKey(data.collectionId, 8)})
        </WindowHeader>
      </Window>
    </div>
  );
};
