import {
  Commitment,
  Connection,
  ConnectionConfig,
  PublicKey,
} from "@solana/web3.js";
import BN from "bn.js";
import axios from "axios";

import { TokenStandard } from "@metaplex-foundation/mpl-token-metadata";
import { PROGRAM_ID as BUBBLEGUM_PROGRAM_ID } from "@metaplex-foundation/mpl-bubblegum";

// import from the `@metaplex-foundation/js`
import {
  MetaplexError,
  toBigNumber,
  Pda,
  amount,
} from "@metaplex-foundation/js";
import type {
  SplTokenCurrency,
  Metadata,
  Mint,
  NftOriginalEdition,
  Option,
} from "@metaplex-foundation/js";
import { ConcurrentMerkleTreeAccount } from "@solana/spl-account-compression";

export type JsonRpcParams<ReadApiMethodParams> = {
  method: string;
  id?: string;
  params: ReadApiMethodParams;
};

export type JsonRpcOutput<ReadApiJsonOutput> = {
  result: ReadApiJsonOutput;
};

/** @group Errors */
export class ReadApiError extends MetaplexError {
  readonly name: string = "ReadApiError";
  constructor(message: string, cause?: Error) {
    super(message, "rpc", undefined, cause);
  }
}

/**
 * Convert a ReadApi asset (e.g. compressed NFT) into an NftEdition
 */
export const toNftEditionFromReadApiAsset = (
  input: ReadApiAsset
): NftOriginalEdition => {
  return {
    model: "nftEdition",
    isOriginal: true,
    address: new PublicKey(input.id),
    supply: toBigNumber(input.supply.print_current_supply),
    maxSupply: toBigNumber(input.supply.print_max_supply),
  };
};

/**
 * Convert a ReadApi asset (e.g. compressed NFT) into an NFT mint
 */
export const toMintFromReadApiAsset = (input: ReadApiAsset): Mint => {
  const currency: SplTokenCurrency = {
    symbol: "Token",
    decimals: 0,
    namespace: "spl-token",
  };

  return {
    model: "mint",
    address: new PublicKey(input.id),
    mintAuthorityAddress: new PublicKey(input.id),
    freezeAuthorityAddress: new PublicKey(input.id),
    decimals: 0,
    supply: amount(1, currency),
    isWrappedSol: false,
    currency,
  };
};

/**
 * Convert a ReadApi asset's data into standard Metaplex `Metadata`
 */
export const toMetadataFromReadApiAsset = (input: ReadApiAsset): Metadata => {
  const updateAuthority = input.authorities?.find((authority) =>
    authority.scopes.includes("full")
  );

  const collection = input.grouping.find(
    ({ group_key }) => group_key === "collection"
  );

  return {
    model: "metadata",
    /**
     * We technically don't have a metadata address anymore.
     * So we are using the asset's id as the address
     */
    address: Pda.find(BUBBLEGUM_PROGRAM_ID, [
      Buffer.from("asset", "utf-8"),
      new PublicKey(input.compression.tree).toBuffer(),
      Uint8Array.from(new BN(input.compression.leaf_id).toArray("le", 8)),
    ]),
    mintAddress: new PublicKey(input.id),
    updateAuthorityAddress: new PublicKey(updateAuthority!.address),

    name: input.content.metadata?.name ?? "",
    symbol: input.content.metadata?.symbol ?? "",

    json: input.content.metadata,
    jsonLoaded: true,
    uri: input.content.json_uri,
    isMutable: input.mutable,

    primarySaleHappened: input.royalty.primary_sale_happened,
    sellerFeeBasisPoints: input.royalty.basis_points,
    creators: input.creators,

    editionNonce: input.supply.edition_nonce,
    tokenStandard: TokenStandard.NonFungible,

    collection: collection
      ? { address: new PublicKey(collection.group_value), verified: false }
      : null,

    // Current regular `Metadata` does not currently have a `compression` value
    // @ts-ignore
    compression: input.compression,

    // Read API doesn't return this info, yet
    collectionDetails: null,
    // Read API doesn't return this info, yet
    uses: null,
    // Read API doesn't return this info, yet
    programmableConfig: null,
  };
};

