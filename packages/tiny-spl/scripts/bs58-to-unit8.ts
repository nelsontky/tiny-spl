import bs58 from "bs58";

const str = "";
const buf = bs58.decode(str);
console.log(JSON.stringify(Array.from(buf)));
