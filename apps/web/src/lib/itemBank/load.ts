import fs from "node:fs";
import path from "node:path";
import type { ItemBank } from "./schema";

const BANK_PATH = path.join(
  process.cwd(),
  "src/lib/itemBank/bank.example.json",
);

export function loadBank(): ItemBank {
  const raw = fs.readFileSync(BANK_PATH, "utf8");
  return JSON.parse(raw) as ItemBank;
}
