import * as fs from "fs";
import * as path from "path";

/**
 * Encode image as a base64 string and add that to the metadata json
 * @returns {string} metadata json as a string
 */
export default function generateMetaData(): string {
  // const imageFile = fs.readFileSync(
  //   path.join(__dirname, "assets", "image.webp")
  // );
  // const imageBase64 = imageFile.toString("base64");
  // const imageUri = `data:image/webp;base64,${imageBase64}`;

  const metadataFile = fs.readFileSync(
    path.join(__dirname, "assets", "metadata.json")
  );
  const metadata = JSON.parse(metadataFile.toString());
  metadata.image = `https://metadata.tinys.pl/tx?id=41JP4i5hwPm3c8k39EH9jS4S1hunPDoP8wueAVFMTx8k9XD4TJYB29DCzLjVLJKqiDim8puGYUEnjWbptudjTznX&contentType=${encodeURIComponent(
    "image/webp"
  )}`;

  return JSON.stringify(metadata);
}
