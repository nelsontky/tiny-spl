use anchor_lang::prelude::*;

use crate::{
    constants::{CNFT_METADATA_SEED, MAX_METADATA_LEN, TINY_SPL_AUTHORITY_SEED},
    state::{CnftMetadata, TinySplAuthority},
    utils::check_cnft, error::TinySplError,
};

pub fn upload_cnft_metadata<'info>(
    ctx: Context<'_, '_, '_, 'info, UploadCnftMetadata<'info>>,
    asset_id: Pubkey,
    root: [u8; 32],
    cnft_metadata: CnftMetadata,
    nonce: u64,
    index: u32,
) -> Result<()> {
   let calculated_asset_id = check_cnft(
        root,
        &cnft_metadata,
        nonce,
        index,
        &ctx.accounts.merkle_tree.to_account_info(),
        &ctx.accounts.leaf_owner.to_account_info(),
        &ctx.accounts.leaf_delegate.to_account_info(),
        &ctx.accounts.collection_mint.to_account_info(),
        &ctx.accounts.compression_program.to_account_info(),
        &ctx.remaining_accounts
    )?.0;

    require!(calculated_asset_id == asset_id, TinySplError::AssetIdMismatch);

    let cnft_metadata_account = &mut ctx.accounts.cnft_metadata;
    cnft_metadata_account.name = cnft_metadata.name.clone();
    cnft_metadata_account.symbol = cnft_metadata.symbol.clone();
    cnft_metadata_account.uri = cnft_metadata.uri.clone();
    cnft_metadata_account.seller_fee_basis_points = cnft_metadata.seller_fee_basis_points;
    cnft_metadata_account.primary_sale_happened = cnft_metadata.primary_sale_happened;
    cnft_metadata_account.is_mutable = cnft_metadata.is_mutable;
    cnft_metadata_account.edition_nonce = cnft_metadata.edition_nonce;
    cnft_metadata_account.token_standard = cnft_metadata.token_standard.clone();
    cnft_metadata_account.collection = cnft_metadata.collection.clone();
    cnft_metadata_account.uses = cnft_metadata.uses.clone();
    cnft_metadata_account.token_program_version = cnft_metadata.token_program_version.clone();
    cnft_metadata_account.creators = cnft_metadata.creators.clone();
    cnft_metadata_account.cnft_metadata_account_creator = ctx.accounts.cnft_metadata_account_creator.key();

    Ok(())
}

#[derive(Accounts)]
#[instruction(asset_id: Pubkey)]
pub struct UploadCnftMetadata<'info> {
    #[account(
        init_if_needed,
        payer = cnft_metadata_account_creator,
        space = 8 + MAX_METADATA_LEN + 32,
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
    #[account(
        mut, 
        constraint = cnft_metadata_account_creator.key() == leaf_owner.key()
            || cnft_metadata_account_creator.key() == leaf_delegate.key())
    ]
    pub cnft_metadata_account_creator: Signer<'info>,
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
    pub system_program: Program<'info, System>,
    /// CHECK: This account is checked in account constraint
    #[account(address = spl_account_compression::id())]
    pub compression_program: UncheckedAccount<'info>,
}
