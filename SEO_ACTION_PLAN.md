# SEO Action Plan for Falls Park Tour

## ✅ DONE - On-Page SEO (Just Implemented)

### Meta Tags & Structured Data
- ✅ SEO-optimized title with target keywords
- ✅ Compelling meta description
- ✅ Geographic meta tags (coordinates for Falls Park)
- ✅ Open Graph tags (Facebook/LinkedIn sharing)
- ✅ Twitter Card tags
- ✅ Schema.org structured data (TouristAttraction type)
- ✅ Canonical URL

**Result:** Google can now properly understand your page content and location.

---

## 🚨 CRITICAL - Must Do Immediately (Week 1)

### 1. Google Business Profile (FREE - Most Important!)
**Why:** Appears in Google Maps and local search results for "things to do in Greenville"

**Steps:**
1. Go to https://business.google.com
2. Create profile for "Falls Park Self-Guided Walking Tour"
3. **Business Category:** "Tour Operator" (PRIMARY) + "Tourist Attraction"
4. **Address:** Falls Park on the Reedy, Greenville, SC 29601
5. **Website:** https://tours.basecampdataanalytics.com
6. **Phone:** Your contact number
7. **Hours:** 24/7 (self-guided)
8. **Description:** Use exact keywords:
   ```
   Self-guided walking tour of Falls Park and downtown Greenville, SC.
   GPS-triggered audio narration at 7 historic stops. Pay what you want -
   most people choose $8. Start anytime, no reservations. One of the best
   things to do in Greenville for history lovers and tourists.
   ```
9. **Add Photos:**
   - Your flyover video (as photo album)
   - Falls Park Liberty Bridge
   - Each tour stop location
   - Screenshots of the app
10. **Add Services:**
    - "Self-Guided Tours"
    - "Audio Tours"
    - "Walking Tours"
11. **Enable Messaging** so tourists can ask questions

**Expected Timeline:** Appears in Google Maps/Search within 1-2 weeks

---

### 2. Create Social Media Images (For Sharing)
You need these images that are referenced in your new meta tags:

**Required Files:**
- `/public/og-image.jpg` (1200x630px) - Facebook/LinkedIn share preview
- `/public/twitter-card.jpg` (1200x600px) - Twitter share preview
- `/public/favicon.ico` - Replace the Vite default icon

