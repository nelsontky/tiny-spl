import idl from "../target/idl/tiny_spl.json";
import fs from "fs";

const updatedIdl = idl as any;

const updatedEvents = updatedIdl.events.map((event) => ({
  name: event.name,
  type: {
    kind: "struct",
    fields: event.fields,
  },
}));
updatedIdl.types.push(...updatedEvents);
delete updatedIdl.events;

fs.writeFileSync(
  "target/idl/tiny_spl.json",
  JSON.stringify(updatedIdl, null, 2)
);
