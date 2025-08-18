# Walking Route Setup Guide

To get **real walking directions that follow sidewalks and streets** (like Google Maps), you need to set up the OpenRouteService API.

## Current Status
- ✅ **Mock Routes**: Currently showing simplified paths for demo
- 🎯 **Goal**: Real walking routes following Greenville's sidewalks and trails

## Getting Real Walking Routes

### Step 1: Get Free API Key
1. Go to https://openrouteservice.org/dev/#/signup
2. Sign up for a free account
3. Get your API key from the dashboard

### Step 2: Configure Environment
1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your API key:
   ```
   VITE_OPENROUTESERVICE_API_KEY=your_actual_api_key_here
   ```

3. Restart your development server:
   ```bash
   npm run build
   npm run preview
   ```

### Step 3: Verify Real Routes
- Check browser console for: "Using OpenRouteService API for real walking directions..."
- Routes should now follow actual sidewalks and streets
- Path color changes to solid green (real routes) vs dashed blue (mock routes)

## API Features (Free Tier)
- **40 requests/minute, 2000/day** - plenty for development and tours
- **Walking profile** - optimized for pedestrians
- **Sidewalk aware** - follows actual walkable paths
- **Obstacle avoidance** - avoids buildings, water, etc.

## Fallback System
The app gracefully handles API issues:
1. **First**: Try OpenRouteService API (real sidewalk routes)
2. **Second**: Fall back to mock routes (basic paths)
3. **Third**: Fall back to direct lines (emergency only)

## Testing Real Routes
Once configured, test by:
1. Opening the map
2. Watch console logs for "Real walking route found with X waypoints"
3. Routes should now snake along actual streets instead of cutting through buildings

## Production Considerations
- Monitor API usage in the OpenRouteService dashboard
- Consider upgrading to paid tier for high-traffic applications
- Cache routes locally to reduce API calls

---

**Need Help?** The free tier is very generous and should work perfectly for your Falls Park tour app!