**What to Include:**
- Falls Park Liberty Bridge photo
- Text overlay: "Falls Park Self-Guided Tour | Greenville SC"
- Your branding colors (#d4967d copper)

**Tools to Create:**
- Canva.com (free templates for OG images)
- Or hire on Fiverr for $5-15

---

### 3. Submit to Search Engines (FREE)

**Google Search Console:**
1. Go to https://search.google.com/search-console
2. Add property: `tours.basecampdataanalytics.com`
3. Verify ownership (via DNS or HTML file)
4. Submit sitemap: `https://tours.basecampdataanalytics.com/sitemap.xml`

**Bing Webmaster Tools:**
1. Go to https://www.bing.com/webmasters
2. Add your site
3. Import from Google Search Console (easier)

**Expected Timeline:** Indexed within 3-7 days

---

## 📝 IMPORTANT - Content Strategy (Week 2-3)

### 4. Create a Blog Section (Huge for SEO!)
**Why:** Blog posts rank for long-tail keywords like "best walking tours in Greenville SC"

**5 Blog Post Ideas:**
1. **"10 Things to Do in Greenville SC: A Local's Guide"**
   - Mention your tour as #1
   - Link to tour page
   - Target: "things to do in Greenville SC"

2. **"Falls Park History: The Story Behind Greenville's Iconic Bridge"**
   - Deep dive into Liberty Bridge history
   - Target: "Falls Park history", "Liberty Bridge Greenville"

3. **"Self-Guided vs Guided Tours in Greenville: Which is Better?"**
   - Objective comparison
   - Target: "Greenville tours", "walking tour Greenville"

4. **"Complete Guide to Visiting Falls Park (2025 Update)"**
   - Parking, best times, photo spots
   - Target: "Falls Park Greenville", "visit Falls Park"

5. **"7 Hidden Historical Gems in Downtown Greenville"**
   - Feature your 7 tour stops
   - Target: "Greenville history", "downtown Greenville attractions"

**Frequency:** 1 post per week minimum

**Technical Setup:**
- Add `/blog` route to your React app
- Or create simple blog on Basecamp website linking to tour
- Use WordPress, Ghost, or even Medium

---

### 5. Get Listed on Tourism Directories (FREE - Week 2)

**Submit to these sites:**
- ✅ **VisitGreenvilleSC.com** - Official tourism site (CRITICAL!)
  - Contact: info@visitgreenvillesc.com
  - Request to be added to "Tours & Attractions"

- ✅ **TripAdvisor**
  - Create free listing: https://www.tripadvisor.com/Owners
  - Category: "Tours & Activities"
  - Ask customers for reviews

- ✅ **Yelp**
  - Claim business: https://biz.yelp.com
  - Category: "Tours"

- ✅ **Viator/GetYourGuide** (paid listings, but huge traffic)
  - Consider after you have some reviews

- ✅ **Eventbrite/Eventful** - List as ongoing event

**Local Directories:**
- Greenville Chamber of Commerce
- Discover South Carolina (DiscoverSouthCarolina.com)
- South Carolina Tourism Board

---

## 🔗 LINK BUILDING - Off-Page SEO (Ongoing)

### 6. Get Backlinks from Local Sites
**Why:** Links from other websites = votes of confidence to Google

**Target Websites:**
1. **Local Blogs:**
   - Reach out to Greenville food/lifestyle bloggers
   - Offer free tour in exchange for honest review

2. **Hotel & Restaurant Partnerships:**
   - Contact concierges at downtown hotels
   - Ask to include your tour in "Things to Do" recommendations
   - Offer affiliate commission (5-10% per booking)

3. **Greenville News/Media:**
   - Send press release to The Greenville News
   - Pitch story: "Local company launches innovative self-guided tour"

4. **College Partnerships:**
   - Furman University, Bob Jones University
   - Student activities office might promote to students

**How to Reach Out:**
Email template:
```
Subject: Partner Opportunity - Falls Park Self-Guided Tour

Hi [Name],

I'm the developer of a new self-guided walking tour app for
Falls Park in Greenville. We've created GPS-triggered audio
experiences that help visitors explore Greenville's history at
their own pace.

I noticed you write about [Greenville activities/tourism/etc]
and thought your audience might be interested. Would you be
open to trying the tour and potentially mentioning it if you
find it valuable?

I'd be happy to provide complimentary access.

Best,
[Your Name]
https://tours.basecampdataanalytics.com
```

---

## 🎯 TECHNICAL SEO - Performance (Week 3-4)

### 7. Create a Sitemap
**Why:** Helps Google discover all your pages

**Action:** Install sitemap plugin or create manually:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://tours.basecampdataanalytics.com/</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://tours.basecampdataanalytics.com/blog</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>
```

Save as `/public/sitemap.xml`

---

### 8. Create robots.txt
**Why:** Tells search engines what to crawl

**Action:** Create `/public/robots.txt`:
```
User-agent: *
Allow: /
Sitemap: https://tours.basecampdataanalytics.com/sitemap.xml
```

---

### 9. Page Speed Optimization
**Why:** Google ranks faster sites higher

**Check Current Speed:**
- Run test: https://pagespeed.web.dev
- Enter: tours.basecampdataanalytics.com

**Common Fixes:**
- Compress images (use WebP format)
- Lazy load below-fold images
- Minify CSS/JS (Vite does this automatically in production)
- Enable Vercel's automatic compression

---

## 📊 TRACKING & ANALYTICS (Week 1)

### 10. Install Google Analytics 4
**Why:** Track where visitors come from and what they do

**Setup:**
1. Create GA4 property: https://analytics.google.com
2. Get Measurement ID (starts with G-)
3. Add to your React app:
   ```bash
   npm install react-ga4
   ```
4. Initialize in your main app file

---

### 11. Set Up Google Tag Manager (Optional but Recommended)
**Why:** Easier to add tracking pixels without code changes

**Setup:**
1. Create account: https://tagmanager.google.com
2. Add container code to index.html
3. Install GA4, Facebook Pixel, etc via Tag Manager

---

## 💰 PAID OPTIONS (If You Have Budget)

### 12. Google Ads - Local Service Ads
**Cost:** Pay-per-click (estimate $1-3 per click)
**Target Keywords:**
- "things to do in Greenville SC"
- "Greenville tours"
- "Falls Park tour"

**Budget Recommendation:** Start with $10/day ($300/month)

---

### 13. Facebook/Instagram Ads
**Cost:** ~$5-10/day
**Target Audience:**
- Location: Within 50 miles of Greenville
- Interests: Travel, history, hiking
- Age: 25-65

**Ad Creative:**
- Use your flyover video
- Call-to-action: "Start Your Tour"

---

## 🎖️ REVIEW STRATEGY (Ongoing - CRITICAL!)

### 14. Get Reviews (Makes or Breaks SEO)
**Why:** Google heavily weighs review quantity and rating

**Action Plan:**
1. After tour completion, show popup:
   ```
   "Enjoyed the tour?
   Leave us a 5-star review on Google!
   It helps other visitors discover Greenville's history."

   [Review on Google Button]
   ```

2. Send follow-up email with review link
3. Target: 50+ reviews in first 6 months

**Google Review Link:**
Once you set up Google Business Profile, get your short review link:
- Format: `https://g.page/r/[YOUR_UNIQUE_ID]/review`

---

## 📈 TIMELINE & EXPECTATIONS

### Week 1-2: Foundation
- ✅ Meta tags (DONE!)
- Google Business Profile
- Social images
- Submit to search engines

### Week 3-4: Content & Listings
- First 2 blog posts published
- Listed on 5+ directories
- Sitemap/robots.txt live

### Month 2: Link Building
- 3 local backlinks secured
- 10+ Google reviews
- First press mention

### Month 3-6: Growth
- 10+ blog posts
- 50+ reviews
- Ranking on page 1 for "Falls Park tour"
- Appearing in "things to do Greenville" results

### Expected Results:
- **Month 1:** Appears in Google Maps searches
- **Month 2-3:** Ranking page 2-3 for target keywords
- **Month 4-6:** Page 1 for "Falls Park tour", appearing in local pack
- **Month 6+:** Consistent organic traffic, ranking for "things to do Greenville SC"

---

## 🚀 PRIORITY ORDER (Do This First!)

**This Week:**
1. ✅ Meta tags (DONE!)
2. Create Google Business Profile (2 hours)
3. Create social share images (1 hour)
4. Submit to Google Search Console (30 min)

**Next Week:**
5. Write first blog post (3 hours)
6. Get listed on TripAdvisor & Yelp (2 hours)
7. Contact VisitGreenvilleSC.com (30 min)

**Ongoing:**
8. Get reviews from every customer
9. Publish 1 blog post per week
10. Reach out to 2 local sites per week for partnerships

---

## 📞 NEED HELP?

**Free SEO Tools:**
- Google Search Console (track rankings)
- Google Analytics (track visitors)
- Google Keyword Planner (research keywords)
- Ubersuggest.com (keyword ideas)

**If You Want to Hire Help:**
- Fiverr: $50-200 for local SEO setup
- Upwork: $500-2000/month for ongoing SEO
- Local Greenville marketing agency: $1000-3000/month

**DIY is 100% possible for local SEO** - just requires consistent effort!

---

## ✅ SUCCESS METRICS (Check Monthly)

Track these numbers:
- Google Business Profile views
- Website visitors (Google Analytics)
- Keyword rankings (Google Search Console)
- Number of reviews
- Tour purchases from organic search

**Goal:** 50% of your bookings from organic search within 6 months.
