import { useWallet } from "@solana/wallet-adapter-react";
import dynamic from "next/dynamic";
import { useNavigate } from "react-router-dom";
import { AppBar as React95AppBar, Button, Toolbar } from "react95";

const AppWalletMultiButton = dynamic(
  () =>
    import("./AppWalletMultiButton").then(
      ({ AppWalletMultiButton }) => AppWalletMultiButton
    ),
  { ssr: false }
);

export const AppBar = () => {
  const navigate = useNavigate();
  const { disconnect } = useWallet();

  return (
    <>
      <React95AppBar className="h-12 z-10">
        <Toolbar className="flex justify-between">
          <div className="flex gap-3">
            <Button
              className="font-bold flex items-center gap-1"
              onClick={async () => {
                await disconnect();
                navigate("/");
              }}
            >
              <img
                src="/assets/windows.png"
                width={32}
                height={32}
                alt="windows icon"
              />
              Home
            </Button>
            <Button
              className="font-bold"
              as="a"
              // destructured to overcome typecheck
              {...{
                target: "_blank",
                rel: "noopener noreferrer",
                href: "https://github.com/nelsontky/tiny-spl",
              }}
            >
              GitHub
            </Button>
          </div>
          <AppWalletMultiButton />
        </Toolbar>
      </React95AppBar>
      <div className="min-h-[3rem]" />
    </>
  );
};
