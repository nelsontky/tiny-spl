import idl from "../target/idl/tiny_spl.json";
import fs from "fs";
import path from "path";

const idlToEdit: any = idl;

const missingTypes = [
  {
    name: "TokenStandard",
    type: {
      kind: "enum",
      variants: [
        {
          name: "NonFungible",
        },
        {
          name: "FungibleAsset",
        },
        {
          name: "Fungible",
        },
        {
          name: "NonFungibleEdition",
        },
      ],
    },
  },
  {
    name: "Collection",
    type: {
      kind: "struct",
      fields: [
        {
          name: "verified",
          type: "bool",
        },
        {
          name: "key",
          type: "publicKey",
        },
      ],
    },
  },
  {
    name: "Uses",
    type: {
      kind: "struct",
      fields: [
        {
          name: "useMethod",
          type: {
            defined: "UseMethod",
          },
        },
        {
          name: "remaining",
          type: "u64",
        },
        {
          name: "total",
          type: "u64",
        },
      ],
    },
  },
  {
    name: "UseMethod",
    type: {
      kind: "enum",
      variants: [
        {
          name: "Burn",
        },
        {
          name: "Multiple",
        },
        {
          name: "Single",
        },
      ],
    },
  },
  {
    name: "TokenProgramVersion",
    type: {
      kind: "enum",
      variants: [
        {
          name: "Original",
        },
        {
          name: "Token2022",
        },
      ],
    },
  },
  {
    name: "Creator",
    type: {
      kind: "struct",
      fields: [
        {
          name: "address",
          type: "publicKey",
        },
        {
          name: "verified",
          type: "bool",
        },
        {
          name: "share",
          docs: [
            "The percentage share.",
            "",
            "The value is a percentage, not basis points.",
          ],
          type: "u8",
        },
      ],
    },
  },
];

idlToEdit.types = [...idl.types, ...missingTypes];

fs.writeFileSync(
  path.join(__dirname, "../target/idl/tiny_spl.json"),
  JSON.stringify(idlToEdit, null, 2)
);
