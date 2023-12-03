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
    #[msg("Passed in asset id does not match the asset id derived from the merkle tree and index")]
    AssetIdMismatch,
}
