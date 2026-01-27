#!/bin/bash

# iOS Icon Generator Script
# This script generates all necessary iOS app icons from a single source icon

echo "🎨 Generating iOS App Icons..."

SOURCE_ICON="resources/icon.png"
OUTPUT_DIR="ios/App/App/Assets.xcassets/AppIcon.appiconset"

# Check if source icon exists
if [ ! -f "$SOURCE_ICON" ]; then
    echo "❌ Error: Source icon not found at $SOURCE_ICON"
    exit 1
fi

# Check if ImageMagick or sips is available
if command -v sips &> /dev/null; then
    echo "✓ Using sips for image conversion"
    CONVERTER="sips"
elif command -v magick &> /dev/null; then
    echo "✓ Using ImageMagick for image conversion"
    CONVERTER="magick"
else
    echo "❌ Error: Neither sips nor ImageMagick found."
    echo "On macOS, sips should be available by default."
    echo "If not, install ImageMagick: brew install imagemagick"
    exit 1
fi

# Create output directory if it doesn't exist
mkdir -p "$OUTPUT_DIR"

# Function to generate icon
generate_icon() {
    local size=$1
    local filename=$2
    
    if [ "$CONVERTER" = "sips" ]; then
        sips -z $size $size "$SOURCE_ICON" --out "$OUTPUT_DIR/$filename" > /dev/null 2>&1
    else
        magick "$SOURCE_ICON" -resize ${size}x${size} "$OUTPUT_DIR/$filename"
    fi
    
    if [ $? -eq 0 ]; then
        echo "  ✓ Generated $filename (${size}x${size})"
    else
        echo "  ✗ Failed to generate $filename"
    fi
}

# Generate all required iOS icon sizes
echo ""
echo "Generating icons..."

# iOS requires a single 1024x1024 icon for App Store
generate_icon 1024 "AppIcon-1024.png"

# Additional sizes for better compatibility (optional but recommended)
generate_icon 20 "AppIcon-20.png"
generate_icon 29 "AppIcon-29.png"
generate_icon 40 "AppIcon-40.png"
generate_icon 58 "AppIcon-58.png"
generate_icon 60 "AppIcon-60.png"
generate_icon 76 "AppIcon-76.png"
generate_icon 80 "AppIcon-80.png"
generate_icon 87 "AppIcon-87.png"
generate_icon 120 "AppIcon-120.png"
generate_icon 152 "AppIcon-152.png"
generate_icon 167 "AppIcon-167.png"
generate_icon 180 "AppIcon-180.png"

# Create Contents.json
cat > "$OUTPUT_DIR/Contents.json" << 'EOF'
{
  "images": [
    {
      "filename": "AppIcon-1024.png",
      "idiom": "universal",
      "platform": "ios",
      "size": "1024x1024"
    }
  ],
  "info": {
    "author": "xcode",
    "version": 1
  }
}
EOF

echo ""
echo "✅ App icons generated successfully!"
echo "📁 Location: $OUTPUT_DIR"
echo ""
echo "Next steps:"
echo "1. Run: npx cap sync ios"
echo "2. Open Xcode and verify icons in Assets.xcassets"
