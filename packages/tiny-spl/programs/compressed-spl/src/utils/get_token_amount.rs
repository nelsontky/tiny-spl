use url::{ParseError, Url};

use crate::state::CnftMetadata;

pub fn get_token_amount(cnft_metadata: &CnftMetadata) -> Result<u64, ParseError> {
    let metadata_uri = cnft_metadata.uri.clone();
    let url = Url::parse(&metadata_uri)?;
    let amount_pair = url.query_pairs().find(|pair| pair.0 == "amount").unwrap();
    let amount = amount_pair.1.parse::<u64>().unwrap();

    Ok(amount)
}
