use anchor_lang::prelude::*;
use anchor_spl::metadata::{mpl_token_metadata, Metadata};

use crate::{
    constants::{CNFT_METADATA_SEED, TINY_SPL_AUTHORITY_SEED},
    error::TinySplError,
    noop::Noop,
    state::{CnftMetadata, TinySplAuthority},
    utils::{
        burn_cnft, check_cnft, get_mint_tiny_spl_args, mint_tiny_spl_to_collection,
        verify_token_splits, BurnCnft, MintTinySplToCollection,
    },
};

pub fn split<'info>(
    ctx: Context<'_, '_, '_, 'info, Transfer<'info>>,
    asset_id: Pubkey,
    root: [u8; 32],
    nonce: u64,
    index: u32,
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

    let (calculated_asset_id, data_hash, creator_hash) = check_cnft(
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

    verify_token_splits(&cnft_metadata, &amounts)?;

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
        burn_cpi_context,
        root,
        data_hash,
        creator_hash,
        nonce,
        index,
        ctx.remaining_accounts
    )?;

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
    for amount in amounts {
        let mint_cpi_context = CpiContext::new_with_signer(
            ctx.accounts.mpl_bubblegum_program.to_account_info(),
            MintTinySplToCollection {
                tree_config: ctx.accounts.tree_authority.to_account_info(),
                new_leaf_owner: ctx.accounts.new_leaf_owner.to_account_info(),
                merkle_tree: ctx.accounts.merkle_tree.to_account_info(),
                payer: ctx.accounts.leaf_owner.to_account_info(),
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
        mint_tiny_spl_to_collection(
            mint_cpi_context,
            get_mint_tiny_spl_args(symbol, amount, collection_mint),
        )?;
    }
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
    #[account(
        mut,
        constraint = authority.key() == leaf_owner.key()
            || authority.key() == leaf_delegate.key())
    ]
    pub authority: Signer<'info>,
    /// CHECK: This account is checked in instruction
    pub leaf_owner: AccountInfo<'info>,
    /// CHECK: This account is checked in instruction
    pub leaf_delegate: AccountInfo<'info>,
    /// CHECK: This account is checked in cpi
    pub new_leaf_owner: AccountInfo<'info>,
    /// CHECK: checked in cpi to bubblegum
    pub collection_mint: UncheckedAccount<'info>,
    #[account(mut)]
    /// CHECK: checked in cpi to bubblegum
    pub collection_metadata: AccountInfo<'info>,
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
    pub tree_authority: AccountInfo<'info>,
    /// CHECK: This account is checked in cpi
    #[account(mut)]
    pub merkle_tree: UncheckedAccount<'info>,
    #[account(address = spl_account_compression::id())]
    /// CHECK: This account is checked in account constraint
    pub compression_program: UncheckedAccount<'info>,
    #[account(
        address = mpl_bubblegum::ID
    )]
    /// CHECK: checked in account constraint
    pub mpl_bubblegum_program: UncheckedAccount<'info>,
    pub log_wrapper: Program<'info, Noop>,
    pub system_program: Program<'info, System>,
    pub token_metadata_program: Program<'info, Metadata>,
}
