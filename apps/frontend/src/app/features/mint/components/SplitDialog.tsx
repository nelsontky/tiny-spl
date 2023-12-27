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
import { ConfirmingTransaction } from "@/app/common/components/ConfirmingTransaction";
import { useTinySplProgram } from "@/app/common/hooks/useTinySplProgram";
import { useWrapperConnection } from "@/app/common/hooks/useWrapperConnection";
import { SendTransactionResult } from "@/app/common/types/SendTransactionResult";
import { formatAmount } from "@/app/common/utils/formatAmount";
import { ReadApiAsset } from "@/app/common/utils/WrapperConnection";

import { getAssetAmount } from "../../swr-hooks/utils/getAssetAmount";
import { buildSplitTinySplTx } from "../utils/buildSplitTinySplTx";
import { getSplitError } from "../utils/getSplitError";

interface SplitDialogProps {
  mintDetails: ReadApiAsset | null;
  mutate: () => Promise<any>;
  onClose: () => void;
}

export const SplitDialog = ({
  mintDetails,
  onClose,
  mutate,
}: SplitDialogProps) => {
  return (
    <AppDialog open={!!mintDetails} className="w-full max-w-3xl">
      <SplitDialogContent
        mintDetails={mintDetails}
        mutate={mutate}
        onClose={onClose}
      />
    </AppDialog>
  );
};

const SplitDialogContent = ({
  mintDetails,
  onClose,
  mutate,
}: SplitDialogProps) => {
  const amount = !mintDetails ? undefined : getAssetAmount(mintDetails);
  const [leftAmount, setLeftAmount] = useState<string>();
  const [rightAmount, setRightAmount] = useState<string>();
  const [loading, setLoading] = useState(false);
  const { sendTransaction, publicKey } = useWallet();
  const tinySplProgram = useTinySplProgram();
  const connection = useWrapperConnection();
  const [error, setError] = useState<string>();
  const [sendTransactionResult, setSendTransactionResult] =
    useState<SendTransactionResult | null>(null);
  const [success, setSuccess] = useState(false);

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

  const windowContent = success ? (
    <SuccessContent
      formattedInitialAmount={`${formatAmount(amount ?? "0")} ${
        mintDetails.content?.metadata?.symbol ?? ""
      }`}
      formattedLeftAmount={`${formatAmount(leftAmount ?? "0")} ${
        mintDetails.content?.metadata?.symbol ?? ""
      }`}
      formattedRightAmount={`${formatAmount(rightAmount ?? "0")} ${
        mintDetails.content?.metadata?.symbol ?? ""
      }`}
      onClose={onClose}
    />
  ) : sendTransactionResult ? (
    <ConfirmingTransaction
      sendTransactionResult={sendTransactionResult}
      onError={(err) => {
        setSendTransactionResult(null);
        setError(`An error has occurred: "${err.message}"`);
      }}
      onSuccess={async () => {
        await mutate();
        setSendTransactionResult(null);
        setSuccess(true);
      }}
    />
  ) : (
    <>
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
              setSendTransactionResult({
                blockhash,
                lastValidBlockHeight,
                txId,
              });
            } catch (e: any) {
              setError(`An error has occurred: "${e.message}"`);
            } finally {
              setLoading(false);
            }
          }}
        >
          {loading ? <span>Loading...</span> : "Split"}
        </Button>
      </div>
    </>
  );

  return (
    <Window className="w-full">
      <WindowHeader className="flex justify-between items-center">
        <span>Split token</span>
        {!sendTransactionResult && (
          <Button onClick={onClose}>
            <span className="close-icon" />
          </Button>
        )}
      </WindowHeader>
      <WindowContent>{windowContent}</WindowContent>
    </Window>
  );
};

const SuccessContent = ({
  formattedInitialAmount,
  formattedLeftAmount,
  formattedRightAmount,
  onClose,
}: {
  formattedInitialAmount: string;
  formattedLeftAmount: string;
  formattedRightAmount: string;
  onClose: () => void;
}) => {
  return (
    <div>
      <img
        className="mx-auto mb-4"
        src="/assets/smiley-face.png"
        alt="Smiley face"
      />
      <span>
        Successfully split{" "}
        <span className="font-bold">{formattedInitialAmount}</span> into{" "}
        <span className="font-bold">{formattedLeftAmount}</span> and{" "}
        <span className="font-bold">{formattedRightAmount}</span>
      </span>
      <div className="flex justify-end">
        <Button onClick={onClose}>Done</Button>
      </div>
    </div>
  );
};
