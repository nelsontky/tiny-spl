use crate::state::MintTinySplArgs;

pub fn get_mint_tiny_spl_args(
    symbol: String,
    amount: u64,
    collection_mint: String,
) -> MintTinySplArgs {
    let formatted_amount = amount
        .to_string()
        .as_bytes()
        .rchunks(3)
        .rev()
        .map(std::str::from_utf8)
        .flat_map(|x| x)
        .collect::<Vec<_>>()
        .join(",");

    MintTinySplArgs {
        name: format!("{formatted_amount} {symbol}"),
        symbol,
        uri: format!("https://metadata.tinys.pl/collection?id={collection_mint}&amount={amount}"),
    }
}
