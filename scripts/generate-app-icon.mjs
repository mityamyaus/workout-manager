import sharp from "sharp";
import { mkdirSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, "..", "public", "icons");
mkdirSync(outDir, { recursive: true });

// Гантель - те же path-данные, что у иконки Dumbbell из lucide-react,
// используемой в остальном интерфейсе (согласованный стиль).
const DUMBBELL_PATHS = [
  "M17.596 12.768a2 2 0 1 0 2.829-2.829l-1.768-1.767a2 2 0 0 0 2.828-2.829l-2.828-2.828a2 2 0 0 0-2.829 2.828l-1.767-1.768a2 2 0 1 0-2.829 2.829z",
  "m2.5 21.5 1.4-1.4",
  "m20.1 3.9 1.4-1.4",
  "M5.343 21.485a2 2 0 1 0 2.829-2.828l1.767 1.768a2 2 0 1 0 2.829-2.829l-6.364-6.364a2 2 0 1 0-2.829 2.829l1.768 1.767a2 2 0 0 0-2.828 2.829z",
  "m9.6 14.4 4.8-4.8",
];

function buildSvg(size) {
  // Гантель вписана в безопасную зону maskable-иконки (~60% canvas),
  // фон закрашен полностью до края - без прозрачных углов.
  const iconBox = size * 0.6;
  const scale = iconBox / 24;
  const offset = (size - iconBox) / 2;
  const strokeWidth = 1.9;

  const paths = DUMBBELL_PATHS.map((d) => `<path d="${d}"/>`).join("");

  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="#16a34a"/>
  <g transform="translate(${offset} ${offset}) scale(${scale})" fill="none" stroke="#ffffff" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round">
    ${paths}
  </g>
</svg>`;
}

async function main() {
  for (const size of [192, 512]) {
    const svg = buildSvg(size);
    await sharp(Buffer.from(svg)).png().toFile(join(outDir, `icon-${size}.png`));
    console.log(`Generated icon-${size}.png`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
