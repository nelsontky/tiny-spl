use anchor_lang::{prelude::*, solana_program};

pub fn mint_tiny_spl_to_collection<'info>(
    ctx: &CpiContext<'_, '_, '_, 'info, MintTinySplToCollection<'info>>,
    metadata: mpl_bubblegum::types::MetadataArgs,
) -> Result<()> {
    let mut ix = mpl_bubblegum::instructions::MintToCollectionV1 {
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
            metadata,
        },
    );

    ix.accounts.push(AccountMeta {
        pubkey: ctx.accounts.tiny_spl_authority.key(),
        is_signer: false,
        is_writable: false,
    });

    solana_program::program::invoke_signed(
        &ix,
        &ToAccountInfos::to_account_infos(ctx),
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
