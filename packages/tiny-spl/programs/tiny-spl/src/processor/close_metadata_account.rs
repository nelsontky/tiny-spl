use anchor_lang::prelude::*;

use crate::state::LoggingMetadata;

pub fn close_metadata_account(_ctx: Context<CloseMetadataAccount>) -> Result<()> {
    Ok(())
}

#[derive(Accounts)]
pub struct CloseMetadataAccount<'info> {
    #[account(
        mut,
        has_one = authority,
        close = authority
    )]
    pub metadata: Account<'info, LoggingMetadata>,
    pub authority: Signer<'info>,
}
