mod constants;
mod error;
mod program_wrappers;
mod processor;
mod state;
mod utils;

use std::{alloc::Layout, mem::size_of, ptr::null_mut};

use anchor_lang::{
    prelude::*,
    solana_program::entrypoint::{HEAP_LENGTH, HEAP_START_ADDRESS},
};
use processor::*;

declare_id!("tsP1jf31M3iGNPmANP3ep3iWCMTxpMFLNbewWVWWbSo");

#[program]
pub mod tiny_spl {
    use super::*;

    pub fn init_metadata_account(
        ctx: Context<InitLoggingMetadataAccount>,
        total_metadata_bytes: u32,
    ) -> Result<()> {
        processor::init_logging_metadata_account(ctx, total_metadata_bytes)
    }

    pub fn upload_logging_metadata(
        ctx: Context<UploadLoggingMetadata>,
        index: u32,
        bytes: Vec<u8>,
    ) -> Result<()> {
        processor::upload_logging_metadata(ctx, index, bytes)
    }

    pub fn log_metadata(ctx: Context<LogMetadata>) -> Result<()> {
        processor::log_metadata(ctx)
    }

    pub fn close_metadata_account(ctx: Context<CloseMetadataAccount>) -> Result<()> {
        processor::close_metadata_account(ctx)
    }

    pub fn create_mint(
        ctx: Context<CreateMint>,
        create_mint_metadata: CreateMintMetadata,
    ) -> Result<()> {
        processor::create_mint(ctx, create_mint_metadata)
    }

    pub fn mint_to(ctx: Context<MintTo>, amount: u64) -> Result<()> {
        processor::mint_to(ctx, amount)
    }

    pub fn split<'info>(
        ctx: Context<'_, '_, '_, 'info, Split<'info>>,
        asset_id: Pubkey,
        root: [u8; 32],
        nonce: u64,
        index: u32,
        amounts: Vec<u64>,
    ) -> Result<()> {
        processor::split(ctx, asset_id, root, nonce, index, amounts)
    }

    pub fn close_cnft_metadata_account(
        ctx: Context<CloseCnftMetadataAccount>,
        asset_id: Pubkey,
    ) -> Result<()> {
        processor::close_cnft_metadata_account(ctx, asset_id)
    }

    pub fn combine<'info>(
        ctx: Context<'_, '_, '_, 'info, Combine<'info>>,
        asset_id_a: Pubkey,
        asset_id_b: Pubkey,
        root_a: [u8; 32],
        root_b: [u8; 32],
        nonce_a: u64,
        nonce_b: u64,
        index_a: u32,
        index_b: u32,
        asset_a_proof_path_end_index: u32,
    ) -> Result<()> {
        processor::combine(
            ctx,
            asset_id_a,
            asset_id_b,
            root_a,
            root_b,
            nonce_a,
            nonce_b,
            index_a,
            index_b,
            asset_a_proof_path_end_index,
        )
    }
}

#[derive(Accounts)]
pub struct Initialize {}

// same as default solana bump allocator
// this is needed so I can mess with the heap
// when I make logging cpis
pub struct BumpAllocator {
    pub start: usize,
    pub len: usize,
}

impl BumpAllocator {
    const RESERVED_MEM: usize = 1 * size_of::<*mut u8>();

    /// Return heap position as of this call
    pub unsafe fn pos(&self) -> usize {
        let pos_ptr = self.start as *mut usize;
        *pos_ptr
    }

    /// Reset heap start cursor to position.
    /// ### This is very unsafe, use wisely
    pub unsafe fn move_cursor(&self, pos: usize) {
        let pos_ptr = self.start as *mut usize;
        *pos_ptr = pos;
    }
}
unsafe impl std::alloc::GlobalAlloc for BumpAllocator {
    #[inline]
    unsafe fn alloc(&self, layout: Layout) -> *mut u8 {
        let pos_ptr = self.start as *mut usize;

        let mut pos = *pos_ptr;
        if pos == 0 {
            // First time, set starting position
            pos = self.start + self.len;
        }
        pos = pos.saturating_sub(layout.size());
        pos &= !(layout.align().wrapping_sub(1));
        if pos < self.start + BumpAllocator::RESERVED_MEM {
            return null_mut();
        }
        *pos_ptr = pos;
        pos as *mut u8
    }
    #[inline]
    unsafe fn dealloc(&self, _: *mut u8, _: Layout) {
        // no dellaoc in Solana runtime :*(
    }
}

#[global_allocator]
static A: BumpAllocator = BumpAllocator {
    start: HEAP_START_ADDRESS as usize,
    len: HEAP_LENGTH,
};
