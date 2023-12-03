use anchor_lang::{
    prelude::*,
    solana_program::{self, keccak},
};
use mpl_bubblegum::{
    instructions::VerifyLeafInstructionArgs, types::MetadataArgs, utils::get_asset_id,
};

use crate::{error::TinySplError, state::CnftMetadata};

pub fn check_cnft_owner<'info>(
    root: [u8; 32],
    cnft_metadata: &CnftMetadata,
    nonce: u64,
    index: u32,
    merkle_tree: &AccountInfo<'info>,
    owner: &AccountInfo<'info>,
    delegate: &AccountInfo<'info>,
    compression_program: &AccountInfo<'info>,
    remaining_accounts: &[AccountInfo<'info>],
) -> Result<()> {
    require!(
        owner.is_signer || delegate.is_signer,
        TinySplError::LeafAuthorityMustSign
    );

    let metadata_args = MetadataArgs {
        name: cnft_metadata.name.clone(),
        symbol: cnft_metadata.symbol.clone(),
        uri: cnft_metadata.uri.clone(),
        collection: cnft_metadata.collection.clone(),
        creators: cnft_metadata.creators.clone(),
        edition_nonce: cnft_metadata.edition_nonce,
        is_mutable: cnft_metadata.is_mutable,
        primary_sale_happened: cnft_metadata.primary_sale_happened,
        seller_fee_basis_points: cnft_metadata.seller_fee_basis_points,
        token_program_version: cnft_metadata.token_program_version.clone(),
        token_standard: cnft_metadata.token_standard.clone(),
        uses: cnft_metadata.uses.clone(),
    };
    let metadata_args_hash = keccak::hashv(&[metadata_args.try_to_vec()?.as_slice()]);
    let data_hash = keccak::hashv(&[
        &metadata_args_hash.to_bytes(),
        &metadata_args.seller_fee_basis_points.to_le_bytes(),
    ]);
    let creator_data = metadata_args
        .creators
        .iter()
        .map(|c| Ok([c.address.as_ref(), &[c.verified as u8], &[c.share]].concat()))
        .collect::<Result<Vec<_>>>()?;
    let creator_hash = keccak::hashv(
        creator_data
            .iter()
            .map(|c| c.as_slice())
            .collect::<Vec<&[u8]>>()
            .as_ref(),
    );
    let asset_id = get_asset_id(&merkle_tree.key(), nonce);
    let leaf = keccak::hashv(&[
        &[mpl_bubblegum::types::Version::V1.to_bytes()],
        asset_id.as_ref(),
        owner.key().as_ref(),
        delegate.key().as_ref(),
        nonce.to_le_bytes().as_ref(),
        data_hash.as_ref(),
        creator_hash.as_ref(),
    ])
    .to_bytes();

    let verify_leaf_ix = mpl_bubblegum::instructions::VerifyLeaf {
        merkle_tree: merkle_tree.key(),
    }
    .instruction(VerifyLeafInstructionArgs { index, leaf, root });
    let mut account_infos = vec![merkle_tree.clone(), compression_program.clone()];
    account_infos.extend_from_slice(remaining_accounts);

    solana_program::program::invoke(&verify_leaf_ix, account_infos.as_slice())?;

    Ok(())
}
