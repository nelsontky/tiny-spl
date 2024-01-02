import HCaptcha from "@hcaptcha/react-hcaptcha";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { VersionedTransaction } from "@solana/web3.js";
import axios from "axios";
import clsx from "clsx";
import dynamic from "next/dynamic";
import { useRef, useState } from "react";
import { Button, Window, WindowContent, WindowHeader } from "react95";

import { AppDialog } from "@/app/common/components/AppDialog";
import { ConfirmingTransaction } from "@/app/common/components/ConfirmingTransaction";
import { SendTransactionResult } from "@/app/common/types/SendTransactionResult";

const AppWalletMultiButton = dynamic(
  () =>
    import("@/app/common/components/AppWalletMultiButton").then(
      ({ AppWalletMultiButton }) => AppWalletMultiButton
    ),
  { ssr: false }
);

const styles = {
  button: clsx(`
    font-bold 
    !text-xl 
    !p-5
  `),
};

export const MintButton = ({ mutate }: { mutate: () => Promise<any> }) => {
  const { publicKey, sendTransaction } = useWallet();
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);
  const [sendTransactionResult, setSendTransactionResult] =
    useState<SendTransactionResult | null>(null);
  const [amount, setAmount] = useState<number | null>(null);
  const captchaRef = useRef<HCaptcha | null>(null);
  const { connection } = useConnection();

  const onSubmit = async () => {
    if (!captchaRef.current || !publicKey) {
      return;
    }

    try {
      setError(undefined);
      setLoading(true);
      const response = await captchaRef.current.execute({ async: true });

      const { data } = await axios.post<{
        amount: number;
        transaction: string;
        blockhash: string;
        lastValidBlockHeight: number;
      }>("https://metadata.tinys.pl/mint", {
        publicKey: publicKey.toBase58(),
        hCaptchaVerificationToken: response.response,
      });

      const transaction = VersionedTransaction.deserialize(
        Buffer.from(data.transaction, "base64")
      );
      const txId = await sendTransaction(transaction, connection);
      setAmount(data.amount);
      setSendTransactionResult({
        blockhash: data.blockhash,
        lastValidBlockHeight: data.lastValidBlockHeight,
        txId,
      });
    } catch (err) {
      setError(`Error: ${(err as any)?.message ?? err}`);
    } finally {
      setLoading(false);
    }
  };

  if (!publicKey) {
    return (
      <AppWalletMultiButton className={styles.button}>
        Connect wallet to mint
      </AppWalletMultiButton>
    );
  }

  return (
    <>
      <TransactionWindow
        amount={amount}
        mutate={mutate}
        setAmount={setAmount}
        sendTransactionResult={sendTransactionResult}
        setSendTransactionResult={setSendTransactionResult}
        setError={setError}
      />
      <div className="flex flex-col items-end">
        <Button disabled={loading} onClick={onSubmit} className={styles.button}>
          {loading ? "Loading..." : "Mint now!"}
        </Button>
        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>
      <div className="hidden">
        <HCaptcha
          sitekey={process.env.NEXT_PUBLIC_HCAPTCHA_SITEKEY!}
          ref={captchaRef}
        />
        <span className="text-xs">
          Please solve the captcha before proceeding
        </span>
      </div>
    </>
  );
};

interface TransactionWindowProps {
  sendTransactionResult: SendTransactionResult | null;
  setSendTransactionResult: (result: SendTransactionResult | null) => void;
  setError: (error: string | undefined) => void;
  mutate: () => Promise<any>;
  amount: number | null;
  setAmount: (amount: number | null) => void;
}

const TransactionWindow = (props: TransactionWindowProps) => {
  return (
    <AppDialog
      open={!!props.sendTransactionResult && typeof props.amount === "number"}
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
  amount,
  setAmount,
}: TransactionWindowProps) => {
  const { publicKey } = useWallet();
  const [success, setSuccess] = useState(false);

  const content = success ? (
    <div>
      <img
        className="mx-auto mb-4"
        src="/assets/smiley-face.png"
        alt="Smiley face"
      />
      <span>
        Successfully minted <span className="font-bold">{amount} DN</span>{" "}
        tokens!
      </span>
      <div className="flex justify-end gap-2">
        <Button
          className="font-bold"
          as="a"
          {...{
            href: `/${publicKey?.toBase58()}`,
            target: "_blank",
          }}
        >
          Manage your tokens
        </Button>
        <Button
          onClick={() => {
            setSendTransactionResult(null);
            setAmount(null);
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
        setAmount(null);
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
        <span>Minting tokens</span>
        {success && (
          <Button
            onClick={async () => {
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
