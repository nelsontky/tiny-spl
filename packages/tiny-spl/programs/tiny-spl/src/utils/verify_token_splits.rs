use anchor_lang::prelude::*;

use crate::error::TinySplError;

pub fn verify_token_splits(source_amount: u64, amounts: &Vec<u64>) -> Result<()> {
    let mut total_amount: u64 = 0;
    for amount in amounts {
        total_amount = total_amount.checked_add(*amount).unwrap();
    }

    let is_amounts_all_more_than_zero = amounts.iter().all(|&amount| amount > 0);

    require!(
        source_amount == total_amount && is_amounts_all_more_than_zero,
        TinySplError::InvalidSplitAmounts
    );

    Ok(())
}
