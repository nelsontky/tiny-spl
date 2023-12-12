use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct TinySplAuthority {
    pub is_verified_tiny_spl_mint: bool,
    pub current_supply: u64,
    pub mint_authority: Option<Pubkey>,
}
