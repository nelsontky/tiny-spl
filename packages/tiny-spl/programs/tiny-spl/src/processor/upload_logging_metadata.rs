use crate::{constants::METADATA_BUFFER_START, state::LoggingMetadata};
use anchor_lang::prelude::*;

pub fn upload_logging_metadata(
    ctx: Context<UploadLoggingMetadata>,
    index: u32,
    bytes: Vec<u8>,
) -> Result<()> {
    let account_info = ctx.accounts.metadata.to_account_info();
    let mut account_data = account_info.data.borrow_mut();
    account_data[METADATA_BUFFER_START + (index as usize)
        ..METADATA_BUFFER_START + (index as usize) + bytes.len()]
        .copy_from_slice(&bytes);
    Ok(())
}

#[derive(Accounts)]
pub struct UploadLoggingMetadata<'info> {
    #[account(
        mut,
        has_one = authority,
    )]
    pub metadata: Account<'info, LoggingMetadata>,
    pub authority: Signer<'info>,
}
