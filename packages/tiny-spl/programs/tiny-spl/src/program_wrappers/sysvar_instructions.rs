use std::str::FromStr;

use anchor_lang::prelude::*;

#[derive(Clone)]
pub struct SysVarInstructions;

impl anchor_lang::Id for SysVarInstructions {
    fn id() -> Pubkey {
        Pubkey::from_str("Sysvar1nstructions1111111111111111111111111").unwrap()
    }
}
