#!/usr/bin/env bash
set -e

ROOT="/workspaces/interactive-assess/apps/web/src"

# find the SpecimenGrid file automatically
FILE=$(rg -l "SpecimenGrid" "$ROOT" | grep -i specimen | head -n 1)

if [ -z "$FILE" ]; then
  echo "❌ Could not find SpecimenGrid file"
  exit 1
fi

echo "Patching: $FILE"

# backup
cp "$FILE" "$FILE.bak.$(date +%s)"

# inject props typing if missing
perl -0777 -i -pe '
s/export default function SpecimenGrid\s*\(\s*\)/type Segment = {
  key: string;
  label: string;
  value: number;
  group: string;
};

type Props = { segments: Segment[] };

export default function SpecimenGrid({ segments }: Props)/s
' "$FILE"

echo "✅ SpecimenGrid now accepts segments prop"
