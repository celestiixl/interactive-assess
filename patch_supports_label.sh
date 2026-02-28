#!/usr/bin/env bash
set -e

FILE="apps/web/src/components/student/AccommodationsButton.tsx"

cp "$FILE" "$FILE.bak"

# Rename label
sed -i 's/Accommodations/Supports/g' "$FILE"

# default label prop
sed -i 's/label = "Supports"/label = "Supports"/' "$FILE"

echo "Supports label updated"
