use anchor_lang::prelude::*;
use anchor_spl::metadata::{mpl_token_metadata, Metadata};

use crate::{
    constants::{CNFT_METADATA_SEED, TINY_SPL_AUTHORITY_SEED},
    error::TinySplError,
    program_wrappers::{MplBubblegum, Noop, SplCompression},
    state::{CnftMetadata, TinySplAuthority},
    utils::{
        burn_cnft, verify_cnft_metadata, get_cnft_metadata_from_account, get_mint_tiny_spl_args,
        get_token_amount, mint_tiny_spl_to_collection, BurnCnft, MintTinySplToCollection,
    },
};

pub fn combine<'info>(
    ctx: Context<'_, '_, '_, 'info, Combine<'info>>,
    asset_id_a: Pubkey,
    asset_id_b: Pubkey,
    root_a: [u8; 32],
    root_b: [u8; 32],
    nonce_a: u64,
    nonce_b: u64,
    index_a: u32,
    index_b: u32,
    asset_a_proof_path_end_index: u32,
) -> Result<()> {
    require!(
        asset_id_a != asset_id_b,
        TinySplError::CannotCombineSameAsset
    );

    let cnft_metadata_account_a = &ctx.accounts.cnft_metadata_a;
    let cnft_metadata_a = get_cnft_metadata_from_account(cnft_metadata_account_a);

    let cnft_metadata_account_b = &ctx.accounts.cnft_metadata_b;
    let cnft_metadata_b = get_cnft_metadata_from_account(cnft_metadata_account_b);

    // check asset a
    let (remaining_accounts_a, remaining_accounts_b) = ctx
        .remaining_accounts
        .split_at(asset_a_proof_path_end_index as usize);

    let (calculated_asset_id_a, data_hash_a, creator_hash_a) = verify_cnft_metadata(
        root_a,
        &cnft_metadata_a,
        nonce_a,
        index_a,
        &ctx.accounts.merkle_tree.to_account_info(),
        &ctx.accounts.leaf_owner.to_account_info(),
        &ctx.accounts.leaf_delegate.to_account_info(),
        &ctx.accounts.collection_mint.to_account_info(),
        &ctx.accounts.compression_program.to_account_info(),
        remaining_accounts_a,
    )?;
    require!(
        calculated_asset_id_a == asset_id_a,
        TinySplError::AssetIdMismatch
    );

    // check asset b
    let (calculated_asset_id_b, data_hash_b, creator_hash_b) = verify_cnft_metadata(
        root_b,
        &cnft_metadata_b,
        nonce_b,
        index_b,
        &ctx.accounts.merkle_tree.to_account_info(),
        &ctx.accounts.leaf_owner.to_account_info(),
        &ctx.accounts.leaf_delegate.to_account_info(),
        &ctx.accounts.collection_mint.to_account_info(),
        &ctx.accounts.compression_program.to_account_info(),
        remaining_accounts_b,
    )?;
    require!(
        calculated_asset_id_b == asset_id_b,
        TinySplError::AssetIdMismatch
    );

    // burn assets a and b
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
        root_a,
        data_hash_a,
        creator_hash_a,
        nonce_a,
        index_a,
        remaining_accounts_a,
    )?;
    burn_cnft(
        &burn_cpi_context,
        root_b,
        data_hash_b,
        creator_hash_b,
        nonce_b,
        index_b,
        remaining_accounts_b,
    )?;

    // mint new cnft
    let collection_metadata = mpl_token_metadata::accounts::Metadata::safe_deserialize(
        ctx.accounts
            .collection_metadata
            .data
            .try_borrow()
            .unwrap()
            .as_ref(),
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

    let collection_mint = ctx.accounts.collection_mint.key().to_string();
    let symbol = collection_metadata.symbol.clone();

    let token_amount_a = get_token_amount(&cnft_metadata_a).unwrap();
    let token_amount_b = get_token_amount(&cnft_metadata_b).unwrap();
    let combined_amount = token_amount_a.checked_add(token_amount_b).unwrap();
    mint_tiny_spl_to_collection(
        &mint_cpi_context,
        get_mint_tiny_spl_args(symbol, combined_amount, collection_mint),
    )?;

    Ok(())
}

#[derive(Accounts)]
#[instruction(asset_id_a: Pubkey, asset_id_b: Pubkey)]
pub struct Combine<'info> {
    #[account(
        seeds = [
            CNFT_METADATA_SEED,
            asset_id_a.as_ref(),
        ],
        bump
    )]
    pub cnft_metadata_a: Box<Account<'info, CnftMetadata>>,
    #[account(
      seeds = [
          CNFT_METADATA_SEED,
          asset_id_b.as_ref(),
      ],
      bump
    )]
    pub cnft_metadata_b: Box<Account<'info, CnftMetadata>>,
    #[account(
        mut,
        constraint = leaf_owner.key() == authority.key()
            || leaf_delegate.key() == authority.key()
    )]
    pub authority: Signer<'info>,
    pub tree_creator_or_delegate: Signer<'info>,
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
