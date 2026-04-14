/**
 * Create mobile/.env from .env.example if .env is missing (local dev convenience).
 * Does not overwrite an existing .env.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const target = path.join(root, "mobile", ".env");
const example = path.join(root, "mobile", ".env.example");

if (fs.existsSync(target)) {
  process.exit(0);
}

if (!fs.existsSync(example)) {
  console.warn("ensure-mobile-env: mobile/.env.example not found, skip.");
  process.exit(0);
}

fs.copyFileSync(example, target);
console.log("Created mobile/.env from mobile/.env.example (edit EXPO_PUBLIC_API_URL if needed).");
