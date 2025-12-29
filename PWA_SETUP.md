# PWA (Progressive Web App) Setup

## ✅ PWA Features Added

Your Gold Shop CRM is now a Progressive Web App with the following features:

### 🎯 Features

1. **Installable App**
   - Users can install the app on their devices (mobile, tablet, desktop)
   - Appears like a native app with its own icon
   - Works offline after first load

2. **Offline Support**
   - Service worker caches app resources
   - Works without internet connection
   - Data stored in localStorage persists offline

3. **App Manifest**
   - Custom app name: "Gold Shop CRM"
   - Short name: "Gold CRM"
   - Theme colors and icons configured
   - App shortcuts for quick actions

4. **Install Prompt**
   - Automatic install prompt appears on supported browsers
   - Users can install with one click
   - Dismissible prompt

### 📱 How to Install

#### On Mobile (Android/iPhone):
1. Open the app in your browser
2. Look for "Add to Home Screen" option
3. Tap to install
4. App icon will appear on home screen

#### On Desktop (Chrome/Edge):
1. Look for install icon in address bar
2. Click "Install" button
3. App will open in standalone window

#### On Desktop (Other browsers):
1. Look for install prompt at bottom of screen
2. Click "Install" button

### 🔧 Technical Details

- **Service Worker**: Automatically registered (`/sw.js`)
- **Manifest**: `/manifest.json` and `/manifest.webmanifest`
- **Caching Strategy**: NetworkFirst (tries network, falls back to cache)
- **Build**: Uses webpack (configured in `package.json`)

### 📝 Files Added/Modified

1. **`next.config.mjs`** - PWA configuration with next-pwa
2. **`app/manifest.ts`** - Next.js manifest route
3. **`app/viewport.ts`** - Viewport and theme color configuration
4. **`app/layout.tsx`** - Updated with PWA metadata
5. **`components/pwa-install-prompt.tsx`** - Install prompt component
6. **`public/manifest.json`** - Web app manifest
7. **`package.json`** - Added next-pwa dependency, updated build script

### 🚀 Build & Deploy

The app now builds with PWA support:

```bash
npm run build
```

This generates:
- Service worker files in `public/`
- Manifest files
- Optimized PWA assets

### ⚠️ Important Notes

1. **Development Mode**: PWA is disabled in development (`npm run dev`)
   - This is intentional to avoid caching issues during development
   - PWA only works in production builds

2. **HTTPS Required**: 
   - PWA features require HTTPS in production
   - Service workers only work on HTTPS (or localhost)

3. **Browser Support**:
   - Chrome/Edge: Full support
   - Firefox: Good support
   - Safari: Limited support (iOS 11.3+)
   - Opera: Full support

### 🧪 Testing PWA

1. Build the app: `npm run build`
2. Start production server: `npm start`
3. Open in browser
4. Check browser console for service worker registration
5. Try installing the app
6. Test offline functionality

### 📊 PWA Checklist

- ✅ Manifest file configured
- ✅ Service worker registered
- ✅ Icons provided (multiple sizes)
- ✅ Theme color set
- ✅ Install prompt component
- ✅ Offline caching strategy
- ✅ App shortcuts configured
- ✅ Viewport configured
- ✅ Apple touch icon set

### 🎉 Benefits

- **Better User Experience**: App-like feel
- **Offline Access**: Works without internet
- **Fast Loading**: Cached resources
- **Easy Access**: Install on home screen
- **Professional**: Looks like a native app

Your Gold Shop CRM is now a fully functional PWA! 🚀

