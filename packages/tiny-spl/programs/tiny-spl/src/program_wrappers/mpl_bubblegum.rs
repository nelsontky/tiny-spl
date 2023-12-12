use anchor_lang::prelude::*;

#[derive(Clone)]
pub struct MplBubblegum;

impl anchor_lang::Id for MplBubblegum {
    fn id() -> Pubkey {
      mpl_bubblegum::ID
    }
}
