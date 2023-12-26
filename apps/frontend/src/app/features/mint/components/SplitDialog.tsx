import { useWallet } from "@solana/wallet-adapter-react";
import Decimal from "decimal.js";
import { useEffect, useRef, useState } from "react";
import { NumericFormat } from "react-number-format";
import {
  Button,
  TextInput,
  Window,
  WindowContent,
  WindowHeader,
} from "react95";

import { AppDialog } from "@/app/common/components/AppDialog";
import { useTinySplProgram } from "@/app/common/hooks/useTinySplProgram";
import { useWrapperConnection } from "@/app/common/hooks/useWrapperConnection";
import { formatAmount } from "@/app/common/utils/formatAmount";
import { ReadApiAsset } from "@/app/common/utils/WrapperConnection";

import { getAssetAmount } from "../../swr-hooks/utils/getAssetAmount";
import { buildSplitTinySplTx } from "../utils/buildSplitTinySplTx";
import { getSplitError } from "../utils/getSplitError";

interface SplitDialogProps {
  mintDetails: ReadApiAsset | null;
  onClose: () => void;
}

export const SplitDialog = ({ mintDetails, onClose }: SplitDialogProps) => {
  return (
    <AppDialog open={!!mintDetails} className="w-full max-w-2xl">
      <SplitDialogContent mintDetails={mintDetails} onClose={onClose} />
    </AppDialog>
  );
};

const SplitDialogContent = ({ mintDetails, onClose }: SplitDialogProps) => {
  const amount = !mintDetails ? undefined : getAssetAmount(mintDetails);
  const [leftAmount, setLeftAmount] = useState<string>();
  const [rightAmount, setRightAmount] = useState<string>();
  const [loading, setLoading] = useState(false);
  const { sendTransaction, publicKey } = useWallet();
  const tinySplProgram = useTinySplProgram();
  const connection = useWrapperConnection();
  const [error, setError] = useState<string>();

  const splitError = getSplitError(leftAmount, rightAmount);

  const areInitialAmountsSet = useRef(false);
  useEffect(
    function setInitialAmounts() {
      if (!amount || areInitialAmountsSet.current) {
        return;
      }

      const left = new Decimal(amount).div(2).ceil();
      const right = new Decimal(amount).sub(left);

      setLeftAmount(left.toFixed());
      setRightAmount(right.toFixed());

      areInitialAmountsSet.current = true;
    },
    [amount]
  );

  if (!amount || !mintDetails) {
    return null;
  }

  return (
    <Window className="w-full">
      <WindowHeader className="flex justify-between items-center">
        <span>Split token</span>
        <Button onClick={onClose}>
          <span className="close-icon" />
        </Button>
      </WindowHeader>
      <WindowContent>
        Split{" "}
        <span className="font-bold">
          {formatAmount(amount)} {mintDetails.content.metadata?.symbol ?? ""}
        </span>{" "}
        into
        <div className="flex gap-2 items-center mt-4">
          <div className="flex gap-1 items-center">
            <NumericFormat
              isAllowed={(values) => {
                const value = new Decimal(!values.value ? "0" : values.value);
                return value.lt(amount);
              }}
              allowNegative={false}
              decimalScale={0}
              value={leftAmount}
              onValueChange={(values) => {
                setLeftAmount(values.value);

                const value = new Decimal(!values.value ? "0" : values.value);
                const rightAmount = new Decimal(amount).sub(value);
                setRightAmount(rightAmount.toFixed());
              }}
              thousandSeparator=","
              customInput={TextInput}
            />
            <span className="font-bold">
              {mintDetails.content.metadata?.symbol ?? ""}
            </span>
          </div>
          and
          <div className="font-bold">
            <span>
              {formatAmount(rightAmount ?? "0")}{" "}
              {mintDetails.content.metadata?.symbol ?? ""}
            </span>
          </div>
        </div>
        <span className="text-sm">{splitError}</span>
        {error && <span className="text-sm text-red-500">{error}</span>}
        <div className="flex justify-end">
          <Button
            disabled={!!splitError || loading}
            className="font-bold"
            onClick={async () => {
              if (!publicKey) {
                return;
              }

              try {
                setLoading(true);
                setError(undefined);

                const { blockhash, lastValidBlockHeight, transaction } =
                  await buildSplitTinySplTx({
                    asset: mintDetails,
                    connection,
                    destinationAmounts: [leftAmount ?? "0", rightAmount ?? "0"],
                    signer: publicKey,
                    sourceAmount: amount,
                    tinySplProgram,
                  });

                const txId = await sendTransaction(transaction, connection);
              } catch (e: any) {
                setError(
                  `An error has occurred: "${e.message}"`
                );
              } finally {
                setLoading(false);
              }
            }}
          >
            {loading ? "Loading..." : "Split"}
          </Button>
        </div>
      </WindowContent>
    </Window>
  );
};
