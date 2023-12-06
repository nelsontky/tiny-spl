use anchor_lang::prelude::*;

use crate::{error::TinySplError, state::CnftMetadata, utils::get_token_amount};

pub fn verify_token_splits(cnft_metadata: &CnftMetadata, amounts: &Vec<u64>) -> Result<()> {
    let token_amount = get_token_amount(cnft_metadata).unwrap();

    let mut total_amount: u64 = 0;
    for amount in amounts {
        total_amount = total_amount.checked_add(*amount).unwrap();
    }

    let is_amounts_all_more_than_zero = amounts.iter().all(|&amount| amount > 0);

    require!(
        token_amount == total_amount && is_amounts_all_more_than_zero,
        TinySplError::InvalidSplitAmounts
    );

    Ok(())
}
