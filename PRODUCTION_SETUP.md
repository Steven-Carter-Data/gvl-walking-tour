# 🚀 Production Setup Guide

## Quick Setup Checklist

### 1. Firebase Project Setup (5 minutes)
1. Go to https://console.firebase.google.com
2. Create project: `falls-park-tour`
3. Enable Firestore Database (start in test mode)
4. Enable Storage (start in test mode)
5. Get your config from Project Settings → Your apps → Web app

**Update `.env.local` with your Firebase config:**
```env
VITE_FIREBASE_API_KEY=your_actual_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_actual_sender_id
VITE_FIREBASE_APP_ID=your_actual_app_id
```

### 2. Stripe Setup (5 minutes)
1. Go to https://dashboard.stripe.com
2. Get your API keys from Developers → API keys
3. For testing: Use test keys (start with `pk_test_` and `sk_test_`)

**Update `.env.local` with your Stripe keys:**
```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key
STRIPE_SECRET_KEY=sk_test_your_secret_key
```

### 3. Vercel Deployment (10 minutes)
1. Go to https://vercel.com
2. Connect your GitHub account
3. Import this repository
4. Set environment variables in Vercel dashboard
5. Deploy!

**Custom domain setup:**
- Add `tours.basecampdataanalytics.com` in Vercel domain settings
- Update your DNS to point to Vercel

## Environment Variables Reference

**Required for production:**
```env
# Firebase
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=

# Stripe
VITE_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=

# App
VITE_APP_TITLE=Falls Park Historical Tour
VITE_APP_PRICE=9.99
VITE_APP_CURRENCY=USD
```

## Testing Your Setup

1. **Local testing:**
   ```bash
   npm run build
   npm run preview
   ```

2. **Test Firebase connection:**
   - Check browser console for Firebase errors
   - Test payment flow (use Stripe test cards)

3. **Test Stripe payments:**
   - Use test card: `4242 4242 4242 4242`
   - Any future date, any CVC

## Security Notes

**Firebase Security Rules (to set later):**
```javascript
// Firestore rules (read-only for tour data)
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read: if true;
      allow write: if false; // Admin only
    }
  }
}

// Storage rules (public read for audio/images)
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if true;
      allow write: if false; // Admin only
    }
  }
}
```

## Simple Architecture

**Current setup:**
- **Frontend:** React app (static files)
- **Backend:** Vercel serverless functions for Stripe
- **Database:** Firebase Firestore (for analytics)
- **Storage:** Firebase Storage (for audio files)
- **Payments:** Stripe Checkout

**Data flow:**
1. User visits site → Static React app loads
2. User purchases → Vercel function → Stripe
3. User uses tour → Audio files from Firebase Storage
4. Analytics → Firebase Firestore

## Next Steps After Setup

1. **Test everything works locally**
2. **Deploy to Vercel**
3. **Test production environment**
4. **Add your recorded audio files**
5. **Go live!**

Keep it simple - this setup handles 1000+ users easily and costs <$20/month.