use anchor_lang::{prelude::*, solana_program::keccak};
use mpl_bubblegum::{instructions::VerifyLeafCpiBuilder, utils::get_asset_id};

use crate::{error::TinySplError, state::CnftMetadata};

pub fn check_cnft<'info>(
    root: [u8; 32],
    cnft_metadata: &CnftMetadata,
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
        cnft_metadata.collection.clone().unwrap().key == collection_mint.key(),
        TinySplError::CollectionMismatch
    );

    let metadata_args = convert_cnft_metadata_to_metadata_args(cnft_metadata);
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

fn convert_cnft_metadata_to_metadata_args(
    cnft_metadata: &CnftMetadata,
) -> mpl_bubblegum::types::MetadataArgs {
    let token_program_version = match cnft_metadata.token_program_version {
        crate::state::TokenProgramVersion::Original => {
            mpl_bubblegum::types::TokenProgramVersion::Original
        }
        crate::state::TokenProgramVersion::Token2022 => {
            mpl_bubblegum::types::TokenProgramVersion::Token2022
        }
    };
    let token_standard = match &cnft_metadata.token_standard {
        Some(token_standard) => match token_standard {
            crate::state::TokenStandard::NonFungible => {
                Some(mpl_bubblegum::types::TokenStandard::NonFungible)
            }
            crate::state::TokenStandard::FungibleAsset => {
                Some(mpl_bubblegum::types::TokenStandard::FungibleAsset)
            }
            crate::state::TokenStandard::Fungible => {
                Some(mpl_bubblegum::types::TokenStandard::Fungible)
            }
            crate::state::TokenStandard::NonFungibleEdition => {
                Some(mpl_bubblegum::types::TokenStandard::NonFungibleEdition)
            }
        },
        None => None,
    };
    let collection = match &cnft_metadata.collection {
        Some(collection) => Some(mpl_bubblegum::types::Collection {
            verified: collection.verified,
            key: collection.key,
        }),
        None => None,
    };
    let creators = cnft_metadata
        .creators
        .iter()
        .map(|c| mpl_bubblegum::types::Creator {
            address: c.address,
            verified: c.verified,
            share: c.share,
        })
        .collect::<Vec<_>>();
    let uses = match &cnft_metadata.uses {
        Some(uses) => Some(mpl_bubblegum::types::Uses {
            use_method: match uses.use_method {
                crate::state::UseMethod::Burn => mpl_bubblegum::types::UseMethod::Burn,
                crate::state::UseMethod::Multiple => mpl_bubblegum::types::UseMethod::Multiple,
                crate::state::UseMethod::Single => mpl_bubblegum::types::UseMethod::Single,
            },
            remaining: uses.remaining,
            total: uses.total,
        }),
        None => None,
    };

    let metadata_args = mpl_bubblegum::types::MetadataArgs {
        name: cnft_metadata.name.clone(),
        symbol: cnft_metadata.symbol.clone(),
        uri: cnft_metadata.uri.clone(),
        collection,
        creators,
        edition_nonce: cnft_metadata.edition_nonce,
        is_mutable: cnft_metadata.is_mutable,
        primary_sale_happened: cnft_metadata.primary_sale_happened,
        seller_fee_basis_points: cnft_metadata.seller_fee_basis_points,
        token_program_version,
        token_standard,
        uses,
    };

    metadata_args
}
