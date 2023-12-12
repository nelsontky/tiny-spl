use crate::state::CnftMetadata;
use anchor_lang::prelude::*;

pub fn get_cnft_metadata_from_account<'info>(
    cnft_metadata_account: &Account<'info, CnftMetadata>,
) -> CnftMetadata {
    CnftMetadata {
        name: cnft_metadata_account.name.clone(),
        symbol: cnft_metadata_account.symbol.clone(),
        uri: cnft_metadata_account.uri.clone(),
        seller_fee_basis_points: cnft_metadata_account.seller_fee_basis_points,
        primary_sale_happened: cnft_metadata_account.primary_sale_happened,
        is_mutable: cnft_metadata_account.is_mutable,
        edition_nonce: cnft_metadata_account.edition_nonce,
        token_standard: cnft_metadata_account.token_standard.clone(),
        collection: cnft_metadata_account.collection.clone(),
        uses: cnft_metadata_account.uses.clone(),
        token_program_version: cnft_metadata_account.token_program_version.clone(),
        creators: cnft_metadata_account.creators.clone(),
        cnft_metadata_account_creator: cnft_metadata_account.cnft_metadata_account_creator,
    }
}
