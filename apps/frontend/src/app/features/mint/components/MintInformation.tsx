import { useWallet } from "@solana/wallet-adapter-react";
import { Avatar, Separator, WindowContent } from "react95";

import { formatAmount } from "@/app/common/utils/formatAmount";
import { truncatePublicKey } from "@/app/common/utils/truncatePublicKey";

import { TinySplRow } from "../../swr-hooks/types/TinySplRow";

interface MintInformationProps {
  ownerMintInfo: TinySplRow;
  ownerPublicKey: string;
}

export const MintInformation = ({
  ownerMintInfo,
  ownerPublicKey,
}: MintInformationProps) => {
  const { publicKey } = useWallet();
  const isWalletConnected = !!publicKey;
  const isConnectedWalletOwner = publicKey?.toBase58() === ownerPublicKey;

  return (
    <WindowContent className="flex gap-8">
      <Avatar square size={128} src={ownerMintInfo.logo} />
      <div className="flex flex-col justify-between">
        <div>
          <span className="text-2xl font-bold">
            {formatAmount(ownerMintInfo.amount)} {ownerMintInfo.symbol}
          </span>
          <p>{ownerMintInfo.description ?? ""}</p>
        </div>
        <div>
          {(!isWalletConnected || !isConnectedWalletOwner) && (
            <>
              <Separator orientation="horizontal" />
              <p className="mt-2 text-sm">
                {!isWalletConnected
                  ? "If this is your wallet, connect it to manage your tiny SPL balances"
                  : `Connected wallet isn't the owner of these tokens.`}
              </p>
            </>
          )}
        </div>
      </div>
    </WindowContent>
  );
};
