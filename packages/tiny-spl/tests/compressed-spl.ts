import * as anchor from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import {
  PROGRAM,
  SIGNER,
  TINY_SPL_AUTHORITY_SEED,
  TOKEN_MINT_KEY,
  TREE_ID,
  WRONG_AUTHORITY,
} from "../scripts/constants";
import { PROGRAM_ID as BUBBLEGUM_PROGRAM_ID } from "@metaplex-foundation/mpl-bubblegum";
import {
  PROGRAM_ID as COMPRESSION_PROGRAM_ID,
  SPL_NOOP_PROGRAM_ID,
} from "@solana/spl-account-compression";
import { assert, expect } from "chai";
import { sendAndConfirmIxs } from "../scripts/sendAndConfirmIxs";

const mplTokenMetadataProgramId = new PublicKey(
  "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
);
const [treeAuthority] = PublicKey.findProgramAddressSync(
  [TREE_ID.toBuffer()],
  BUBBLEGUM_PROGRAM_ID
);
const mint = TOKEN_MINT_KEY.publicKey;
const [metadata] = PublicKey.findProgramAddressSync(
  [
    Buffer.from("metadata"),
    mplTokenMetadataProgramId.toBuffer(),
    mint.toBuffer(),
  ],
  mplTokenMetadataProgramId
);
const [masterEdition] = PublicKey.findProgramAddressSync(
  [
    Buffer.from("metadata"),
    mplTokenMetadataProgramId.toBuffer(),
    mint.toBuffer(),
    Buffer.from("edition"),
  ],
  mplTokenMetadataProgramId
);
const [bubblegumSigner] = PublicKey.findProgramAddressSync(
  [Buffer.from("collection_cpi")],
  BUBBLEGUM_PROGRAM_ID
);
const [tinySplAuthority] = PublicKey.findProgramAddressSync(
  [Buffer.from(TINY_SPL_AUTHORITY_SEED), mint.toBuffer()],
  PROGRAM.programId
);

describe("tiny-spl", () => {
  anchor.setProvider(anchor.AnchorProvider.env());

  it("should fail when invalid mint authority tries to mint", async () => {
    const ix = await PROGRAM.methods
      .mintTo(new anchor.BN(Number.MAX_SAFE_INTEGER))
      .accounts({
        bubblegumSigner,
        collectionMetadata: metadata,
        collectionMint: mint,
        tinySplAuthority,
        compressionProgram: COMPRESSION_PROGRAM_ID,
        editionAccount: masterEdition,
        leafDelegate: SIGNER.publicKey,
        leafOwner: SIGNER.publicKey,
        logWrapper: SPL_NOOP_PROGRAM_ID,
        merkleTree: TREE_ID,
        mintAuthority: WRONG_AUTHORITY.publicKey,
        mplBubblegumProgram: BUBBLEGUM_PROGRAM_ID,
        tokenMetadataProgram: mplTokenMetadataProgramId,
        treeAuthority,
      })
      .instruction();

    const result = await sendAndConfirmIxs(
      [ix],
      WRONG_AUTHORITY.publicKey,
      [WRONG_AUTHORITY],
      true
    );

    const errorCode = (result.value?.err as any).InstructionError[1].Custom;
    expect(errorCode).to.equal(2003);
  });

  it("should allow mint authority to mint tokens", async () => {
    const MINT_COUNT = new anchor.BN(3);

    const prevSupply = (
      await PROGRAM.account.tinySplAuthority.fetch(
        tinySplAuthority,
        "confirmed"
      )
    ).currentSupply;

    const ix = await PROGRAM.methods
      .mintTo(MINT_COUNT)
      .accounts({
        bubblegumSigner,
        collectionMetadata: metadata,
        collectionMint: mint,
        tinySplAuthority,
        compressionProgram: COMPRESSION_PROGRAM_ID,
        editionAccount: masterEdition,
        leafDelegate: SIGNER.publicKey,
        leafOwner: SIGNER.publicKey,
        logWrapper: SPL_NOOP_PROGRAM_ID,
        merkleTree: TREE_ID,
        mintAuthority: SIGNER.publicKey,
        mplBubblegumProgram: BUBBLEGUM_PROGRAM_ID,
        tokenMetadataProgram: mplTokenMetadataProgramId,
        treeAuthority,
      })
      .instruction();

    await sendAndConfirmIxs([ix], SIGNER.publicKey, [SIGNER]);

    const currentSupply = (
      await PROGRAM.account.tinySplAuthority.fetch(
        tinySplAuthority,
        "confirmed"
      )
    ).currentSupply;

    assert(currentSupply.eq(prevSupply.add(MINT_COUNT)));
  });
});
