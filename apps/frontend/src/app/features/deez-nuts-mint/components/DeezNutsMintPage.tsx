import { publicKey } from "@coral-xyz/anchor/dist/cjs/utils";
import {
  Anchor,
  Avatar,
  Separator,
  Window,
  WindowContent,
  WindowHeader,
} from "react95";

import { Faq } from "../../../common/components/Faq";
import { MintButton } from "./MintButton";

export const DeezNutsMintPage = () => {
  return (
    <div className="py-12 space-y-8">
      <Window className="w-full">
        <WindowHeader>Mint Deez Nuts</WindowHeader>
        <WindowContent>
          <div className="flex mb-4 gap-4">
            <Avatar
              src="/assets/deez-nuts-logo.webp"
              className="flex-1 max-w-[128px]"
              size={128}
              square
            />
            <div className="space-y-2 flex-1">
              <h1 className="text-xl font-bold">Deez Nuts</h1>
              <p>
                Tiny SPL is the newest token standard on Solana, and Deez Nuts
                is the first token to be minted with this standard!
              </p>
              <p>
                Each mint attempt will mint you a random amount of tokens
                between 100 and 1000. There are no wallet limits, so mint away!
              </p>
              <p className="italic">
                For security, use a{" "}
                <Anchor
                  href="https://axs.gitbook.io/solana-nfts/phantom-wallet/how-to-setup-a-burner-wallet"
                  target="_blank"
                >
                  burner wallet
                </Anchor>{" "}
                containing &lt; 0.01 SOL for gas on unknown sites.
              </p>
              <Separator />
              <div className="flex justify-between">
                <div>
                  <p>
                    Wallet balance: <span className="font-bold">{69} DN</span>
                  </p>
                  <p>
                    Mint price: <span className="font-bold">FREE</span>
                  </p>
                </div>
                <MintButton />
              </div>
            </div>
          </div>
        </WindowContent>
      </Window>
      <Window>
        <WindowHeader>FAQ</WindowHeader>
        <WindowContent>
          <Faq />
        </WindowContent>
      </Window>
    </div>
  );
};
