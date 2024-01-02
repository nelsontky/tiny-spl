import clsx from "clsx";
import { Anchor } from "react95";

const styles = {
  faqParagraphs: clsx(`
    space-y-1
  `),
};

export const Faq = () => (
  <>
    <h2 className="text-2xl font-bold">FAQ</h2>
    <div className="space-y-4">
      <div className={styles.faqParagraphs}>
        <h3 className="font-bold">What does Tiny SPL do?</h3>
        <p>
          Tiny SPL enables ownership of Solana tokens without incurring rent
          fees.
        </p>
        <p>
          Traditionally, token balances are stored on-chain. Keeping this data
          on-chain takes up space, so Solana charges a "rent" fee of ~0.002 SOL
          for the storage. i.e. you paid ~0.002 SOL to store information on how
          much BONK your wallet owns on-chain.
        </p>
        <p>
          With the price of SOL rapidly increasing, this rent fee is getting
          more and more expensive. Tiny SPL utilizes{" "}
          <Anchor
            href="https://docs.solana.com/learn/state-compression"
            target="_blank"
          >
            state compression
          </Anchor>{" "}
          on Solana to allow you to own tokens without paying rent.
        </p>
      </div>
      <div className={styles.faqParagraphs}>
        <h3 className="font-bold">What does SPL stand for?</h3>
        <p>
          SPL stands for "Solana Program Library". While the Solana Program
          Library is a collection of programs that sets the base of how the
          programable Solana blockchain works, the term "SPL" is also used to
          refer to the token standard on Solana. Any token that isn't SOL that
          can be found in your wallet is an SPL token. (SOL is the{" "}
          <span className="italic">native</span> token)
        </p>
        <p>
          And this is why this new token standard is named Tiny SPL! It utilizes
          state compression, thus creating a "tinier" version of the SPL token
          standard.
        </p>
      </div>
      <div className={styles.faqParagraphs}>
        <h3 className="font-bold">
          How is Tiny SPL different from normal SPL tokens?
        </h3>
        <p>
          The primary distinction is that Tiny SPL tokens do not require rent
          payments.
        </p>
        <p>
          Additionally, Tiny SPL tokens are not shown in your wallet balance;
          they are visible only in the NFT section.
        </p>
        <div className="text-center">
          <img
            width={320}
            className="mx-auto mb-2 rounded-md"
            src="/assets/tiny-spl-balances.png"
            alt="balances"
          />
          <p className="italic text-sm">
            Balance of a Tiny SPL token named "Deez Nutz" being displayed in the
            NFT section of{" "}
            <Anchor href="https://solflare.com/" target="_blank">
              Solflare
            </Anchor>{" "}
            wallet.
          </p>
        </div>
        <p>
          Balances are divided into multiple parts, necessitating token
          management through our website. For instance, to send 1 DN, you would
          split 125 DN into 124 DN and 1 DN before transferring. Connect your
          wallet to the website for a clearer understanding of Tiny SPL token
          management!
        </p>
      </div>
      <div className={styles.faqParagraphs}>
        <h3 className="font-bold">More questions?</h3>
        <p>
          <Anchor href="https://twitter.com/sol_idity" target="_blank">
            Feel free to hit me up on X (formerly Twitter), my DMs are open for
            any inquiries or assistance.
          </Anchor>
        </p>
      </div>
    </div>
  </>
);
