use anchor_spl::metadata::mpl_token_metadata::{MAX_CREATOR_LEN, MAX_CREATOR_LIMIT};

pub const TINY_SPL_AUTHORITY_SEED: &[u8] = b"tiny_spl";

pub const METADATA_BUFFER_START: usize = 8 // discriminator
    + 32; // authority

// metadata sizes
pub const CNFT_METADATA_SEED: &[u8] = b"cnft_metadata";

const MAX_NAME_LENGTH: usize = 32;

const MAX_SYMBOL_LENGTH: usize = 10;

const MAX_URI_LENGTH: usize = 200;

pub const MAX_METADATA_LEN: usize = 4 + MAX_NAME_LENGTH
    + 4 + MAX_SYMBOL_LENGTH
    + 4 + MAX_URI_LENGTH
    + 2                                        // seller fee basis points
    + 1                                        // primary sale happened
    + 1                                        // is mutable
    + 2                                        // nonce
    + 2                                        // token standard
    + 34                                       // collection
    + 18                                       // uses
    + 1 + 1                                    // token_program_version
    + 4 + MAX_CREATOR_LIMIT * MAX_CREATOR_LEN;
