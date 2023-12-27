import { useWallet } from "@solana/wallet-adapter-react";
import clsx from "clsx";
import Decimal from "decimal.js";
import { useEffect, useState } from "react";
import {
  AppBar,
  Button,
  Toolbar,
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
import { buildCombineTinySplTx } from "../utils/buildCombineTinySplTx";

interface CombineTaskbarProps {
  selectedMints: Record<string, ReadApiAsset>;
  setSelectedMints: (mints: Record<string, ReadApiAsset>) => void;
  mutate: () => Promise<any>;
}

export const CombineTaskbar = ({
  selectedMints,
  mutate,
  setSelectedMints,
}: CombineTaskbarProps) => {
  const connection = useWrapperConnection();
  const mintCount = Object.keys(selectedMints).length;
  const [loading, setLoading] = useState(false);
  const { sendTransaction, publicKey } = useWallet();
  const tinySplProgram = useTinySplProgram();
  const [error, setError] = useState<string>();
  const [sendTransactionResult, setSendTransactionResult] =
    useState<SendTransactionResult | null>(null);
  const disabled = loading || !!sendTransactionResult;

  useEffect(
    function resetSelectedMints() {
      if (!sendTransactionResult) {
        setSelectedMints({});
      }
    },
    [sendTransactionResult, setSelectedMints]
  );

  if (mintCount < 2) {
    return null;
  }

  return (
    <>
      <TransactionWindow
        mutate={mutate}
        selectedMints={selectedMints}
        sendTransactionResult={sendTransactionResult}
        setSendTransactionResult={setSendTransactionResult}
        setError={setError}
      />
      <AppBar className="fixed bottom-0 !left-0 !top-auto !right-auto z-10">
        <Toolbar className="flex justify-end">
          <div className="flex flex-col items-end">
            <Button
              disabled={disabled}
              size="lg"
              className={clsx("font-bold", !disabled && "animate-bounce")}
              onClick={async () => {
                if (!publicKey) {
                  return;
                }

                try {
                  setError(undefined);
                  setLoading(true);

                  const { blockhash, lastValidBlockHeight, transaction } =
                    await buildCombineTinySplTx({
                      connection,
                      signer: publicKey,
                      tinySplProgram,
                      assets: Object.values(selectedMints),
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
              {!loading ? `Combine (${mintCount})` : "Loading..."}
            </Button>
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        </Toolbar>
      </AppBar>
    </>
  );
};

interface TransactionWindowProps {
  sendTransactionResult: SendTransactionResult | null;
  setSendTransactionResult: (result: SendTransactionResult | null) => void;
  setError: (error: string | undefined) => void;
  mutate: () => Promise<any>;
  selectedMints: Record<string, ReadApiAsset>;
}

const TransactionWindow = (props: TransactionWindowProps) => {
  return (
    <AppDialog
      open={!!props.sendTransactionResult}
      className="w-full max-w-3xl"
    >
      <TransactionWindowContent {...props} />
    </AppDialog>
  );
};

const TransactionWindowContent = ({
  mutate,
  sendTransactionResult,
  setError,
  setSendTransactionResult,
  selectedMints,
}: TransactionWindowProps) => {
  const [success, setSuccess] = useState(false);

  const combinedAmount = Object.values(selectedMints).reduce(
    (acc, mint) => new Decimal(getAssetAmount(mint) ?? "0").add(acc),
    new Decimal(0)
  );
  const symbol =
    Object.values(selectedMints)[0]?.content.metadata?.symbol ?? "";

  const content = success ? (
    <div>
      <img
        className="mx-auto mb-4"
        src="/assets/smiley-face.png"
        alt="Smiley face"
      />
      <span>
        Successfully combined tokens into{" "}
        <span className="font-bold">
          {formatAmount(combinedAmount.toFixed())} {symbol}
        </span>
      </span>
      <div className="flex justify-end">
        <Button
          onClick={() => {
            setSendTransactionResult(null);
          }}
        >
          Done
        </Button>
      </div>
    </div>
  ) : (
    <ConfirmingTransaction
      sendTransactionResult={sendTransactionResult}
      onError={(err) => {
        setSendTransactionResult(null);
        setError(`An error has occurred: "${err.message}"`);
      }}
      onSuccess={async () => {
        await mutate();
        setSuccess(true);
      }}
    />
  );

  return (
    <Window className="w-full">
      <WindowHeader className="flex justify-between items-center">
        <span>Combining tokens</span>
        {success && (
          <Button
            onClick={() => {
              setSendTransactionResult(null);
            }}
          >
            <span className="close-icon" />
          </Button>
        )}
      </WindowHeader>
      <WindowContent>{content}</WindowContent>
    </Window>
  );
};
