#!/usr/bin/env bash
# Builds Go Fish for Windows (64-bit).
# Output: dist/GoFish/ with GoFish.exe and its text files, ready for the
# Ironite Launcher or for installer/GoFishSetup.iss.
# Needs Go 1.24+ and bash (Git Bash on Windows is fine).
set -euo pipefail
cd "$(dirname "$0")"
ROOT=$PWD
BUNDLE=GoFish
EXE=GoFish
TITLE="Go Fish"                      # must match the page <title>
DESC="Go Fish - a lakeside card game"
OUT=$ROOT/dist
B=$ROOT/build
rm -rf "$OUT" "$B" && mkdir -p "$OUT/$BUNDLE" "$B"

VERSION=$(grep -m1 -oE '^## \[[0-9.]+' web/CHANGELOG.md | tr -d '#[ ')

# Windows resource (icon + version info) for the .exe
( cd tools/mkres && GOFLAGS=-mod=mod go build -o "$B/mkres" . )
cp shell/main.go shell/platform_windows.go shell/platform_other.go "$B/"
cp -r web "$B/web"
printf 'module ironite/gofish\n\ngo 1.24\n' > "$B/go.mod"
"$B/mkres" -version "$VERSION" -icon icon-1024.png -out "$B/rsrc_windows_amd64.syso" \
  -name "$TITLE" -exe "$EXE.exe" -internal "$EXE" -identity "Ironite.$BUNDLE" -desc "$DESC"
( cd "$B" && GOOS=windows GOARCH=amd64 CGO_ENABLED=0 go build -trimpath \
    -ldflags "-H windowsgui -s -w -X main.gameID=$BUNDLE -X \"main.title=$TITLE\" -X main.version=$VERSION" \
    -o "$OUT/$BUNDLE/$EXE.exe" . )

crlf() { sed 's/\r$//; s/$/\r/' "$1" > "$2"; }
crlf web/CHANGELOG.md "$OUT/$BUNDLE/CHANGELOG.txt"
crlf web/fonts/OFL.txt "$OUT/$BUNDLE/OFL.txt"
sed "s/@VERSION@/$VERSION/g" README.txt  | sed 's/\r$//; s/$/\r/' > "$OUT/$BUNDLE/README.txt"
sed "s/@VERSION@/$VERSION/g" CREDITS.txt | sed 's/\r$//; s/$/\r/' > "$OUT/$BUNDLE/CREDITS.txt"
printf '%s\r\n' "$VERSION" > "$OUT/$BUNDLE/VERSION"
rm -rf "$B"
echo "$BUNDLE $VERSION -> $OUT/$BUNDLE/$EXE.exe"
