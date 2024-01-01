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
          Tiny SPL allows you to own tokens on Solana without paying for rent.
        </p>
        <p>
          Traditionally, token balances are stored on-chain. Keeping this data
          on-chain takes up space, so Solana charges a "rent" fee of ~0.002 SOL
          for the storage. i.e. you paid ~0.002 SOL to store information about
          how much BONK your wallet owns on-chain.
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
          The main difference that we've already mentioned is that Tiny SPL
          tokens don't require you to pay rent to own your token.
        </p>
        <p>
          More importantly, Tiny SPL tokens are not shown in your wallet
          balance. They can only be seen in the NFT section of your wallet.
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
          Another thing you might have noticed is that the balance of the token
          is split up into multiple balances. This is another main difference of
          Tiny SPL tokens, to fully manage your token balances, you will have to
          split/combine the tokens via this website. For example, if I wanted to
          send 1 DN to my friend, I have to split my 125 DN into 124 DN and 1
          DN, then send the 1 DN to my friend.
        </p>
        <p>
          Connect your wallet to this website and it will be very clear how you
          can combine/split your tokens :)
        </p>
      </div>
      <div className={styles.faqParagraphs}>
        <h3 className="font-bold">More questions?</h3>
        <p>
          <Anchor href="https://twitter.com/sol_idity" target="_blank">
            Feel free to hit me up on X (formerly Twitter), my DMs are open :)
          </Anchor>
        </p>
      </div>
    </div>
  </>
);
