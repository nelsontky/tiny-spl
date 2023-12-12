use anchor_lang::prelude::*;

#[derive(Clone)]
pub struct SplCompression;

impl anchor_lang::Id for SplCompression {
    fn id() -> Pubkey {
      spl_account_compression::ID
    }
}
