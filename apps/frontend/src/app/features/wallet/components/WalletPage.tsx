import { useParams, redirect, useSearchParams } from "react-router-dom";
import { Window, WindowHeader } from "react95";

import { truncatePublicKey } from "@/app/common/utils/truncatePublicKey";
import { TinySplList } from "./TinySplList";
import { MintPage } from "../../mint/components/MintPage";

export const WalletPage = () => {
  const { publicKey } = useParams<{ publicKey: string }>();
  const [urlSearchParams] = useSearchParams();
  const mintAddress = urlSearchParams.get("mint");

  if (typeof publicKey !== "string") {
    // TODO: check if the public key is valid
    return redirect("/");
  }

  if (mintAddress) {
    return <MintPage />;
  }

  return (
    <div className="py-12">
      <Window className="w-full">
        <WindowHeader>{truncatePublicKey(publicKey)}'s Tiny SPLs</WindowHeader>
        <TinySplList />
      </Window>
    </div>
  );
};
