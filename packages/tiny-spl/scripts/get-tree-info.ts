import { ConcurrentMerkleTreeAccount } from "@solana/spl-account-compression";
import { CONNECTION, TREE_ID } from "./constants";

export async function getTreeInfo() {
  const treeAccount = await ConcurrentMerkleTreeAccount.fromAccountAddress(
    CONNECTION,
    TREE_ID
  );

  console.log(
    treeAccount.getCanopyDepth().toString(),
    treeAccount.getMaxDepth().toString(),
    treeAccount.getMaxBufferSize().toString()
  );
}

getTreeInfo();