import { useParams, redirect } from "react-router-dom";
import { Window, WindowHeader } from "react95";

import { truncatePublicKey } from "@/app/common/utils/truncatePublicKey";
import { TinySplList } from "./TinySplList";

export const WalletPage = () => {
  const { publicKey } = useParams<{ publicKey: string }>();

  if (typeof publicKey !== "string") {
    // TODO: check if the public key is valid
    return redirect("/");
  }

  return (
    <div className="h-full pt-16">
      <Window className="w-full">
        <WindowHeader>{truncatePublicKey(publicKey)}'s Tiny SPLs</WindowHeader>
        <TinySplList />
      </Window>
    </div>
  );
};
