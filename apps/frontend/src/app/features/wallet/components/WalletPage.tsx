import { useParams } from "react-router-dom";
import {
  Table,
  TableBody,
  TableHead,
  TableHeadCell,
  TableRow,
  Window,
  WindowContent,
  WindowHeader,
} from "react95";

import { Loader } from "@/app/common/components/Loader";
import { truncatePublicKey } from "@/app/common/utils/truncatePublicKey";
import { useTinySplsByOwner } from "../../swr-hooks/hooks/useTinySplsByOwner";

export const WalletPage = () => {
  const { publicKey } = useParams<{ publicKey: string }>();

  const { data } = useTinySplsByOwner(publicKey);
  console.log(data);

  if (typeof publicKey !== "string") {
    // TODO: check if the public key is valid
    return null;
  }

  return (
    <div className="h-full pt-8">
      <Window className="w-full">
        <WindowHeader>{truncatePublicKey(publicKey)}'s Tiny SPLs</WindowHeader>
        <Table>
          <TableHead>
            <TableRow>
              <TableHeadCell disabled>Icon</TableHeadCell>
              <TableHeadCell>Name</TableHeadCell>
              <TableHeadCell>Amount</TableHeadCell>
            </TableRow>
          </TableHead>
        </Table>
        <WindowContent>
          <Loader />
        </WindowContent>
      </Window>
    </div>
  );
};
