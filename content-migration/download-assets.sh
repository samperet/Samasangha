#!/bin/bash
# Download all audio assets from northeastsufis.org
# Run from project root: bash content-migration/download-assets.sh

BASE="https://northeastsufis.org/wp-content/uploads"
DEST="public/uploads/audio"

mkdir -p "$DEST"

echo "Downloading audio assets from northeastsufis.org..."

files=(
  "2022/05/Bridge-sample.mp3"
  "2022/05/sama2-online-audio-converter.com_.mp3"
  "2022/05/Voice-of-the-Heart-Samples.mp3"
  "2022/09/Almighty-Peace.mp3"
  "2022/09/Andalusian-Zikr.mp3"
  "2022/09/Ani-Mahamin.mp3"
  "2022/09/Fatimas-Gift.mp3"
  "2022/09/Healing-Love.mp3"
  "2022/09/Lokah-Samastah.mp3"
  "2022/09/Ruach.mp3"
  "2022/09/Shakti-Ye.mp3"
  "2022/09/Zimbabwe-Zikr.mp3"
  "2022/09/Zikr-of-the-Heart-1.mp3"
  "2022/10/Nuru-Zaleme.mp3"
  "2022/12/Waters-of-Life-sample.mp3"
)

for f in "${files[@]}"; do
  filename=$(basename "$f")
  if [ -f "$DEST/$filename" ]; then
    echo "  SKIP (exists): $filename"
  else
    echo "  Downloading: $filename"
    curl -s -o "$DEST/$filename" "$BASE/$f" && echo "  OK: $filename" || echo "  FAILED: $filename"
    sleep 0.5
  fi
done

# External (non-WP) file
echo "  Downloading: sama3-voice-of-heart.mp3 (external)"
curl -s -o "$DEST/sama3-voice-of-heart.mp3" \
  "http://northeastsufishop.wordpress.com/files/2009/10/sama3.mp3" \
  && echo "  OK" || echo "  FAILED (may need manual download)"

echo ""
echo "Done. Files saved to $DEST/"
echo "Update the audioUrl fields in the DB to use /uploads/audio/<filename>"
