use anchor_lang::prelude::*;

use crate::{
    constants::{CNFT_METADATA_SEED, MAX_METADATA_LEN},
    state::CnftMetadata,
    utils::check_cnft_owner,
};

pub fn upload_cnft_metadata<'info>(
    ctx: Context<'_, '_, '_, 'info, UploadCnftMetadata<'info>>,
    root: [u8; 32],
    cnft_metadata: CnftMetadata,
    nonce: u64,
    index: u32,
) -> Result<()> {
    check_cnft_owner(
        root,
        &cnft_metadata,
        nonce,
        index,
        &ctx.accounts.merkle_tree.to_account_info(),
        &ctx.accounts.leaf_owner.to_account_info(),
        &ctx.accounts.leaf_delegate.to_account_info(),
        &ctx.accounts.compression_program.to_account_info(),
        &ctx.remaining_accounts
    )?;

    let cnft_metadata = &mut ctx.accounts.cnft_metadata;
    cnft_metadata.name = cnft_metadata.name.clone();
    cnft_metadata.symbol = cnft_metadata.symbol.clone();
    cnft_metadata.uri = cnft_metadata.uri.clone();
    cnft_metadata.seller_fee_basis_points = cnft_metadata.seller_fee_basis_points;
    cnft_metadata.primary_sale_happened = cnft_metadata.primary_sale_happened;
    cnft_metadata.is_mutable = cnft_metadata.is_mutable;
    cnft_metadata.edition_nonce = cnft_metadata.edition_nonce;
    cnft_metadata.token_standard = cnft_metadata.token_standard.clone();
    cnft_metadata.collection = cnft_metadata.collection.clone();
    cnft_metadata.uses = cnft_metadata.uses.clone();
    cnft_metadata.token_program_version = cnft_metadata.token_program_version.clone();
    cnft_metadata.creators = cnft_metadata.creators.clone();
    cnft_metadata.cnft_metadata_account_creator = ctx.accounts.cnft_metadata_account_creator.key();

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
    /// CHECK: This account is checked in cpi
    pub merkle_tree: UncheckedAccount<'info>,
    pub system_program: Program<'info, System>,
    /// CHECK: This account is checked in account constraint
    #[account(address = spl_account_compression::id())]
    pub compression_program: UncheckedAccount<'info>,
}
