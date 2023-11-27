use anchor_lang::{prelude::*, solana_program, system_program};
use anchor_spl::metadata::mpl_token_metadata;

use crate::{constants::TINY_SPL_AUTHORITY_SEED, state::TinySplAuthority};

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
        MintTinyNftToCollection {
            tree_config: ctx.accounts.tree_authority.to_account_info(),
            leaf_owner: ctx.accounts.leaf_owner.to_account_info(),
            leaf_delegate: ctx.accounts.leaf_delegate.to_account_info(),
            merkle_tree: ctx.accounts.merkle_tree.to_account_info(),
            payer: ctx.accounts.mint_authority.to_account_info(),
            collection_mint: ctx.accounts.collection_mint.to_account_info(),
            collection_metadata: ctx.accounts.collection_metadata.to_account_info(),
            collection_edition: ctx.accounts.edition_account.to_account_info(),
            bubblegum_signer: ctx.accounts.bubblegum_signer.to_account_info(),
            tiny_spl_authority: ctx.accounts.tiny_spl_authority.to_account_info(),
            log_wrapper: ctx.accounts.log_wrapper.to_account_info(),
            compression_program: ctx.accounts.compression_program.to_account_info(),
        },
        &seeds,
    );

    mint_tiny_nft_to_collection(
        cpi_context,
        MetadataArgs {
            name: collection_metadata.name,
            symbol: collection_metadata.symbol,
            uri: format!("https://bafybeiagngho2qee3p6xd553fxkjzmbmvhifpj2jkq3rdwf5ehtlypjq7m.ipfs.nftstorage.link/amount/{amount}"),
        },
    )?;

    let tiny_spl_authority = &mut ctx.accounts.tiny_spl_authority;
    tiny_spl_authority.current_supply = tiny_spl_authority
        .current_supply
        .checked_add(amount)
        .unwrap();

    Ok(())
}

fn mint_tiny_nft_to_collection<'info>(
    ctx: CpiContext<'_, '_, '_, 'info, MintTinyNftToCollection<'info>>,
    metadata_args: MetadataArgs,
) -> Result<()> {
    let ix = mpl_bubblegum::instructions::MintToCollectionV1 {
        tree_config: *ctx.accounts.tree_config.key,
        leaf_owner: *ctx.accounts.leaf_owner.key,
        leaf_delegate: *ctx.accounts.leaf_delegate.key,
        merkle_tree: *ctx.accounts.merkle_tree.key,
        payer: *ctx.accounts.payer.key,
        tree_creator_or_delegate: ctx.accounts.tiny_spl_authority.key(),
        collection_authority: ctx.accounts.tiny_spl_authority.key(),
        collection_authority_record_pda: None,
        collection_mint: *ctx.accounts.collection_mint.key,
        collection_metadata: *ctx.accounts.collection_metadata.key,
        collection_edition: *ctx.accounts.collection_edition.key,
        bubblegum_signer: *ctx.accounts.bubblegum_signer.key,
        log_wrapper: *ctx.accounts.log_wrapper.key,
        compression_program: *ctx.accounts.compression_program.key,
        token_metadata_program: mpl_token_metadata::ID,
        system_program: system_program::ID,
    }
    .instruction(
        mpl_bubblegum::instructions::MintToCollectionV1InstructionArgs {
            metadata: mpl_bubblegum::types::MetadataArgs {
                name: metadata_args.name,
                symbol: metadata_args.symbol,
                uri: metadata_args.uri,
                seller_fee_basis_points: 0,
                primary_sale_happened: false,
                is_mutable: true,
                edition_nonce: None,
                token_standard: Some(mpl_bubblegum::types::TokenStandard::NonFungible),
                collection: Some(mpl_bubblegum::types::Collection {
                    key: ctx.accounts.collection_mint.key(),
                    verified: true,
                }),
                uses: None,
                token_program_version: mpl_bubblegum::types::TokenProgramVersion::Original,
                creators: vec![mpl_bubblegum::types::Creator {
                    address: ctx.accounts.tiny_spl_authority.key(),
                    verified: true,
                    share: 100,
                }],
            },
        },
    );

    solana_program::program::invoke_signed(
        &ix,
        &ToAccountInfos::to_account_infos(&ctx),
        ctx.signer_seeds,
    )
    .map_err(Into::into)
}

#[derive(Accounts)]
pub struct MintTo<'info> {
    #[account(mut)]
    /// CHECK: checked in cpi to bubblegum
    pub tree_authority: AccountInfo<'info>,
    /// CHECK: This account is neither written to nor read from.
    pub leaf_owner: AccountInfo<'info>,
    /// CHECK: This account is neither written to nor read from.
    pub leaf_delegate: AccountInfo<'info>,
    #[account(mut)]
    /// CHECK: unsafe
    pub merkle_tree: UncheckedAccount<'info>,
    pub mint_authority: Signer<'info>,
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
        mut,
        seeds = [
            TINY_SPL_AUTHORITY_SEED,
            collection_mint.key().as_ref(),
        ],
        bump,
        constraint = tiny_spl_authority.is_verified_tiny_spl_mint
            && tiny_spl_authority.mint_authority == Some(*mint_authority.key)
    )]
    pub tiny_spl_authority: Box<Account<'info, TinySplAuthority>>,
    /// CHECK: checked in cpi to bubblegum
    pub log_wrapper: AccountInfo<'info>,
    /// CHECK: checked in cpi to bubblegum
    pub compression_program: AccountInfo<'info>,
    /// CHECK: checked in cpi to bubblegum
    pub token_metadata_program: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
    #[account(
        address = mpl_bubblegum::ID
    )]
    /// CHECK: checked in account constraint
    pub mpl_bubblegum_program: AccountInfo<'info>,
}

#[derive(Accounts)]
pub struct MintTinyNftToCollection<'info> {
    /// CHECK: checked in cpi to bubblegum
    pub tree_config: AccountInfo<'info>,
    /// CHECK: checked in cpi to bubblegum
    pub leaf_owner: AccountInfo<'info>,
    /// CHECK: checked in cpi to bubblegum
    pub leaf_delegate: AccountInfo<'info>,
    /// CHECK: checked in cpi to bubblegum
    pub merkle_tree: AccountInfo<'info>,
    /// CHECK: checked in cpi to bubblegum
    pub payer: AccountInfo<'info>,
    /// CHECK: checked in cpi to bubblegum
    pub collection_mint: AccountInfo<'info>,
    /// CHECK: checked in cpi to bubblegum
    pub collection_metadata: AccountInfo<'info>,
    /// CHECK: checked in cpi to bubblegum
    pub collection_edition: AccountInfo<'info>,
    /// CHECK: checked in cpi to bubblegum
    pub bubblegum_signer: AccountInfo<'info>,
    /// CHECK: checked in cpi to bubblegum
    pub tiny_spl_authority: AccountInfo<'info>,
    /// CHECK: checked in cpi to bubblegum
    pub log_wrapper: AccountInfo<'info>,
    /// CHECK: checked in cpi to bubblegum
    pub compression_program: AccountInfo<'info>,
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct MetadataArgs {
    name: String,
    symbol: String,
    uri: String,
}
