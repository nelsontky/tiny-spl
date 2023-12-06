use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct MintTinySplArgs {
    pub name: String,
    pub symbol: String,
    pub uri: String,
}
