# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Falls Park Historical Tour is a GPS-triggered self-guided audio tour web application. Users scan QR codes to access a mobile-first web app that offers a preview experience and $9.99 full tour purchase via Stripe. The tour features 10 historical stops around Falls Park and downtown Greenville, SC with automatic audio triggers based on GPS location.

## Development Commands

```bash
# Install dependencies
npm install

# Start development server (requires Node 20+)
npm run dev

# IMPORTANT: Force cache clear if changes not appearing
npm run dev -- --host --force

# Build for production
npm run build

# Preview production build
npm run preview

# Deploy to Vercel
vercel --prod
```

## Architecture

### Tech Stack
- **Frontend**: React 19 + Vite
- **Styling**: TailwindCSS with custom components
- **Maps**: React Leaflet with OpenStreetMap
- **Backend**: Firebase (Firestore, Storage, Auth)
- **Payments**: Stripe Checkout + Vercel serverless functions
- **Deployment**: Vercel with custom domain support
- **Location**: Browser Geolocation API with geofencing

### Project Structure
```
falls-park-tour/
├── src/
│   ├── components/          # React components
│   │   ├── WelcomeScreen.jsx
│   │   ├── PaymentFlow.jsx
│   │   ├── TourMap.jsx
│   │   ├── AudioPlayer.jsx
│   │   └── OfflineDownload.jsx
│   ├── config/             # Configuration files
│   │   ├── firebase.js
│   │   └── stripe.js
│   ├── services/           # Backend service integrations
│   │   ├── firestore.js
│   │   ├── storage.js
│   │   └── analytics.js
│   ├── utils/              # Utility functions
│   │   ├── location.js
│   │   ├── storage.js
│   │   └── stripe.js
│   ├── hooks/              # Custom React hooks
│   │   ├── useLocation.js
│   │   └── useOffline.js
│   └── data/               # Tour data
│       └── greenville_tour_stops.json
├── api/                    # Vercel serverless functions
│   ├── create-checkout-session.js
│   └── verify-payment.js
└── TESTING.md             # Comprehensive testing plan
```

## Configuration Setup

### Environment Variables
Copy `.env.example` to `.env.local` and configure:

```env
# Firebase
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef

# Stripe
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_key

# Server-side (Vercel)
STRIPE_SECRET_KEY=sk_test_your_key
```

### Firebase Setup
1. Create Firebase project at https://console.firebase.google.com
2. Enable Firestore Database
3. Enable Storage with public read rules for audio/images
4. Configure authentication (optional - app works without accounts)
5. Update `src/config/firebase.js` with your config

### Stripe Setup
1. Create account at https://stripe.com
2. Get test keys for development
3. Configure webhook endpoints for payment verification
4. Set up product catalog (optional)

## Key Features

### User Flow
1. **QR Code Scan** → Landing page with 3 options
2. **Preview** → Free 2-minute sample at Liberty Bridge
3. **Purchase** → Stripe Checkout for $9.99 
4. **Download** → Optional offline content caching
5. **Tour** → GPS-triggered audio at 10 stops with map navigation

### GPS Geofencing
- 20m radius circular geofences around each stop
- Automatic audio trigger on entry
- Manual trigger buttons as backup
- Real-time location tracking with privacy controls
- Distance calculation using Haversine formula

### Audio Experience
- Professional narration (3-5 minutes per stop)
- Mini-player with play/pause/skip controls
- Variable playback speed (1x - 2x)
- Background audio with visual overlay
- Offline playback support

### Payment Integration
- Stripe Checkout for secure processing
- One-time purchase model ($9.99)
- Purchase state persisted in localStorage
- Payment verification via serverless functions
- Demo mode for development/testing

## Tour Data Format

Each stop in `greenville_tour_stops.json`:
```json
{
  "id": "unique-stop-identifier",
  "order": 1,
  "title": "Stop Name",
  "coordinates": { "lat": 34.8524, "lng": -82.3940 },
  "radius_m": 20,
  "duration_sec_estimate": 180,
  "description": "Historical context text",
  "audio_url": "https://example.com/audio.mp3",
  "image_urls": ["https://example.com/image1.jpg"],
  "autoplay_on_enter": true,
  "geofence_type": "circle"
}
```

## Testing Strategy

See `TESTING.md` for comprehensive testing plan including:
- Device/browser compatibility testing
- GPS accuracy validation at each stop location  
- Payment flow testing with Stripe test mode
- Offline functionality verification
- Performance benchmarking
- Accessibility compliance

### Critical Test Scenarios
1. **On-location GPS testing** at all 10 stops in Falls Park
2. **Mobile browser audio** autoplay compliance
3. **Payment processing** with test cards
4. **Offline mode** after content download
5. **Network failure** graceful degradation

## Deployment

### Vercel Deployment
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Set environment variables in Vercel dashboard
# Configure custom domain: tours.basecampdataanalytics.com
```

### Domain Setup
- Main app: `tours.basecampdataanalytics.com`
- QR codes redirect to landing page
- Squarespace integration via iframe or redirect

## Development Troubleshooting

### CRITICAL: Vite Cache Issues
**Problem:** Code changes not appearing in browser despite saving files  
**Symptoms:** Old console logs, outdated component behavior, unchanged UI  
**Solution:** Force clear Vite cache and restart dev server
```bash
# Stop current dev server (Ctrl+C)
npm run dev -- --host --force
```
**Why this happens:** Vite aggressively caches compiled modules. When React components are heavily modified, the cache may serve stale versions even after file changes.

### Welcome Audio Implementation
- **Location:** Added to `TourMap.jsx` as modal overlay after "Start Premium Experience"
- **Audio file:** `/public/audio/0_WELCOME.wav`  
- **User flow:** Welcome → Start Tour → Welcome Audio Modal → Dismiss → Tour Map
- **Manual play:** Users must click "Play Welcome Audio" button

## Common Issues

### Node Version Compatibility
- Requires Node 20+ for Vite and Firebase
- Use `nvm use 20` or similar to switch versions
- Engine warnings can be ignored but may cause build issues

### GPS Accuracy
- Urban canyon effects downtown can reduce accuracy
- Test at actual locations, not just simulated coordinates  
- Provide manual trigger buttons as backup

### Mobile Audio Autoplay
- iOS Safari requires user gesture before autoplay
- Android Chrome has similar restrictions
- Use touch-to-play fallbacks with clear UI indicators

### Stripe Testing
- Use test card numbers: 4242 4242 4242 4242
- Test both successful and failed payments
- Verify webhook endpoints are properly configured