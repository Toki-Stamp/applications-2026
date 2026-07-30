import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SRC_DIR = path.resolve(__dirname, "../src");
const ICONS_DIR = path.resolve(__dirname, "../src/assets/icons");
const INDEX_FILE = path.resolve(ICONS_DIR, "index.js");

const DEFAULT_ICONS = [
  "settings",
  "close",
  "live_help",
  "delete",
  "arrow_back",
  "arrow_forward",
  "lock",
  "rocket_launch",
  "search",
  "arrow_drop_down",
  "check_circle",
  "radio_button_unchecked",
  "error",
  "push_pin",
  "group",
  "group_add",
  "badge",
  "person",
  "directions_car",
  "hail",
  "directions_bus",
  "directions_walk",
  "airline_seat_recline_normal",
  "calendar_month",
  "schedule",
  "location_city",
  "edit_note",
  "restaurant",
  "hotel",
  "campaign",
  "touch_app",
  "waving_hand",
  "visibility",
  "visibility_off",
  "chevron_left",
  "chevron_right",
  "wb_sunny",
  "nightlight_round",
  "bedtime",
  "pending",
  "sync",
  "history",
];

if (!fs.existsSync(ICONS_DIR)) {
  fs.mkdirSync(ICONS_DIR, { recursive: true });
}

function cleanSvg(svgContent) {
  return svgContent
    .replace(/\s+(height|width)="[^"]*"/g, "")
    .replace(/<path /g, '<path fill="currentColor" ');
}

async function fetchIcon(iconName, retries = 3) {
  const filePath = path.join(ICONS_DIR, `${iconName}.svg`);
  const url = `https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsoutlined/${iconName}/default/24px.svg`;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url);
      if (res.ok) {
        const rawSvg = await res.text();
        const svg = cleanSvg(rawSvg);
        fs.writeFileSync(filePath, svg, "utf-8");
        console.log(
          `✅ Saved icon "${iconName}" -> src/assets/icons/${iconName}.svg`,
        );
        return true;
      }
    } catch (err) {
      if (attempt === retries) {
        console.error(
          `❌ Failed to fetch icon "${iconName}" after ${retries} attempts.`,
        );
        return false;
      }
      await new Promise((r) => setTimeout(r, 500 * attempt));
    }
  }
  return false;
}

function findFilesInDir(dir, filterExt) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      if (file !== "icons") {
        results = results.concat(findFilesInDir(filePath, filterExt));
      }
    } else {
      if (filterExt.some((ext) => file.endsWith(ext))) {
        results.push(filePath);
      }
    }
  });
  return results;
}

function scanUsedIcons() {
  const files = findFilesInDir(SRC_DIR, [".svelte", ".js"]);
  const usedIcons = new Set(DEFAULT_ICONS);

  const patterns = [
    /<md-icon[^>]*>([a-z0-9_]+)<\/md-icon>/gi,
    /icon\s*[:=]\s*["']([a-z0-9_]+)["']/gi,
    /valIcon\s*[:=]\s*["']([a-z0-9_]+)["']/gi,
    /["']?([a-z0-9_]+)["']?\s*:\s*["'](touch_app|campaign|info|warning)["']/gi,
    /\?\s*["']([a-z0-9_]+)["']\s*:\s*["']([a-z0-9_]+)["']/gi,
  ];

  for (const filePath of files) {
    if (filePath.endsWith("index.js")) continue;
    const content = fs.readFileSync(filePath, "utf-8");
    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        if (match[1]) {
          usedIcons.add(match[1].trim());
        }
        if (match[2]) {
          usedIcons.add(match[2].trim());
        }
      }
    }
  }

  return usedIcons;
}

function cleanUnusedIcons() {
  const usedIcons = scanUsedIcons();
  const existingFiles = fs
    .readdirSync(ICONS_DIR)
    .filter((f) => f.endsWith(".svg"));
  let removedCount = 0;

  for (const file of existingFiles) {
    const iconName = path.basename(file, ".svg");
    if (!usedIcons.has(iconName)) {
      fs.unlinkSync(path.join(ICONS_DIR, file));
      console.log(`🗑️ Removed unused icon: "${iconName}.svg"`);
      removedCount++;
    }
  }

  if (removedCount === 0) {
    console.log(
      `✨ All ${existingFiles.length} icons are currently in use. No unused icons found.`,
    );
  } else {
    console.log(`🧹 Cleaned up ${removedCount} unused icon(s).`);
  }
}

function generateIndexJs() {
  const files = fs.readdirSync(ICONS_DIR).filter((f) => f.endsWith(".svg"));
  const iconMap = {};

  for (const file of files) {
    const iconName = path.basename(file, ".svg");
    const content = fs.readFileSync(path.join(ICONS_DIR, file), "utf-8");
    iconMap[iconName] = content.trim();
  }

  const exportContent = `// Auto-generated SVG icon registry\nexport const iconMap = ${JSON.stringify(iconMap, null, 2)};\n`;
  fs.writeFileSync(INDEX_FILE, exportContent, "utf-8");
  console.log(`📦 Updated icon registry index.js with ${files.length} icons.`);
}

async function main() {
  const args = process.argv.slice(2);
  if (args.includes("--clean")) {
    console.log(`🔍 Scanning codebase for unused icons...`);
    cleanUnusedIcons();
  } else if (args.length === 0 || args[0] === "--all") {
    console.log(`🔄 Fetching all default icons (${DEFAULT_ICONS.length})...`);
    for (const icon of DEFAULT_ICONS) {
      await fetchIcon(icon);
    }
  } else {
    for (const icon of args) {
      if (icon !== "--clean") {
        await fetchIcon(icon);
      }
    }
  }
  generateIndexJs();
}

main();
