import { useConnection } from "@solana/wallet-adapter-react";
import { RpcResponseAndContext, SignatureResult } from "@solana/web3.js";
import { useEffect } from "react";
import { Anchor } from "react95";

import { SendTransactionResult } from "../types/SendTransactionResult";
import { BlinkingDots } from "./BlinkingDots";
import { Loader } from "./Loader";

interface ConfirmingTransactionProps {
  sendTransactionResult: SendTransactionResult | null;
  onError?: (err: Error) => void;
  onSuccess?: (result: RpcResponseAndContext<SignatureResult>) => void;
}

export const ConfirmingTransaction = ({
  onError,
  onSuccess,
  sendTransactionResult,
}: ConfirmingTransactionProps) => {
  const { connection } = useConnection();

  useEffect(
    function confirmingTransaction() {
      if (!sendTransactionResult) {
        return;
      }

      (async () => {
        try {
          const result = await connection.confirmTransaction(
            {
              blockhash: sendTransactionResult.blockhash,
              lastValidBlockHeight: sendTransactionResult.lastValidBlockHeight,
              signature: sendTransactionResult.txId,
            },
            "confirmed"
          );

          if (result.value.err) {
            throw new Error(JSON.stringify(result.value.err));
          }

          onSuccess?.(result);
        } catch (e) {
          if (e instanceof Error) {
            onError?.(e);
          }
        }
      })();
    },
    [connection, onError, onSuccess, sendTransactionResult]
  );

  if (!sendTransactionResult) {
    return null;
  }

  return (
    <div className="w-full">
      <img
        className="w-3/4 mx-auto mb-4"
        src="/assets/ie-download.gif"
        alt="Confirming transaction"
      />
      <Loader incrementInterval={1000} />
      <p>
        Sending transaction
        <BlinkingDots />
      </p>
      <Anchor
        href={`https://solscan.io/tx/${sendTransactionResult.txId}`}
        target="_blank"
      >
        View transaction
      </Anchor>
    </div>
  );
};
