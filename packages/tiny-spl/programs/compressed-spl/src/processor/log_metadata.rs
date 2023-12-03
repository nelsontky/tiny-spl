use anchor_lang::prelude::*;
use anchor_lang::solana_program::program::invoke;
use anchor_lang::solana_program::pubkey::Pubkey;

use crate::noop::Noop;
use crate::A;
use crate::{constants::METADATA_BUFFER_START, state::LoggingMetadata};

const MAX_CPI_BYTES: usize = 1238;

pub fn log_metadata(ctx: Context<LogMetadata>) -> Result<()> {
    let account_info = ctx.accounts.metadata.to_account_info();
    let account_data = account_info.data.borrow();

    for i in (METADATA_BUFFER_START..account_data.len()).step_by(MAX_CPI_BYTES) {
        let left = i;
        let right = std::cmp::min(i + MAX_CPI_BYTES, account_data.len());

        let heap_start: usize = unsafe { A.pos() };

        invoke(
            &spl_noop::instruction(account_data[left..right].to_vec()),
            &[ctx.accounts.noop_program.to_account_info()],
        )?;

        unsafe {
            A.move_cursor(heap_start);
        }
    }

    Ok(())
}

#[derive(Accounts)]
pub struct LogMetadata<'info> {
    #[account(
        has_one = authority,
    )]
    pub metadata: Account<'info, LoggingMetadata>,
    pub authority: Signer<'info>,
    pub noop_program: Program<'info, Noop>,
}
