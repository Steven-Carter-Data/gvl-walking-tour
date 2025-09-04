# 🚀 Downtown Greenville Self-Guided Walking Tour - Production Deployment Guide

## Phase 1: Audio-First Launch (Free Tier)

This guide walks you through launching the Downtown Greenville Self-Guided Walking Tour starting with Vercel's free tier, focusing on audio quality and core tour experience first.

---

## 📋 Pre-Launch Checklist

### ✅ Technical Requirements
- [x] Audio playback working on mobile devices
- [x] GPS geofencing functional and tested
- [x] Payment integration with Stripe
- [x] Responsive mobile-first design
- [ ] Professional audio content (9 stops, 3-5 min each)
- [ ] Remove image functionality (streamline for audio focus)
- [ ] Clean up debugging code
- [ ] Production environment variables

### ✅ Business Requirements  
- [ ] Professional audio narration recorded
- [ ] Audio files optimized (MP3, 128kbps, mono)
- [ ] Stripe payment processing configured
- [ ] Squarespace landing page created
- [ ] QR codes generated for physical locations

---

## 🎯 Phase 1: Free Tier Launch

**Goal**: Launch audio-first tour with minimal cost to validate market demand
**Timeline**: 2-3 weeks
**Cost**: $0-5/month (Stripe fees only)

### Step 1: Code Cleanup and Image Removal

```bash
# Remove image functionality from components
# Update tour data to exclude image_urls
# Clean up debugging console.log statements
# Remove test mode toggle for production
```

**Files to update:**
- `src/components/AudioPlayer.jsx` - Remove image gallery sections
- `src/data/greenville_tour_stops_with_test_scripts.json` - Remove image_urls arrays
- `src/components/WelcomeScreen.jsx` - Clean up any image references

### Step 2: Professional Audio Integration

**Audio Specifications:**
- **Format**: MP3 (best mobile compatibility)
- **Quality**: 128kbps mono (balance quality/file size)
- **Duration**: 3-5 minutes per stop
- **Total size**: ~50MB for all 9 stops

**Recommended Audio Structure per Stop:**
1. **Welcome** (15-30 seconds) - "Welcome to [Location Name]"
2. **Historical Context** (2-3 minutes) - Main historical narrative
3. **Transition** (15-30 seconds) - "Continue to the next stop when ready"

### Step 3: Audio Hosting Options

**Option A: Direct Upload to Vercel (Recommended for Phase 1)**
```bash
# Place audio files in public/audio/ directory
public/
  audio/
    stop-01-liberty-bridge.mp3
    stop-02-reedy-falls.mp3
    # ... etc
```

**Option B: External CDN (If files are large)**
- AWS S3 + CloudFront: ~$2-5/month
- Firebase Storage: ~$1-3/month

### Step 4: Vercel Deployment Setup

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Login to Vercel
vercel login

# 3. Initialize project
vercel

# 4. Set environment variables
vercel env add VITE_STRIPE_PUBLISHABLE_KEY production
vercel env add STRIPE_SECRET_KEY production
```

**Environment Variables Needed:**
- `VITE_STRIPE_PUBLISHABLE_KEY` - Your Stripe publishable key
- `STRIPE_SECRET_KEY` - Your Stripe secret key (for API functions)

### Step 5: Domain Configuration

**Free Tier URL**: `greenville-tour.vercel.app`

**Custom Subdomain Setup** (for future upgrade):
1. Add CNAME record: `tours.basecampdataanalytics.com → cname.vercel-dns.com`
2. Configure in Vercel dashboard
3. Upgrade to Pro plan ($20/month)

---

## 🎵 Audio Content Creation Workflow

### Recording Setup
**Equipment needed:**
- Good quality USB microphone (Blue Yeti, Audio-Technica ATR2100x)
- Quiet recording space
- Audacity (free) or Adobe Audition

### Content Script Template
```
Stop [X]: [Location Name]

[INTRO - 15 seconds]
Welcome to [Location Name], stop [X] of your Greenville Historical Walking Tour.

[MAIN CONTENT - 3-4 minutes]
[Historical narrative, interesting facts, stories]

