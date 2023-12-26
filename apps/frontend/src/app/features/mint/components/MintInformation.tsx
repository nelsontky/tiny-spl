import { Avatar, WindowContent } from "react95";

import { formatAmount } from "@/app/common/utils/formatAmount";

import { TinySplRow } from "../../swr-hooks/types/TinySplRow";

interface MintInformationProps {
  ownerMintInfo: TinySplRow;
}

export const MintInformation = ({ ownerMintInfo }: MintInformationProps) => {
  return (
    <WindowContent className="flex gap-8">
      <Avatar square size={128} src={ownerMintInfo.logo} />
      <div>
        <span className="text-2xl font-bold">
          {formatAmount(ownerMintInfo.amount)} {ownerMintInfo.symbol}
        </span>
        <p>{ownerMintInfo.description ?? ""}</p>
      </div>
    </WindowContent>
  );
};
