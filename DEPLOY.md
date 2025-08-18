# 🚀 Deploy to Production

## Quick Deployment Steps

### 1. Test Locally First
```bash
# Build and test locally
npm run build
npm run preview

# Check for any errors in browser console
# Test basic functionality (preview, map, payment flow)
```

### 2. Vercel Deployment

**Option A: Command Line (Recommended)**
```bash
# Install Vercel CLI if you haven't
npm i -g vercel

# Deploy from project folder
vercel --prod

# Follow prompts:
# - Link to existing project? No
# - Project name: falls-park-tour
# - Framework: Vite
# - Build command: npm run build
# - Output directory: dist
```

**Option B: GitHub Integration**
1. Push code to GitHub repository
2. Go to https://vercel.com
3. Import repository
4. Configure build settings (auto-detected for Vite)
5. Add environment variables (see below)

### 3. Environment Variables in Vercel

In Vercel dashboard → Settings → Environment Variables:

**Add these variables:**
```
VITE_FIREBASE_API_KEY = your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN = your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID = your_project_id
VITE_FIREBASE_STORAGE_BUCKET = your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID = your_sender_id
VITE_FIREBASE_APP_ID = your_app_id
VITE_STRIPE_PUBLISHABLE_KEY = pk_test_your_key
STRIPE_SECRET_KEY = sk_test_your_secret_key
```

### 4. Custom Domain Setup

**In Vercel:**
1. Go to your project → Settings → Domains
2. Add custom domain: `tours.basecampdataanalytics.com`

**In your domain provider (Squarespace/GoDaddy/etc):**
1. Add CNAME record: `tours` → `cname.vercel-dns.com`
2. Wait 5-10 minutes for DNS propagation

### 5. Test Production Environment

**After deployment, test:**
- [ ] Site loads at your custom domain
- [ ] Preview audio plays correctly
- [ ] Payment flow works (use test card: 4242 4242 4242 4242)
- [ ] Tour map loads and shows stops
- [ ] Audio player works when clicking Liberty Bridge marker
- [ ] No console errors in browser dev tools

### 6. QR Code Generation

**Once deployed, create QR codes for:**
- Main URL: `https://tours.basecampdataanalytics.com`
- Print QR codes for hotel lobbies, visitor centers

**Simple QR code tools:**
- qr-code-generator.com
- Google "QR code generator"

## Monitoring & Maintenance

**Simple monitoring:**
- Vercel dashboard shows traffic and errors
- Firebase console shows database/storage usage
- Stripe dashboard shows payments

**Monthly costs (estimated):**
- Vercel: Free (for your traffic level)
- Firebase: Free tier (for your usage)
- Stripe: 2.9% + 30¢ per transaction
- **Total: ~$15-20/month at 50 sales**

## Troubleshooting

**Common deployment issues:**

1. **Build fails:**
   - Check Node.js version (needs 20+)
   - Verify all dependencies installed

2. **Environment variables not working:**
   - Ensure they start with `VITE_` for frontend
   - Redeploy after adding variables

3. **Firebase connection errors:**
   - Check Firebase rules allow public read
   - Verify API keys are correct

4. **Stripe payment fails:**
   - Confirm webhook endpoints (if using)
   - Check test/live key configuration

**Need help?** Check browser console for specific error messages.

## Post-Deployment Checklist

- [ ] Site accessible at custom domain
- [ ] All functionality tested
- [ ] QR codes generated and tested
- [ ] Firebase security rules configured
- [ ] Stripe payments working
- [ ] Analytics tracking (if desired)

**Your tour app is ready for production! 🎉**