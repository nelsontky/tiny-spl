import idl from "../target/idl/tiny_spl.json";
import fs from "fs";
import path from "path";

const idlToEdit: any = idl;

const missingTypes = [];

idlToEdit.types = [...idl.types, ...missingTypes];

fs.writeFileSync(
  path.join(__dirname, "../target/idl/tiny_spl.json"),
  JSON.stringify(idlToEdit, null, 2)
);
