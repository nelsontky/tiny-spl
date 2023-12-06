use anchor_lang::prelude::*;

use crate::{
    constants::{CNFT_METADATA_SEED, TINY_SPL_AUTHORITY_SEED},
    error::TinySplError,
    state::{CnftMetadata, TinySplAuthority},
    utils::check_cnft,
};

pub fn split<'info>(
    ctx: Context<'_, '_, '_, 'info, Transfer<'info>>,
    asset_id: Pubkey,
    root: [u8; 32],
    index: u64,
    amounts: Vec<u64>,
) -> Result<()> {
    let cnft_metadata_account = &ctx.accounts.cnft_metadata;
    let cnft_metadata = CnftMetadata {
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
    };

    let calculated_asset_id = check_cnft(
        root,
        &cnft_metadata,
        index,
        &ctx.accounts.merkle_tree.to_account_info(),
        &ctx.accounts.leaf_owner.to_account_info(),
        &ctx.accounts.leaf_delegate.to_account_info(),
        &ctx.accounts.collection_mint.to_account_info(),
        &ctx.accounts.compression_program.to_account_info(),
        &ctx.remaining_accounts,
    )?;
    require!(
        calculated_asset_id == asset_id,
        TinySplError::AssetIdMismatch
    );

    Ok(())
}

#[derive(Accounts)]
#[instruction(asset_id: Pubkey)]
pub struct Transfer<'info> {
    #[account(
        seeds = [
            CNFT_METADATA_SEED,
            asset_id.as_ref(),
        ],
        bump
    )]
    pub cnft_metadata: Box<Account<'info, CnftMetadata>>,
    /// CHECK: This account is checked in instruction
    pub leaf_owner: AccountInfo<'info>,
    /// CHECK: This account is checked in instruction
    pub leaf_delegate: AccountInfo<'info>,
    /// CHECK: This account is checked in cpi
    pub new_leaf_owner: AccountInfo<'info>,
    /// CHECK: only used to verify tiny_spl_authority seeds
    pub collection_mint: UncheckedAccount<'info>,
    #[account(
        seeds = [
            TINY_SPL_AUTHORITY_SEED,
            collection_mint.key().as_ref(),
        ],
        bump,
        constraint = tiny_spl_authority.is_verified_tiny_spl_mint
    )]
    pub tiny_spl_authority: Box<Account<'info, TinySplAuthority>>,
    /// CHECK: This account is checked in cpi
    pub merkle_tree: UncheckedAccount<'info>,
    /// CHECK: This account is checked in account constraint
    #[account(address = spl_account_compression::id())]
    pub compression_program: UncheckedAccount<'info>,
}