/**
 * Wrapper class to add additional methods on top the standard Connection from `@solana/web3.js`
 * Specifically, adding the RPC methods used by the Digital Asset Standards (DAS) ReadApi
 * for state compression and compressed NFTs
 */
export class WrapperConnection extends Connection {
  constructor(
    endpoint: string,
    commitmentOrConfig?: Commitment | ConnectionConfig
  ) {
    super(endpoint, commitmentOrConfig);
  }

  private callReadApi = async <ReadApiMethodParams, ReadApiJsonOutput>(
    jsonRpcParams: JsonRpcParams<ReadApiMethodParams>
  ): Promise<JsonRpcOutput<ReadApiJsonOutput>> => {
    const response = await axios.post(this.rpcEndpoint, {
      jsonrpc: "2.0",
      method: jsonRpcParams.method,
      id: jsonRpcParams.id ?? "rpd-op-123",
      params: jsonRpcParams.params,
    });

    return response.data;
  };

  // Asset id can be calculated via Bubblegum#getLeafAssetId
  // It is a PDA with the following seeds: ["asset", tree, leafIndex]
  async getAsset(assetId: PublicKey): Promise<ReadApiAsset> {
    const { result: asset } = await this.callReadApi<
      GetAssetRpcInput,
      ReadApiAsset
    >({
      method: "getAsset",
      params: {
        id: assetId.toBase58(),
      },
    });

    if (!asset) throw new ReadApiError("No asset returned");

    return asset;
  }

  // Asset id can be calculated via Bubblegum#getLeafAssetId
  // It is a PDA with the following seeds: ["asset", tree, leafIndex]
  async getAssetProof(assetId: PublicKey): Promise<GetAssetProofRpcResponse> {
    const { result: proof } = await this.callReadApi<
      GetAssetProofRpcInput,
      GetAssetProofRpcResponse
    >({
      method: "getAssetProof",
      params: {
        id: assetId.toBase58(),
      },
    });

    if (!proof) throw new ReadApiError("No asset proof returned");

    return proof;
  }

  //
  async getAssetsByGroup({
    groupKey,
    groupValue,
    page,
    limit,
    sortBy,
    before,
    after,
  }: GetAssetsByGroupRpcInput): Promise<ReadApiAssetList> {
    // `page` cannot be supplied with `before` or `after`
    if (typeof page == "number" && (before || after))
      throw new ReadApiError(
        "Pagination Error. Only one pagination parameter supported per query."
      );

    // a pagination method MUST be selected, but we are defaulting to using `page=0`

    const { result } = await this.callReadApi<
      GetAssetsByGroupRpcInput,
      ReadApiAssetList
    >({
      method: "getAssetsByGroup",
      params: {
        groupKey,
        groupValue,
        after: after ?? null,
        before: before ?? null,
        limit: limit ?? null,
        page: page ?? 1,
        sortBy: sortBy ?? null,
      },
    });

    if (!result) throw new ReadApiError("No results returned");

    return result;
  }

  //
  async getAssetsByOwner({
    ownerAddress,
    page,
    limit,
    sortBy,
    before,
    after,
  }: GetAssetsByOwnerRpcInput): Promise<ReadApiAssetList> {
    // `page` cannot be supplied with `before` or `after`
    if (typeof page == "number" && (before || after))
      throw new ReadApiError(
        "Pagination Error. Only one pagination parameter supported per query."
      );

    // a pagination method MUST be selected, but we are defaulting to using `page=0`

    const { result } = await this.callReadApi<
      GetAssetsByOwnerRpcInput,
      ReadApiAssetList
    >({
      method: "getAssetsByOwner",
      params: {
        ownerAddress,
        after: after ?? null,
        before: before ?? null,
        limit: limit ?? null,
        page: page ?? 1,
        sortBy: sortBy ?? null,
      },
    });

    if (!result) throw new ReadApiError("No results returned");

    return result;
  }
}

/*
  Types specific to the ReadApi
*/

