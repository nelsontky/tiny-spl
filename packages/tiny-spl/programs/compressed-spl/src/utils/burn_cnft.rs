use anchor_lang::{prelude::*, solana_program};
use mpl_bubblegum::instructions::BurnInstructionArgs;

pub fn burn_cnft<'info>(
    ctx: CpiContext<'_, '_, '_, 'info, BurnCnft<'info>>,
    root: [u8; 32],
    data_hash: [u8; 32],
    creator_hash: [u8; 32],
    nonce: u64,
    index: u32,
) -> Result<()> {
    let ix = mpl_bubblegum::instructions::Burn {
        compression_program: *ctx.accounts.compression_program.key,
        leaf_delegate: (
            *ctx.accounts.leaf_delegate.key,
            ctx.accounts.leaf_delegate.is_signer,
        ),
        leaf_owner: (
            *ctx.accounts.leaf_owner.key,
            ctx.accounts.leaf_owner.is_signer,
        ),
        log_wrapper: *ctx.accounts.log_wrapper.key,
        merkle_tree: *ctx.accounts.merkle_tree.key,
        system_program: *ctx.accounts.system_program.key,
        tree_config: *ctx.accounts.tree_authority.key,
    }
    .instruction(BurnInstructionArgs {
        root,
        data_hash,
        creator_hash,
        nonce,
        index,
    });

    solana_program::program::invoke(&ix, &ToAccountInfos::to_account_infos(&ctx))?;

    Ok(())
}

#[derive(Accounts)]
pub struct BurnCnft<'info> {
    /// CHECK: checked in cpi to bubblegum
    pub tree_authority: AccountInfo<'info>,
    /// CHECK: checked in cpi to bubblegum
    pub leaf_owner: AccountInfo<'info>,
    /// CHECK: checked in cpi to bubblegum
    pub leaf_delegate: AccountInfo<'info>,
    /// CHECK: checked in cpi to bubblegum
    pub merkle_tree: AccountInfo<'info>,
    /// CHECK: checked in cpi to bubblegum
    pub log_wrapper: AccountInfo<'info>,
    /// CHECK: checked in cpi to bubblegum
    pub compression_program: AccountInfo<'info>,
    /// CHECK: checked in cpi to bubblegum
    pub system_program: AccountInfo<'info>,
}
