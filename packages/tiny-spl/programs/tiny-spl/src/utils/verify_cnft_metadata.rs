use anchor_lang::{prelude::*, solana_program::keccak};
use mpl_bubblegum::{instructions::VerifyLeafCpiBuilder, utils::get_asset_id};

use crate::error::TinySplError;

pub fn verify_cnft_metadata<'info>(
    root: [u8; 32],
    metadata: &mpl_bubblegum::types::MetadataArgs,
    nonce: u64,
    index: u32,
    merkle_tree: &AccountInfo<'info>,
    owner: &AccountInfo<'info>,
    delegate: &AccountInfo<'info>,
    collection_mint: &AccountInfo<'info>,
    compression_program: &AccountInfo<'info>,
    remaining_accounts: &[AccountInfo<'info>],
) -> Result<(Pubkey, [u8; 32], [u8; 32])> {
    require!(
        owner.is_signer || delegate.is_signer,
        TinySplError::LeafAuthorityMustSign
    );
    require!(
        metadata.collection.clone().unwrap().key == collection_mint.key(),
        TinySplError::CollectionMismatch
    );

    let metadata_hash = keccak::hashv(&[metadata.try_to_vec()?.as_slice()]);
    let data_hash = keccak::hashv(&[
        &metadata_hash.to_bytes(),
        &metadata.seller_fee_basis_points.to_le_bytes(),
    ]);
    let creator_data = metadata
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

    let mut verify_leaf_cpi_builder = VerifyLeafCpiBuilder::new(compression_program);
    verify_leaf_cpi_builder.merkle_tree(merkle_tree);
    verify_leaf_cpi_builder.root(root);
    verify_leaf_cpi_builder.leaf(leaf);
    verify_leaf_cpi_builder.index(index);
    remaining_accounts.iter().for_each(|a| {
        verify_leaf_cpi_builder.add_remaining_account(a, false, false);
    });
    verify_leaf_cpi_builder.invoke()?;

    Ok((
        asset_id,
        data_hash.as_ref().try_into().unwrap(),
        creator_hash.as_ref().try_into().unwrap(),
    ))
}