export type ReadApiAssetInterface =
  | "V1_NFT"
  | "V1_PRINT"
  | "LEGACY_NFT"
  | "V2_NFT"
  | "FungibleAsset"
  | "Custom"
  | "Identity"
  | "Executable"
  | "ProgrammableNFT";

export type ReadApiPropGroupKey = "collection";

export type ReadApiPropSortBy = "created" | "updated" | "recent_action";

export type ReadApiPropSortDirection = "asc" | "desc";

export type TransferNftCompressionParam = {
  ownership?: ReadApiOwnershipMetadata;
  data?: ReadApiCompressionMetadata;
  assetProof?: GetAssetProofRpcResponse;
  merkleTree?: ConcurrentMerkleTreeAccount;
};

export type ReadApiParamAssetSortBy = {
  sortBy: ReadApiPropSortBy;
  sortDirection: ReadApiPropSortDirection;
};

export type ReadApiAssetContent = {
  json_uri: string;
  metadata: Metadata["json"];
};

export type ReadApiCompressionMetadata = {
  eligible: boolean;
  compressed: boolean;
  data_hash: string;
  creator_hash: string;
  asset_hash: string;
  tree: string;
  seq: number;
  leaf_id: number;
};

export type ReadApiOwnershipMetadata = {
  frozen: boolean;
  delegated: boolean;
  delegate: string | null;
  owner: string;
  ownership_model: "single" | "token";
};

export type ReadApiAssetSupplyMetadata = {
  edition_nonce: number;
  print_current_supply: number;
  print_max_supply: number;
};

export type ReadApiAssetRoyaltyMetadata = {
  primary_sale_happened: boolean;
  basis_points: number;
};

export type ReadApiAssetGrouping = {
  group_key: ReadApiPropGroupKey;
  group_value: string;
};

export type ReadApiAuthorityScope = "full";

export type ReadApiAssetAuthority = {
  address: string;
  scopes: ReadApiAuthorityScope[];
};

export type GetAssetRpcInput = {
  id: string;
};

export type GetAssetProofRpcInput = {
  id: string;
};

export type GetAssetProofRpcResponse = {
  root: string;
  proof: string[];
  node_index: number;
  leaf: string;
  tree_id: string;
};

export type GetAssetsByGroupRpcInput = {
  groupKey: ReadApiPropGroupKey;
  groupValue: string;
  page?: Option<number>;
  limit?: Option<number>;
  /* assetId to search before */
  before?: Option<string>;
  /* assetId to search after */
  after?: Option<string>;
  sortBy?: Option<ReadApiParamAssetSortBy>;
};

export type GetAssetsByOwnerRpcInput = {
  /**
   * String of the owner's PublicKey address
   */
  ownerAddress: string;
  page?: Option<number>;
  limit?: Option<number>;
  before?: Option<string>;
  after?: Option<string>;
  sortBy?: Option<ReadApiParamAssetSortBy>;
};

export type ReadApiAsset = {
  /**
   * The asset Id
   */
  id: string;
  interface: ReadApiAssetInterface;
  ownership: ReadApiOwnershipMetadata;
  mutable: boolean;
  authorities: Array<ReadApiAssetAuthority>;
  content: ReadApiAssetContent;
  royalty: ReadApiAssetRoyaltyMetadata;
  supply: ReadApiAssetSupplyMetadata;
  creators: Metadata["creators"];
  grouping: Array<ReadApiAssetGrouping>;
  compression: ReadApiCompressionMetadata;
};

export type ReadApiAssetList = {
  total: number;
  limit: number;

  /**
   * listing of individual assets, and their associated metadata
   */
  items: Array<ReadApiAsset>;

  /**
   * `page` is only provided when using page based pagination, as apposed
   * to asset id before/after based pagination
   */
  page: Option<number>;

  /**
   * asset Id searching before
   */
  before: Option<string>;

  /**
   * asset Id searching after
   */
  after: Option<string>;

  /**
   * listing of errors provided by the ReadApi RPC
   */
  errors: Option<ReadApiRpcResponseError[]>;
};

export type ReadApiRpcResponseError = {
  error: string;
  id: string;
};
