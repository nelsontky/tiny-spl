use anchor_lang::prelude::*;
use anchor_spl::metadata::{mpl_token_metadata, Metadata};

use crate::{
    constants::TINY_SPL_AUTHORITY_SEED,
    error::TinySplError,
    program_wrappers::{MplBubblegum, Noop, SplCompression},
    state::TinySplAuthority,
    utils::{
        burn_cnft, get_tiny_spl_metadata, mint_tiny_spl_to_collection, verify_cnft_metadata,
        verify_token_splits, BurnCnft, MintTinySplToCollection,
    },
};

pub fn split<'info>(
    ctx: Context<'_, '_, '_, 'info, Split<'info>>,
    source_amount: u64,
    asset_id: Pubkey,
    root: [u8; 32],
    nonce: u64,
    index: u32,
    destination_amounts: Vec<u64>,
) -> Result<()> {
    verify_token_splits(source_amount, &destination_amounts)?;

    let collection_metadata = mpl_token_metadata::accounts::Metadata::safe_deserialize(
        ctx.accounts
            .collection_metadata
            .data
            .try_borrow()
            .unwrap()
            .as_ref(),
    )?;
    let cnft_metadata = get_tiny_spl_metadata(
        collection_metadata.symbol.clone(),
        source_amount,
        ctx.accounts.collection_mint.key(),
        ctx.accounts.tiny_spl_authority.key(),
    );

    let (calculated_asset_id, data_hash, creator_hash) = verify_cnft_metadata(
        root,
        &cnft_metadata,
        nonce,
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

    let burn_cpi_context = CpiContext::new(
        ctx.accounts.mpl_bubblegum_program.to_account_info(),
        BurnCnft {
            tree_authority: ctx.accounts.tree_authority.to_account_info(),
            leaf_owner: ctx.accounts.leaf_owner.to_account_info(),
            leaf_delegate: ctx.accounts.leaf_delegate.to_account_info(),
            merkle_tree: ctx.accounts.merkle_tree.to_account_info(),
            log_wrapper: ctx.accounts.log_wrapper.to_account_info(),
            compression_program: ctx.accounts.compression_program.to_account_info(),
            system_program: ctx.accounts.system_program.to_account_info(),
        },
    );
    burn_cnft(
        &burn_cpi_context,
        root,
        data_hash,
        creator_hash,
        nonce,
        index,
        ctx.remaining_accounts,
    )?;

    let mint_pubkey = ctx.accounts.collection_mint.key();
    let tiny_spl_seeds: &[&[&[u8]]] = &[&[
        TINY_SPL_AUTHORITY_SEED,
        mint_pubkey.as_ref(),
        &[ctx.bumps.tiny_spl_authority],
    ]];
    let mint_cpi_context = CpiContext::new_with_signer(
        ctx.accounts.mpl_bubblegum_program.to_account_info(),
        MintTinySplToCollection {
            tree_config: ctx.accounts.tree_authority.to_account_info(),
            new_leaf_owner: ctx.accounts.new_leaf_owner.to_account_info(),
            merkle_tree: ctx.accounts.merkle_tree.to_account_info(),
            payer: ctx.accounts.authority.to_account_info(),
            tree_creator_or_delegate: ctx.accounts.tree_creator_or_delegate.to_account_info(),
            collection_mint: ctx.accounts.collection_mint.to_account_info(),
            collection_metadata: ctx.accounts.collection_metadata.to_account_info(),
            collection_edition: ctx.accounts.edition_account.to_account_info(),
            bubblegum_signer: ctx.accounts.bubblegum_signer.to_account_info(),
            tiny_spl_authority: ctx.accounts.tiny_spl_authority.to_account_info(),
            log_wrapper: ctx.accounts.log_wrapper.to_account_info(),
            compression_program: ctx.accounts.compression_program.to_account_info(),
            system_program: ctx.accounts.system_program.to_account_info(),
            token_metadata_program: ctx.accounts.token_metadata_program.to_account_info(),
        },
        &tiny_spl_seeds,
    );
    for amount in destination_amounts {
        mint_tiny_spl_to_collection(
            &mint_cpi_context,
            get_tiny_spl_metadata(
                collection_metadata.symbol.clone(),
                amount,
                ctx.accounts.collection_mint.key(),
                ctx.accounts.tiny_spl_authority.key(),
            ),
        )?;
    }
    Ok(())
}

#[derive(Accounts)]
pub struct Split<'info> {
    #[account(
        mut,
        constraint = leaf_owner.key() == authority.key()
            || leaf_delegate.key() == authority.key()
    )]
    pub authority: Signer<'info>,
    /// CHECK: This account is checked in CPI
    pub tree_creator_or_delegate: UncheckedAccount<'info>,
    /// CHECK: This account is checked in instruction
    pub leaf_owner: UncheckedAccount<'info>,
    /// CHECK: This account is checked in instruction
    pub leaf_delegate: UncheckedAccount<'info>,
    /// CHECK: This account is checked in cpi
    pub new_leaf_owner: UncheckedAccount<'info>,
    /// CHECK: checked in cpi to bubblegum
    pub collection_mint: UncheckedAccount<'info>,
    #[account(mut)]
    /// CHECK: checked in cpi to bubblegum
    pub collection_metadata: UncheckedAccount<'info>,
    /// CHECK: checked in cpi to bubblegum
    pub edition_account: UncheckedAccount<'info>,
    /// CHECK: checked in cpi to bubblegum
    pub bubblegum_signer: UncheckedAccount<'info>,
    #[account(
        seeds = [
            TINY_SPL_AUTHORITY_SEED,
            collection_mint.key().as_ref(),
        ],
        bump,
        constraint = tiny_spl_authority.is_verified_tiny_spl_mint
    )]
    pub tiny_spl_authority: Box<Account<'info, TinySplAuthority>>,
    #[account(mut)]
    /// CHECK: checked in cpi to bubblegum
    pub tree_authority: UncheckedAccount<'info>,
    /// CHECK: This account is checked in cpi
    #[account(mut)]
    pub merkle_tree: UncheckedAccount<'info>,
    pub log_wrapper: Program<'info, Noop>,
    pub compression_program: Program<'info, SplCompression>,
    pub token_metadata_program: Program<'info, Metadata>,
    pub system_program: Program<'info, System>,
    pub mpl_bubblegum_program: Program<'info, MplBubblegum>,
}
