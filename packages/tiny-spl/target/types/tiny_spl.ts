export type TinySpl = {
  "version": "0.1.0",
  "name": "tiny_spl",
  "instructions": [
    {
      "name": "initMetadataAccount",
      "accounts": [
        {
          "name": "metadata",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "totalMetadataBytes",
          "type": "u32"
        }
      ]
    },
    {
      "name": "uploadLoggingMetadata",
      "accounts": [
        {
          "name": "metadata",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "index",
          "type": "u32"
        },
        {
          "name": "bytes",
          "type": "bytes"
        }
      ]
    },
    {
      "name": "logMetadata",
      "accounts": [
        {
          "name": "metadata",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "noopProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "closeMetadataAccount",
      "accounts": [
        {
          "name": "metadata",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": []
    },
    {
      "name": "createMint",
      "accounts": [
        {
          "name": "metadata",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "masterEdition",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mint",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "mintAuthority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "tinySplAuthority",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "sysvarInstructions",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "splTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "mplTokenMetadataProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "createMintMetadata",
          "type": {
            "defined": "CreateMintMetadata"
          }
        }
      ]
    },
    {
      "name": "mintTo",
      "accounts": [
        {
          "name": "treeAuthority",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "newLeafOwner",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "merkleTree",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mintAuthority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "treeCreatorOrDelegate",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "collectionMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "collectionMetadata",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "editionAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "bubblegumSigner",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tinySplAuthority",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "logWrapper",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "compressionProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenMetadataProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "mplBubblegumProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        },
        {
          "name": "maxSupply",
          "type": {
            "option": "u64"
          }
        }
      ]
    },
    {
      "name": "split",
      "accounts": [
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "treeCreatorOrDelegate",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "leafOwner",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "leafDelegate",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "newLeafOwner",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "collectionMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "collectionMetadata",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "editionAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "bubblegumSigner",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tinySplAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "treeAuthority",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "merkleTree",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "logWrapper",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "compressionProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenMetadataProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "mplBubblegumProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "sourceAmount",
          "type": "u64"
        },
        {
          "name": "assetId",
          "type": "publicKey"
        },
        {
          "name": "root",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        },
        {
          "name": "nonce",
          "type": "u64"
        },
        {
          "name": "index",
          "type": "u32"
        },
        {
          "name": "amounts",
          "type": {
            "vec": "u64"
          }
        }
      ]
    },
    {
      "name": "combine",
      "accounts": [
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "treeCreatorOrDelegate",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "leafOwner",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "leafDelegate",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "newLeafOwner",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "collectionMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "collectionMetadata",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "editionAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "bubblegumSigner",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tinySplAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "treeAuthority",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "merkleTree",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "logWrapper",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "compressionProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenMetadataProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "mplBubblegumProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "amounts",
          "type": {
            "vec": "u64"
          }
        },
        {
          "name": "assetIds",
          "type": {
            "vec": "publicKey"
          }
        },
        {
          "name": "roots",
          "type": {
            "vec": {
              "array": [
                "u8",
                32
              ]
            }
          }
        },
        {
          "name": "nonces",
          "type": {
            "vec": "u64"
          }
        },
        {
          "name": "indexes",
          "type": {
            "vec": "u32"
          }
        },
        {
          "name": "proofPathEndIndexesExclusive",
          "type": {
            "vec": "u32"
          }
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "loggingMetadata",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "publicKey"
          }
        ]
      }
    },
    {
      "name": "tinySplAuthority",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "isVerifiedTinySplMint",
            "type": "bool"
          },
          {
            "name": "currentSupply",
            "type": "u64"
          },
          {
            "name": "mintAuthority",
            "type": {
              "option": "publicKey"
            }
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "CreateMintMetadata",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "symbol",
            "type": "string"
          },
          {
            "name": "uri",
            "type": "string"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "MintAccountNotEmpty",
      "msg": "Mint account is not empty"
    },
    {
      "code": 6001,
      "name": "MetadataAccountNotEmpty",
      "msg": "Metadata account is not empty"
    },
    {
      "code": 6002,
      "name": "MasterEditionAccountNotEmpty",
      "msg": "Master edition account is not empty"
    },
    {
      "code": 6003,
      "name": "LeafAuthorityMustSign",
      "msg": "Leaf authority must sign"
    },
    {
      "code": 6004,
      "name": "CollectionMismatch",
      "msg": "Passed in collection mint does not match the collection mint of token"
    },
    {
      "code": 6005,
      "name": "AssetIdMismatch",
      "msg": "Passed in asset id does not match the asset id derived from the merkle tree and index"
    },
    {
      "code": 6006,
      "name": "InvalidSplitAmounts",
      "msg": "Invalid split amounts supplied"
    },
    {
      "code": 6007,
      "name": "CannotCombineSameAsset",
      "msg": "Cannot combine more than 1 of the same asset"
    },
    {
      "code": 6008,
      "name": "InvalidCombineParameters",
      "msg": "Different number of parameters supplied for combining"
    },
    {
      "code": 6009,
      "name": "ExceededMaxMintSupply",
      "msg": "Exceeded max mint supply"
    }
  ]
};

export const IDL: TinySpl = {
  "version": "0.1.0",
  "name": "tiny_spl",
  "instructions": [
    {
      "name": "initMetadataAccount",
      "accounts": [
        {
          "name": "metadata",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "totalMetadataBytes",
          "type": "u32"
        }
      ]
    },
    {
      "name": "uploadLoggingMetadata",
      "accounts": [
        {
          "name": "metadata",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "index",
          "type": "u32"
        },
        {
          "name": "bytes",
          "type": "bytes"
        }
      ]
    },
    {
      "name": "logMetadata",
      "accounts": [
        {
          "name": "metadata",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "noopProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "closeMetadataAccount",
      "accounts": [
        {
          "name": "metadata",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": []
    },
    {
      "name": "createMint",
      "accounts": [
        {
          "name": "metadata",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "masterEdition",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mint",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "mintAuthority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "tinySplAuthority",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "sysvarInstructions",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "splTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "mplTokenMetadataProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "createMintMetadata",
          "type": {
            "defined": "CreateMintMetadata"
          }
        }
      ]
    },
    {
      "name": "mintTo",
      "accounts": [
        {
          "name": "treeAuthority",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "newLeafOwner",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "merkleTree",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mintAuthority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "treeCreatorOrDelegate",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "collectionMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "collectionMetadata",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "editionAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "bubblegumSigner",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tinySplAuthority",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "logWrapper",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "compressionProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenMetadataProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "mplBubblegumProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        },
        {
          "name": "maxSupply",
          "type": {
            "option": "u64"
          }
        }
      ]
    },
    {
      "name": "split",
      "accounts": [
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "treeCreatorOrDelegate",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "leafOwner",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "leafDelegate",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "newLeafOwner",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "collectionMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "collectionMetadata",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "editionAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "bubblegumSigner",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tinySplAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "treeAuthority",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "merkleTree",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "logWrapper",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "compressionProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenMetadataProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "mplBubblegumProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "sourceAmount",
          "type": "u64"
        },
        {
          "name": "assetId",
          "type": "publicKey"
        },
        {
          "name": "root",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        },
        {
          "name": "nonce",
          "type": "u64"
        },
        {
          "name": "index",
          "type": "u32"
        },
        {
          "name": "amounts",
          "type": {
            "vec": "u64"
          }
        }
      ]
    },
    {
      "name": "combine",
      "accounts": [
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "treeCreatorOrDelegate",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "leafOwner",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "leafDelegate",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "newLeafOwner",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "collectionMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "collectionMetadata",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "editionAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "bubblegumSigner",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tinySplAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "treeAuthority",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "merkleTree",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "logWrapper",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "compressionProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenMetadataProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "mplBubblegumProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "amounts",
          "type": {
            "vec": "u64"
          }
        },
        {
          "name": "assetIds",
          "type": {
            "vec": "publicKey"
          }
        },
        {
          "name": "roots",
          "type": {
            "vec": {
              "array": [
                "u8",
                32
              ]
            }
          }
        },
        {
          "name": "nonces",
          "type": {
            "vec": "u64"
          }
        },
        {
          "name": "indexes",
          "type": {
            "vec": "u32"
          }
        },
        {
          "name": "proofPathEndIndexesExclusive",
          "type": {
            "vec": "u32"
          }
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "loggingMetadata",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "publicKey"
          }
        ]
      }
    },
    {
      "name": "tinySplAuthority",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "isVerifiedTinySplMint",
            "type": "bool"
          },
          {
            "name": "currentSupply",
            "type": "u64"
          },
          {
            "name": "mintAuthority",
            "type": {
              "option": "publicKey"
            }
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "CreateMintMetadata",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "symbol",
            "type": "string"
          },
          {
            "name": "uri",
            "type": "string"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "MintAccountNotEmpty",
      "msg": "Mint account is not empty"
    },
    {
      "code": 6001,
      "name": "MetadataAccountNotEmpty",
      "msg": "Metadata account is not empty"
    },
    {
      "code": 6002,
      "name": "MasterEditionAccountNotEmpty",
      "msg": "Master edition account is not empty"
    },
    {
      "code": 6003,
      "name": "LeafAuthorityMustSign",
      "msg": "Leaf authority must sign"
    },
    {
      "code": 6004,
      "name": "CollectionMismatch",
      "msg": "Passed in collection mint does not match the collection mint of token"
    },
    {
      "code": 6005,
      "name": "AssetIdMismatch",
      "msg": "Passed in asset id does not match the asset id derived from the merkle tree and index"
    },
    {
      "code": 6006,
      "name": "InvalidSplitAmounts",
      "msg": "Invalid split amounts supplied"
    },
    {
      "code": 6007,
      "name": "CannotCombineSameAsset",
      "msg": "Cannot combine more than 1 of the same asset"
    },
    {
      "code": 6008,
      "name": "InvalidCombineParameters",
      "msg": "Different number of parameters supplied for combining"
    },
    {
      "code": 6009,
      "name": "ExceededMaxMintSupply",
      "msg": "Exceeded max mint supply"
    }
  ]
};
