use anchor_lang::prelude::*;

use crate::{constants::{MAX_METADATA_LEN, CNFT_METADATA_SEED}, state::CnftMetadata};

pub fn upload_cnft_metadata(ctx: Context<UploadCnftMetadata>, asset_id: Pubkey) -> Result<()> {
    MetadataArgs::
}

#[derive(Accounts)]
#[instruction(asset_id: Pubkey)]
pub struct UploadCnftMetadata<'info> {
    #[account(
        init_if_needed, 
        payer = authority, 
        space = 8 + MAX_METADATA_LEN,
        seeds = [
            CNFT_METADATA_SEED,
            asset_id.as_ref(),
        ],
        bump
    )]
    pub cnft_metadata: Box<Account<'info, CnftMetadata>>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}
