use anchor_lang::{prelude::*, Discriminator};

use crate::{constants::METADATA_BUFFER_START, state::LoggingMetadata};

pub fn init_logging_metadata_account(
    ctx: Context<InitLoggingMetadataAccount>,
    _total_metadata_bytes: u32,
) -> Result<()> {
    let metadata = LoggingMetadata {
        authority: ctx.accounts.authority.key(),
    };
    let mut struct_data = LoggingMetadata::discriminator().try_to_vec().unwrap();
    struct_data.append(&mut metadata.try_to_vec().unwrap());

    let metadata_account = &mut ctx.accounts.metadata;

    let mut account_data = metadata_account.data.borrow_mut();
    account_data[0..struct_data.len()].copy_from_slice(&struct_data);

    Ok(())
}

#[derive(Accounts)]
#[instruction(total_metadata_bytes: u32)]
pub struct InitLoggingMetadataAccount<'info> {
    /// CHECK: account constraints checked in account trait
    #[account(
        zero,
        rent_exempt = skip,
        constraint = metadata.to_account_info().owner == __program_id
            && metadata.to_account_info().data_len() >= METADATA_BUFFER_START + (total_metadata_bytes as usize)
    )]
    pub metadata: UncheckedAccount<'info>,
    pub authority: Signer<'info>,
}
