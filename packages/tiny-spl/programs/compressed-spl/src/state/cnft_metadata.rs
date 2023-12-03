use anchor_lang::prelude::*;

#[account]
pub struct CnftMetadata {
    pub name: String,
    pub symbol: String,
    pub uri: String,
    pub seller_fee_basis_points: u16,
    pub primary_sale_happened: bool,
    pub is_mutable: bool,
    pub edition_nonce: Option<u8>,
    pub token_standard: Option<TokenStandard>,
    pub collection: Option<Collection>,
    pub uses: Option<Uses>,
    pub token_program_version: TokenProgramVersion,
    pub creators: Vec<Creator>,
    pub cnft_metadata_account_creator: Pubkey,
}

#[derive(AnchorDeserialize, AnchorSerialize, Clone)]
pub enum TokenStandard {
    NonFungible,
    FungibleAsset,
    Fungible,
    NonFungibleEdition,
}

#[derive(AnchorDeserialize, AnchorSerialize, Clone)]
pub enum TokenProgramVersion {
    Original,
    Token2022,
}

#[derive(AnchorDeserialize, AnchorSerialize, Clone)]
pub struct Collection {
    pub verified: bool,
    pub key: Pubkey,
}

#[derive(AnchorDeserialize, AnchorSerialize, Clone)]
pub struct Uses {
    pub use_method: UseMethod,
    pub remaining: u64,
    pub total: u64,
}

#[derive(AnchorDeserialize, AnchorSerialize, Clone)]
pub enum UseMethod {
    Burn,
    Multiple,
    Single,
}

#[derive(AnchorDeserialize, AnchorSerialize, Clone)]
pub struct Creator {
    pub address: Pubkey,
    pub verified: bool,
    pub share: u8,
}
