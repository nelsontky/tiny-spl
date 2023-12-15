use anchor_lang::prelude::*;
use anchor_spl::metadata::{mpl_token_metadata, Metadata};

use crate::{
    constants::TINY_SPL_AUTHORITY_SEED,
    state::TinySplAuthority,
    utils::{get_mint_tiny_spl_args, mint_tiny_spl_to_collection, MintTinySplToCollection}, program_wrappers::{Noop, MplBubblegum, SplCompression},
};

pub fn mint_to(ctx: Context<MintTo>, amount: u64) -> Result<()> {
    let collection_metadata = mpl_token_metadata::accounts::Metadata::safe_deserialize(
        ctx.accounts
            .collection_metadata
            .data
            .try_borrow()
            .unwrap()
            .as_ref(),
    )?;

    let mint_pubkey = ctx.accounts.collection_mint.key();
    let seeds: &[&[&[u8]]] = &[&[
        TINY_SPL_AUTHORITY_SEED,
        mint_pubkey.as_ref(),
        &[ctx.bumps.tiny_spl_authority],
    ]];
    let cpi_context = CpiContext::new_with_signer(
        ctx.accounts.mpl_bubblegum_program.to_account_info(),
        MintTinySplToCollection {
            tree_config: ctx.accounts.tree_authority.to_account_info(),
            new_leaf_owner: ctx.accounts.new_leaf_owner.to_account_info(),
            merkle_tree: ctx.accounts.merkle_tree.to_account_info(),
            payer: ctx.accounts.mint_authority.to_account_info(),
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
        &seeds,
    );

    let collection_mint = ctx.accounts.collection_mint.key().to_string();
    let symbol = collection_metadata.symbol;
    mint_tiny_spl_to_collection(
        cpi_context,
        get_mint_tiny_spl_args(symbol, amount, collection_mint),
    )?;

    let tiny_spl_authority = &mut ctx.accounts.tiny_spl_authority;
    tiny_spl_authority.current_supply = tiny_spl_authority
        .current_supply
        .checked_add(amount)
        .unwrap();

    Ok(())
}
#[derive(Accounts)]
pub struct MintTo<'info> {
    #[account(mut)]
    /// CHECK: checked in cpi to bubblegum
    pub tree_authority: UncheckedAccount<'info>,
    /// CHECK: This account is neither written to nor read from.
    pub new_leaf_owner: UncheckedAccount<'info>,
    #[account(mut)]
    /// CHECK: checked in cpi to account compression
    pub merkle_tree: UncheckedAccount<'info>,
    pub mint_authority: Signer<'info>,
    pub tree_creator_or_delegate: Signer<'info>,
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
        mut,
        seeds = [
            TINY_SPL_AUTHORITY_SEED,
            collection_mint.key().as_ref(),
        ],
        bump,
        constraint = tiny_spl_authority.is_verified_tiny_spl_mint
            && tiny_spl_authority.mint_authority == Some(mint_authority.key())
    )]
    pub tiny_spl_authority: Box<Account<'info, TinySplAuthority>>,
    pub log_wrapper: Program<'info, Noop>,
    pub compression_program: Program<'info, SplCompression>,
    pub token_metadata_program: Program<'info, Metadata>,
    pub system_program: Program<'info, System>,
    pub mpl_bubblegum_program: Program<'info, MplBubblegum>,
}