[TRANSITION - 15 seconds]
When you're ready, continue to your next stop: [Next Location]. The app will guide you there.

[END]
```

### Audio Processing Checklist
- [ ] Normalize audio levels (-16 to -20 LUFS)
- [ ] Remove background noise
- [ ] Add 1-2 seconds of silence at start/end
- [ ] Export as MP3, 128kbps, mono
- [ ] Test playback on mobile devices

---

## 🏪 Squarespace Landing Page Integration

### Option 1: Simple Redirect Page
Create a page at `/tours/greenville` that redirects to your Vercel app.

### Option 2: Embedded Preview (Recommended)
```html
<!-- Add to Squarespace Code Injection -->
<div style="text-align: center; padding: 40px;">
    <h2>Falls Park Historical Walking Tour</h2>
    <p>Experience Greenville's history with GPS-guided audio narration</p>
    <p><strong>$9.99 • 9 Historic Stops • 45 Minutes</strong></p>
    <a href="https://greenville-tour.vercel.app" 
       style="background: #4f46e5; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">
        🎧 Start Your Tour
    </a>
</div>
```

---

## 📱 QR Code Generation

Generate QR codes linking to your tour landing page:

**Primary QR Code**: Links to `basecampdataanalytics.com/tours/greenville`
**Backup QR Code**: Direct link to `greenville-tour.vercel.app`

**Recommended locations for QR codes:**
- Liberty Bridge area (main entrance)
- Falls Park visitor information board
- Downtown hotels/B&Bs
- Visitor center partnerships

---

## 📊 Launch Strategy

### Week 1-2: Soft Launch
- [ ] Deploy to Vercel free tier
- [ ] Test all functionality in Greenville (physical location testing)
- [ ] Place 1-2 QR codes at Liberty Bridge
- [ ] Gather initial user feedback

### Week 3-4: Public Launch
- [ ] Add Squarespace landing page
- [ ] Expand QR code placement
- [ ] Social media announcement
- [ ] Monitor usage and revenue

### Success Metrics
- **Technical**: 99%+ uptime, <3 second load times
- **User**: 80%+ completion rate for purchased tours
- **Business**: Break-even at ~3-5 paid tours/month

---

## 🚀 Phase 2: Growth & Optimization (Future)

**When to upgrade** (after validating demand):
- Consistent 50+ tours/month
- Revenue of $500+/month
- Need for custom domain/branding

**Phase 2 Features:**
- Upgrade to Vercel Pro ($20/month)
- Custom domain: `tours.basecampdataanalytics.com`
- Professional photos and imagery
- Additional tour routes
- User accounts and tour history
- Advanced analytics

---

## 🔧 Technical Maintenance

### Weekly Tasks
- [ ] Check Vercel deployment status
- [ ] Monitor Stripe payment logs
- [ ] Review user feedback/support requests

### Monthly Tasks  
- [ ] Analyze usage metrics
- [ ] Review and optimize audio loading performance
- [ ] Check for mobile browser updates affecting functionality

### Backup Plan
- Source code: GitHub repository
- Audio files: Local backup + cloud storage
- User data: Stripe dashboard records

---

## 💰 Cost Breakdown - Phase 1

| Service | Cost | Purpose |
|---------|------|---------|
| Vercel Free | $0 | App hosting |
| Stripe | 2.9% + $0.30/transaction | Payment processing |
| Domain | Already owned | basecampdataanalytics.com |
| Audio hosting | $0 (within Vercel limits) | Media delivery |
| **Total Monthly** | **~$0-5** | **Varies with sales** |

**Break-even**: 1 tour sale covers all monthly costs

---

## 📞 Support & Resources

- **Vercel Documentation**: https://vercel.com/docs
- **Stripe Integration**: https://stripe.com/docs/payments/checkout
- **Audio Optimization**: Audacity tutorials
- **GPS Testing**: Use actual mobile devices at tour locations

**Need help?** All configuration files and deployment scripts are included in the project repository.

---

*This guide focuses on a lean, validated launch approach. Scale up infrastructure and features based on actual user demand and revenue.*