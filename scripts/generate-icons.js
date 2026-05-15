// Genera los 6 PNGs nativos a partir de variantes SVG del logo.
// Correr con: node scripts/generate-icons.js
//
// Outputs (en assets/images/):
//   icon.png                       1024×1024  cuadrado redondeado + llama (icono app)
//   splash-icon.png                1024×1024  igual que icon (Expo lo escala)
//   favicon.png                       96×96   web
//   android-icon-foreground.png    1024×1024  solo llama, fondo transparente, en zona segura
//   android-icon-background.png    1024×1024  color sólido primary
//   android-icon-monochrome.png    1024×1024  llama blanca en transparente (themed Android)

const { Resvg } = require("@resvg/resvg-js");
const fs = require("fs");
const path = require("path");

const OUT_DIR = path.join(__dirname, "..", "assets", "images");
const PRIMARY = "#6366f1";

// Lucide flame path (viewBox 0 0 24 24)
const FLAME =
  "M8.5 14.5A2.5 2.5 0 0 0 11 17a2.5 2.5 0 0 0 2.5-2.5c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z";

// Icono principal: cuadrado redondeado primary + llama blanca centrada (56% del canvas)
const fullIconSVG = (size) => `<svg width="${size}" height="${size}" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <rect width="1024" height="1024" rx="230" ry="230" fill="${PRIMARY}"/>
  <svg x="224" y="224" width="576" height="576" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">
    <path d="${FLAME}"/>
  </svg>
</svg>`;

// Llama sola sobre fondo transparente (adaptive icon foreground + monochrome).
// La llama queda en la "zona segura" central (66%) que Android NO recorta nunca.
const flameOnlySVG = `<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <svg x="320" y="320" width="384" height="384" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">
    <path d="${FLAME}"/>
  </svg>
</svg>`;

// Color sólido (adaptive icon background)
const solidBgSVG = `<svg width="1024" height="1024" xmlns="http://www.w3.org/2000/svg">
  <rect width="1024" height="1024" fill="${PRIMARY}"/>
</svg>`;

const targets = [
  { svg: fullIconSVG(1024), name: "icon.png" },
  { svg: fullIconSVG(1024), name: "splash-icon.png" },
  { svg: fullIconSVG(96), name: "favicon.png" },
  { svg: flameOnlySVG, name: "android-icon-foreground.png" },
  { svg: solidBgSVG, name: "android-icon-background.png" },
  { svg: flameOnlySVG, name: "android-icon-monochrome.png" },
];

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

for (const t of targets) {
  const resvg = new Resvg(t.svg);
  const pngBuffer = resvg.render().asPng();
  const outPath = path.join(OUT_DIR, t.name);
  fs.writeFileSync(outPath, pngBuffer);
  const kb = (pngBuffer.length / 1024).toFixed(1);
  console.log(`  ${t.name.padEnd(36)} ${kb} KB`);
}

console.log(`\nDone. ${targets.length} icons written to ${OUT_DIR}`);
