use anchor_lang::{prelude::*, solana_program};
use anchor_spl::{
    metadata::{mpl_token_metadata, Metadata},
    token::Token,
};

use crate::{constants::TINY_SPL_AUTHORITY_SEED, error::TinySplError, state::TinySplAuthority, program_wrappers::SysVarInstructions};

pub fn create_mint(
    ctx: Context<CreateMint>,
    create_mint_metadata: CreateMintMetadata,
) -> Result<()> {
    if !ctx.accounts.mint.data_is_empty() {
        return Err(TinySplError::MintAccountNotEmpty.into());
    }

    if !ctx.accounts.metadata.data_is_empty() {
        return Err(TinySplError::MetadataAccountNotEmpty.into());
    }

    if !ctx.accounts.master_edition.data_is_empty() {
        return Err(TinySplError::MasterEditionAccountNotEmpty.into());
    }

    let mint_pubkey = ctx.accounts.mint.key();
    let seeds: &[&[&[u8]]] = &[&[
        TINY_SPL_AUTHORITY_SEED,
        mint_pubkey.as_ref(),
        &[ctx.bumps.tiny_spl_authority],
    ]];
    let cpi_context = CpiContext::new_with_signer(
        ctx.accounts.mpl_token_metadata_program.to_account_info(),
        CreateNftCollection {
            metadata: ctx.accounts.metadata.to_account_info(),
            master_edition: ctx.accounts.master_edition.to_account_info(),
            mint: ctx.accounts.mint.to_account_info(),
            authority: ctx.accounts.tiny_spl_authority.to_account_info(),
            payer: ctx.accounts.mint_authority.to_account_info(),
            update_authority: ctx.accounts.tiny_spl_authority.to_account_info(),
            sysvar_instructions: ctx.accounts.sysvar_instructions.clone(),
            spl_token_program: ctx.accounts.spl_token_program.clone(),
            system_program: ctx.accounts.system_program.clone(),
        },
        &seeds,
    );
    create_nft_collection(cpi_context, create_mint_metadata)?;

    let tiny_spl_authority = &mut ctx.accounts.tiny_spl_authority;
    tiny_spl_authority.is_verified_tiny_spl_mint = true;
    tiny_spl_authority.current_supply = 0;
    tiny_spl_authority.mint_authority = Some(*ctx.accounts.mint_authority.key);

    Ok(())
}

fn create_nft_collection<'info>(
    ctx: CpiContext<'_, '_, '_, 'info, CreateNftCollection<'info>>,
    create_mint_metadata: CreateMintMetadata,
) -> Result<()> {
    let ix = mpl_token_metadata::instructions::Create {
        metadata: *ctx.accounts.metadata.key,
        master_edition: Some(*ctx.accounts.master_edition.key),
        mint: (*ctx.accounts.mint.key, true),
        authority: *ctx.accounts.authority.key,
        payer: *ctx.accounts.payer.key,
        update_authority: (*ctx.accounts.update_authority.key, true),
        system_program: *ctx.accounts.system_program.key,
        sysvar_instructions: *ctx.accounts.sysvar_instructions.key,
        spl_token_program: *ctx.accounts.spl_token_program.key,
    }
    .instruction(mpl_token_metadata::instructions::CreateInstructionArgs {
        create_args: mpl_token_metadata::types::CreateArgs::V1 {
            name: create_mint_metadata.name,
            symbol: create_mint_metadata.symbol,
            uri: create_mint_metadata.uri,
            seller_fee_basis_points: 0,
            creators: Some(vec![mpl_token_metadata::types::Creator {
                address: ctx.accounts.authority.key(),
                verified: true,
                share: 100,
            }]),
            primary_sale_happened: false,
            is_mutable: true,
            token_standard: mpl_token_metadata::types::TokenStandard::NonFungible,
            collection: None,
            uses: None,
            collection_details: Some(mpl_token_metadata::types::CollectionDetails::V1 { size: 0 }),
            rule_set: None,
            decimals: Some(0),
            print_supply: Some(mpl_token_metadata::types::PrintSupply::Zero),
        },
    });

    solana_program::program::invoke_signed(
        &ix,
        &ToAccountInfos::to_account_infos(&ctx),
        ctx.signer_seeds,
    )
    .map_err(Into::into)
}

#[derive(Accounts)]
pub struct CreateMint<'info> {
    #[account(mut)]
    /// CHECK: checked in cpi to mpl token metadata
    pub metadata: UncheckedAccount<'info>,
    #[account(mut)]
    /// CHECK: checked in cpi to mpl token metadata
    pub master_edition: UncheckedAccount<'info>,
    #[account(mut)]
    pub mint: Signer<'info>,
    #[account(mut)]
    pub mint_authority: Signer<'info>,
    #[account(
        init,
        payer = mint_authority,
        space = 8 + (TinySplAuthority::INIT_SPACE * 2),
        seeds = [
            TINY_SPL_AUTHORITY_SEED,
            mint.key().as_ref(),
        ],
        bump,
    )]
    pub tiny_spl_authority: Box<Account<'info, TinySplAuthority>>,
    pub system_program: Program<'info, System>,
    pub sysvar_instructions: Program<'info, SysVarInstructions>,
    pub spl_token_program: Program<'info, Token>,
    pub mpl_token_metadata_program: Program<'info, Metadata>,
}

#[derive(Accounts)]
pub struct CreateNftCollection<'info> {
    /// CHECK: checked in cpi to mpl token metadata
    pub metadata: AccountInfo<'info>,
    /// CHECK: checked in cpi to mpl token metadata
    pub master_edition: AccountInfo<'info>,
    /// CHECK: checked in cpi to mpl token metadata
    pub mint: AccountInfo<'info>,
    /// CHECK: checked in cpi to mpl token metadata
    pub authority: AccountInfo<'info>,
    /// CHECK: checked in cpi to mpl token metadata
    pub payer: AccountInfo<'info>,
    /// CHECK: checked in cpi to mpl token metadata
    pub update_authority: AccountInfo<'info>,
    pub sysvar_instructions: Program<'info, SysVarInstructions>,
    pub system_program: Program<'info, System>,
    pub spl_token_program: Program<'info, Token>,
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct CreateMintMetadata {
    name: String,
    symbol: String,
    uri: String,
}
