use anchor_lang::prelude::*;

use crate::{constants::CNFT_METADATA_SEED, state::CnftMetadata};

pub fn close_cnft_metadata_account(
    _ctx: Context<CloseCnftMetadataAccount>,
    _asset_id: Pubkey,
) -> Result<()> {
    Ok(())
}

#[derive(Accounts)]
#[instruction(asset_id: Pubkey)]
pub struct CloseCnftMetadataAccount<'info> {
    #[account(
        mut,
        seeds = [
            CNFT_METADATA_SEED,
            asset_id.as_ref(),
        ],
        close = cnft_metadata_account_creator,
        bump,
        has_one = cnft_metadata_account_creator,
    )]
    pub cnft_metadata: Box<Account<'info, CnftMetadata>>,
    #[account(mut)]
    pub cnft_metadata_account_creator: Signer<'info>,
}
