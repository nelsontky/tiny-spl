use crate::{constants::METADATA_BUFFER_START, state::Metadata};
use anchor_lang::prelude::*;

pub fn upload_metadata(ctx: Context<UploadMetadata>, index: u32, bytes: Vec<u8>) -> Result<()> {
    let account_info = ctx.accounts.metadata.to_account_info();
    let mut account_data = account_info.data.borrow_mut();
    account_data[METADATA_BUFFER_START + (index as usize)
        ..METADATA_BUFFER_START + (index as usize) + bytes.len()]
        .copy_from_slice(&bytes);
    Ok(())
}

#[derive(Accounts)]
pub struct UploadMetadata<'info> {
    #[account(
        mut,
        has_one = authority,
    )]
    pub metadata: Account<'info, Metadata>,
    pub authority: Signer<'info>,
}
