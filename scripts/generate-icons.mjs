import sharp from "sharp";
import { mkdirSync, writeFileSync } from "fs";

const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512">
  <rect width="512" height="512" rx="96" fill="#111827"/>
  <text x="50%" y="58%" font-size="260" text-anchor="middle" dominant-baseline="middle">🏋️</text>
</svg>
`;

mkdirSync("public/icons", { recursive: true });

const sizes = [192, 512];

for (const size of sizes) {
  const buffer = await sharp(Buffer.from(svg)).resize(size, size).png().toBuffer();
  writeFileSync(`public/icons/icon-${size}.png`, buffer);
  console.log(`wrote public/icons/icon-${size}.png`);
}
