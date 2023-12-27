import { amount } from "@metaplex-foundation/js";
import { useWallet } from "@solana/wallet-adapter-react";
import clsx from "clsx";
import { useState } from "react";
import { AppBar, Button, Toolbar } from "react95";

import { useTinySplProgram } from "@/app/common/hooks/useTinySplProgram";
import { useWrapperConnection } from "@/app/common/hooks/useWrapperConnection";
import { ReadApiAsset } from "@/app/common/utils/WrapperConnection";

import { buildCombineTinySplTx } from "../utils/buildCombineTinySplTx";
import { buildSplitTinySplTx } from "../utils/buildSplitTinySplTx";

interface CombineTaskbarProps {
  selectedMints: Record<string, ReadApiAsset>;
}

export const CombineTaskbar = ({ selectedMints }: CombineTaskbarProps) => {
  const connection = useWrapperConnection();
  const mintCount = Object.keys(selectedMints).length;
  const [loading, setLoading] = useState(false);
  const { sendTransaction, publicKey } = useWallet();
  const tinySplProgram = useTinySplProgram();

  if (mintCount < 2) {
    return null;
  }

  return (
    <AppBar className="fixed bottom-0 !left-0 !top-auto !right-auto z-10">
      <Toolbar className="flex justify-end">
        <div>
          <Button
            disabled={loading}
            size="lg"
            className={clsx("font-bold", !loading && "animate-bounce")}
            onClick={async () => {
              if (!publicKey) {
                return;
              }

              try {
                setLoading(true);

                const { blockhash, lastValidBlockHeight, transaction } =
                  await buildCombineTinySplTx({
                    connection,
                    signer: publicKey,
                    tinySplProgram,
                    assets: Object.values(selectedMints),
                  });

                const txId = await sendTransaction(transaction, connection);
                console.log(txId);
                // setSendTransactionResult({
                //   blockhash,
                //   lastValidBlockHeight,
                //   txId,
                // });
              } catch (e: any) {
              } finally {
                setLoading(false);
              }
            }}
          >
            {!loading ? `Combine (${mintCount})` : "Loading..."}
          </Button>
        </div>
      </Toolbar>
    </AppBar>
  );
};
