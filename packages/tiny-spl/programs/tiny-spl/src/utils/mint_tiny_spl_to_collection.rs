use anchor_lang::{prelude::*, solana_program};

use crate::state::MintTinySplArgs;

pub fn mint_tiny_spl_to_collection<'info>(
    ctx: CpiContext<'_, '_, '_, 'info, MintTinySplToCollection<'info>>,
    mint_tiny_spl_args: MintTinySplArgs,
) -> Result<()> {
    let ix = mpl_bubblegum::instructions::MintToCollectionV1 {
        tree_config: *ctx.accounts.tree_config.key,
        leaf_owner: *ctx.accounts.new_leaf_owner.key,
        leaf_delegate: *ctx.accounts.new_leaf_owner.key,
        merkle_tree: *ctx.accounts.merkle_tree.key,
        payer: *ctx.accounts.payer.key,
        tree_creator_or_delegate: ctx.accounts.tree_creator_or_delegate.key(),
        collection_authority: ctx.accounts.tiny_spl_authority.key(),
        collection_authority_record_pda: None,
        collection_mint: *ctx.accounts.collection_mint.key,
        collection_metadata: *ctx.accounts.collection_metadata.key,
        collection_edition: *ctx.accounts.collection_edition.key,
        bubblegum_signer: *ctx.accounts.bubblegum_signer.key,
        log_wrapper: *ctx.accounts.log_wrapper.key,
        compression_program: *ctx.accounts.compression_program.key,
        token_metadata_program: *ctx.accounts.token_metadata_program.key,
        system_program: *ctx.accounts.system_program.key,
    }
    .instruction(
        mpl_bubblegum::instructions::MintToCollectionV1InstructionArgs {
            metadata: mpl_bubblegum::types::MetadataArgs {
                name: mint_tiny_spl_args.name.replace("\0", ""),
                symbol: mint_tiny_spl_args.symbol.replace("\0", ""),
                uri: mint_tiny_spl_args.uri.replace("\0", ""),
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
pub struct MintTinySplToCollection<'info> {
    /// CHECK: checked in cpi to bubblegum
    pub tree_config: AccountInfo<'info>,
    /// CHECK: checked in cpi to bubblegum
    pub new_leaf_owner: AccountInfo<'info>,
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
    pub tree_creator_or_delegate: AccountInfo<'info>,
    /// CHECK: checked in cpi to bubblegum
    pub log_wrapper: AccountInfo<'info>,
    /// CHECK: checked in cpi to bubblegum
    pub compression_program: AccountInfo<'info>,
    /// CHECK: checked in cpi to bubblegum
    pub token_metadata_program: AccountInfo<'info>,
    /// CHECK: checked in cpi to bubblegum
    pub system_program: AccountInfo<'info>,
}
