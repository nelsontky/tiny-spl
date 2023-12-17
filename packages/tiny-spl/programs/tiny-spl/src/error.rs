use anchor_lang::prelude::*;

#[error_code]
pub enum TinySplError {
    #[msg("Mint account is not empty")]
    MintAccountNotEmpty,
    #[msg("Metadata account is not empty")]
    MetadataAccountNotEmpty,
    #[msg("Master edition account is not empty")]
    MasterEditionAccountNotEmpty,
    #[msg("Leaf authority must sign")]
    LeafAuthorityMustSign,
    #[msg("Passed in collection mint does not match the collection mint of token")]
    CollectionMismatch,
    #[msg("Passed in asset id does not match the asset id derived from the merkle tree and index")]
    AssetIdMismatch,
    #[msg("Invalid split amounts supplied")]
    InvalidSplitAmounts,
    #[msg("Cannot combine more than 1 of the same asset")]
    CannotCombineSameAsset,
    #[msg("Different number of parameters supplied for combining")]
    InvalidCombineParameters,
}
