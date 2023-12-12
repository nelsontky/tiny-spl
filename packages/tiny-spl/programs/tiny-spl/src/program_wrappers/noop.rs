use anchor_lang::prelude::*;

#[derive(Clone)]
pub struct Noop;

impl anchor_lang::Id for Noop {
    fn id() -> Pubkey {
      spl_noop::id()
    }
}
