use std::collections::HashSet;

use anchor_lang::prelude::*;
use anchor_spl::metadata::{mpl_token_metadata, Metadata};

use crate::{
    constants::TINY_SPL_AUTHORITY_SEED,
    error::TinySplError,
    program_wrappers::{MplBubblegum, Noop, SplCompression},
    state::TinySplAuthority,
    utils::{
        burn_cnft, get_tiny_spl_metadata, mint_tiny_spl_to_collection, verify_cnft_metadata,
        BurnCnft, MintTinySplToCollection,
    },
};

pub fn combine<'info>(
    ctx: Context<'_, '_, '_, 'info, Combine<'info>>,
    amounts: Vec<u64>,
    asset_ids: Vec<Pubkey>,
    roots: Vec<[u8; 32]>,
    nonces: Vec<u64>,
    indexes: Vec<u32>,
    proof_path_end_indexes_exclusive: Vec<u32>,
) -> Result<()> {
    require!(
        amounts.len() == asset_ids.len()
            && amounts.len() == roots.len()
            && amounts.len() == nonces.len()
            && amounts.len() == indexes.len()
            && amounts.len() == proof_path_end_indexes_exclusive.len(),
        TinySplError::InvalidCombineParameters
    );

    let mut asset_id_set = HashSet::new();
    asset_ids.iter().for_each(|x| {
        asset_id_set.insert(x);
    });
    require!(
        asset_id_set.len() == asset_ids.len(),
        TinySplError::CannotCombineSameAsset
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

    let collection_metadata = mpl_token_metadata::accounts::Metadata::safe_deserialize(
        ctx.accounts
            .collection_metadata
            .data
            .try_borrow()
            .unwrap()
            .as_ref(),
    )?;
    for (i, asset_id) in asset_ids.iter().enumerate() {
        let amount = amounts[i];
        let root = roots[i];
        let nonce = nonces[i];
        let index = indexes[i];
        let proof_path_end_index_exclusive = proof_path_end_indexes_exclusive[i];
        let proof_path_start_index = if i == 0 {
            0
        } else {
            proof_path_end_indexes_exclusive[i - 1]
        };
        let remaining_accounts = &ctx.remaining_accounts[proof_path_start_index.try_into().unwrap()
            ..proof_path_end_index_exclusive.try_into().unwrap()];

        let cnft_metadata = get_tiny_spl_metadata(
            collection_metadata.symbol.clone(),
            amount,
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
            remaining_accounts,
        )?;

        require!(
            calculated_asset_id == *asset_id,
            TinySplError::AssetIdMismatch
        );

        burn_cnft(
            &burn_cpi_context,
            root,
            data_hash,
            creator_hash,
            nonce,
            index,
            remaining_accounts,
        )?;
    }

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

    let mut total_amount: u64 = 0;
    for amount in amounts.iter() {
        total_amount = total_amount.checked_add(*amount).unwrap();
    }

    mint_tiny_spl_to_collection(
        &mint_cpi_context,
        get_tiny_spl_metadata(
            collection_metadata.symbol,
            total_amount,
            ctx.accounts.collection_mint.key(),
            ctx.accounts.tiny_spl_authority.key(),
        ),
    )?;

    Ok(())
}

#[derive(Accounts)]
pub struct Combine<'info> {
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
