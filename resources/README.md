# App Icon & Splash Screen Setup

## Quick Setup (Recommended)

### Option 1: Using @capacitor/assets (Easiest)

1. Install the assets generator:
```bash
npm install -g @capacitor/assets
```

2. Place your logo image (1024x1024 PNG) at:
   - `resources/icon.png` (for app icon)
   - `resources/splash.png` (for splash screen - 2732x2732 PNG recommended)

3. Generate all icons and splash screens:
```bash
npx @capacitor/assets generate --iconBackgroundColor '#2563eb' --splashBackgroundColor '#2563eb'
```

This will automatically generate all required iOS and Android icons/splash screens!

### Option 2: Manual iOS Setup

If you want to manually add icons to iOS:

1. Open Xcode:
```bash
npx cap open ios
```

2. In Xcode:
   - Click on "App" in the left sidebar (project navigator)
   - Click on "App" under TARGETS
   - Go to "General" tab
   - Find "App Icons and Launch Screen" section
   - Click on "AppIcon" 
   - Drag and drop your icon images for each size

Required iOS icon sizes:
- 20x20 (2x, 3x)
- 29x29 (2x, 3x)
- 40x40 (2x, 3x)
- 60x60 (2x, 3x)
- 76x76 (2x)
- 83.5x83.5 (2x)
- 1024x1024 (1x - App Store)

## Using Your Logo

Since you have the logo image:

1. **Save your logo** as a 1024x1024 PNG file
   - Name it `icon.png`
   - Place it in the `resources/` folder

2. **For splash screen** (optional but recommended):
   - Create a 2732x2732 PNG with your logo centered
   - Name it `splash.png`
   - Place it in the `resources/` folder

3. **Run the generator**:
```bash
npx @capacitor/assets generate --iconBackgroundColor '#2563eb' --splashBackgroundColor '#2563eb'
```

4. **Sync with iOS**:
```bash
npm run build
npx cap sync ios
npx cap open ios
```

## Current Status

✅ Capacitor config updated with proper settings
✅ Resources folder created
✅ Icon SVG template created (replace with your actual PNG)

## Next Steps

1. Replace `resources/icon.svg` with your actual `icon.png` (1024x1024)
2. Optionally create `resources/splash.png` (2732x2732)
3. Run the asset generator command above
4. Build and sync your app

## Quick Commands

```bash
# Build the web app
npm run build

# Sync with iOS
npx cap sync ios

# Open in Xcode
npx cap open ios

# Run on iOS simulator
npx cap run ios
```

## Troubleshooting

If icons don't update:
1. Clean the iOS build: `npx cap sync ios --clean`
2. In Xcode: Product > Clean Build Folder
3. Rebuild the app

## App Store Icon

For App Store submission, you need a 1024x1024 icon with:
- No transparency
- No rounded corners (Apple adds them automatically)
- RGB color space
- PNG format
