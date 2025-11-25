# Falls Park Historical Tour 🏛️

A GPS-triggered self-guided audio tour web application for Falls Park and downtown Greenville, SC. Users can preview the tour for free, then purchase the full experience for $9.99 with Stripe integration.

## 🎯 Features

- **GPS-Triggered Audio**: Automatic playback when entering 20m radius geofences
- **Interactive Map**: Real-time location tracking with React Leaflet
- **Stripe Payments**: Secure $9.99 purchase flow with serverless backend
- **Offline Support**: Download content for reliable offline experience
- **Mobile-First**: Optimized for iOS Safari and Android Chrome
- **10 Historical Stops**: Professional narration covering Greenville's transformation

## 🚀 Quick Start

### Prerequisites
- Node.js 20+ (required for Vite/Firebase compatibility)
- Firebase project with Firestore and Storage enabled
- Stripe account for payments

### Installation
```bash
# Clone and install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Configure Firebase and Stripe keys in .env.local
# Start development server
npm run dev
```

### Environment Setup
See `.env.example` for required configuration variables:
- Firebase project credentials
- Stripe publishable/secret keys
- Optional app customization settings

## 📱 Usage

### For Users
1. Scan QR code at hotel or Falls Park entrance
2. Choose "Preview Tour" for free 2-minute sample
3. Purchase full tour via Stripe ($9.99)
4. Optional: Download for offline use
5. Walk to Liberty Bridge to start GPS-triggered experience
6. Complete 10 stops at your own pace (~45 minutes)

### For Developers
- Development: `npm run dev` (requires Node 20+)
- Build: `npm run build`
- Deploy: `vercel --prod`
- Test: See `TESTING.md` for comprehensive testing plan

## 🗺️ Tour Stops

1. **Liberty Bridge** - Falls Park entrance & preview stop
2. **Reedy River Falls** - Textile era to park restoration
3. **Old Mill Ruins** - Industrial heritage along trail
4. **West End Gateway** - Revitalization story
5. **Peace Center Plaza** - Warehouse to performing arts
6. **Historic Main Street** - Urban design success
7. **Old Courthouse/Poinsett** - Civic architecture
8. **Shoeless Joe Jackson** - Baseball legend statue
9. **Wyche Pavilion** - Carriage factory to community space
10. **Falls Park Gardens** - Tour conclusion and recap

## 🏗️ Architecture

**Frontend**: React 19 + Vite + TailwindCSS  
**Maps**: React Leaflet with OpenStreetMap  
**Backend**: Firebase (Firestore + Storage)  
**Payments**: Stripe Checkout + Vercel Functions  
**Location**: Browser Geolocation API with geofencing  
**Deploy**: Vercel with custom domain support  

## 📋 Project Status

### ✅ Completed MVP Features
- [x] Mobile-responsive UI with 3-card welcome screen
- [x] Stripe payment integration with serverless functions
- [x] Interactive map with GPS location tracking
- [x] Audio player with speed controls and mini-player
- [x] Geofencing system with 20m radius triggers
- [x] Offline download capability
- [x] Firebase backend for data and analytics
- [x] Vercel deployment configuration
- [x] Comprehensive testing plan

### 🔄 Next Steps
- [ ] Content creation: Record professional audio narration
- [ ] Historical research: Gather public domain images
- [ ] Firebase project setup with production credentials
- [ ] Stripe configuration for live payments
- [ ] GPS accuracy testing at actual stop locations
- [ ] QR code generation and hotel placement
- [ ] Domain setup: falls-park-tour.vercel.app

## 🧪 Testing

Critical testing requirements:
- **On-location GPS testing** at all 10 Falls Park stops
- **Mobile browser compatibility** (iOS Safari, Android Chrome)
- **Stripe payment processing** with test cards
- **Offline functionality** after content download
- **Audio autoplay compliance** across devices

See `TESTING.md` for complete testing checklist and procedures.

## 🚢 Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to production
vercel --prod

# Configure environment variables in Vercel dashboard
# Set custom domain: falls-park-tour.vercel.app
```

### Environment Variables (Production)
- Set Firebase production config in Vercel dashboard
- Configure Stripe live keys (pk_live_*, sk_live_*)
- Enable webhook endpoints for payment verification

## 🔧 Development Notes

### Node Version
This project requires Node.js 20+ due to Vite and Firebase compatibility. Engine warnings for older versions can be ignored but may cause build failures.

### GPS Accuracy
Downtown urban canyon effects may reduce GPS accuracy. Manual trigger buttons are provided as backup for all stops.

### Audio Autoplay
Mobile browsers restrict autoplay - ensure user gesture triggers before attempting automatic playback.

## 📄 Documentation

- **`CLAUDE.md`**: Development guidance for Claude Code
- **`TESTING.md`**: Comprehensive QA and testing procedures
- **`.env.example`**: Required environment variables
- **`vercel.json`**: Deployment configuration

## 💰 Business Model

- **Price**: $9.99 one-time purchase
- **Target**: 50 sales/month by month 3
- **Costs**: ~$17/month (Stripe fees + hosting)
- **Break-even**: Month 2 after $450 initial investment

## 🤝 Contributing

1. Test GPS accuracy at Falls Park stop locations
2. Verify mobile browser compatibility 
3. Validate Stripe payment flows
4. Check offline functionality
5. Report issues with detailed device/browser info

## 📜 License

This project is private and proprietary to Basecamp Data Analytics.

---

**Built with ❤️ for Greenville, SC tourism**
