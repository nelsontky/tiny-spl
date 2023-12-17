use anchor_lang::solana_program::pubkey::Pubkey;

pub fn get_tiny_spl_metadata(
    symbol: String,
    amount: u64,
    collection_mint: Pubkey,
    tiny_spl_authority: Pubkey,
) -> mpl_bubblegum::types::MetadataArgs {
    let formatted_amount = amount
        .to_string()
        .as_bytes()
        .rchunks(3)
        .rev()
        .map(std::str::from_utf8)
        .flat_map(|x| x)
        .collect::<Vec<_>>()
        .join(",");
    let name = format!("{formatted_amount} {symbol}").replace("\0", "");
    let symbol = symbol.replace("\0", "");
    let uri = format!("https://metadata.tinys.pl/collection?id={collection_mint}&amount={amount}")
        .replace("\0", "");

    mpl_bubblegum::types::MetadataArgs {
        name,
        symbol,
        uri,
        seller_fee_basis_points: 0,
        primary_sale_happened: false,
        is_mutable: true,
        edition_nonce: None,
        token_standard: Some(mpl_bubblegum::types::TokenStandard::NonFungible),
        collection: Some(mpl_bubblegum::types::Collection {
            key: collection_mint,
            verified: true,
        }),
        uses: None,
        token_program_version: mpl_bubblegum::types::TokenProgramVersion::Original,
        creators: vec![mpl_bubblegum::types::Creator {
            address: tiny_spl_authority,
            verified: true,
            share: 100,
        }],
    }
}
