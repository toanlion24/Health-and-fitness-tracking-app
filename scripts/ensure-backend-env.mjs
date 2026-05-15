/**
 * Create backend/.env from .env.example if .env is missing.
 * Does not overwrite an existing .env.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const target = path.join(root, "backend", ".env");
const example = path.join(root, "backend", ".env.example");

if (fs.existsSync(target)) {
  process.exit(0);
}

if (!fs.existsSync(example)) {
  console.warn("ensure-backend-env: backend/.env.example not found, skip.");
  process.exit(0);
}

fs.copyFileSync(example, target);
console.log(
  "Created backend/.env from backend/.env.example — review JWT secrets before production.",
);
