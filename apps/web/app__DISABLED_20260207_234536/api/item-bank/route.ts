import { NextResponse } from "next/server";
import { loadBank } from "@/lib/itemBank/load";
import { filterItems } from "@/lib/itemBank/filter";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const query = Object.fromEntries(url.searchParams.entries());
  const bank = loadBank();
  const items = filterItems(bank.items, query);

  return NextResponse.json({
    version: bank.version,
    count: items.length,
    items
  });
}
