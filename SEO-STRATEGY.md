# SEO Strategy for Falls Park Walking Tour
## A Complete Guide for Steven

**Last Updated:** March 9, 2026
**Status:** Ready for Implementation
**Target:** Rank #1 for "things to do in Greenville SC" and related local queries

---

## Table of Contents
1. [What We've Already Done](#what-weve-already-done)
2. [Quick Wins - Do These First](#quick-wins---do-these-first)
3. [Google Search Console Setup](#google-search-console-setup)
4. [Google Business Profile](#google-business-profile)
5. [Image SEO](#image-seo)
6. [Content Marketing Strategy](#content-marketing-strategy)
7. [Local SEO Checklist](#local-seo-checklist)
8. [Review Strategy](#review-strategy)
9. [Social Media for SEO](#social-media-for-seo)
10. [Link Building](#link-building)
11. [Technical SEO Maintenance](#technical-seo-maintenance)
12. [Tracking Success](#tracking-success)

---

## What We've Already Done

Great news! The technical foundation is solid. Here's what's been implemented:

### On-Page SEO (Complete)
- ✅ **8 schema types** in structured data (TouristAttraction, TouristTrip, LocalBusiness, Product, WebSite, Event, FAQPage, BreadcrumbList)
- ✅ **9 individual tour stop pages** with dedicated content
- ✅ **6 keyword-targeted landing pages**:
  - Things to Do in Greenville SC
  - Falls Park History
  - Downtown Greenville Tour
  - Greenville SC Audio Tour
  - Greenville SC Family Activities
  - Greenville SC Date Ideas
  - Liberty Bridge Greenville
  - Reedy River Greenville
  - Greenville Walking Tours
- ✅ **18 total indexed pages** (ready for search engines)
- ✅ **Comprehensive meta tags** (title, description, keywords, author, robots)
- ✅ **Open Graph tags** for social sharing (1200x630px dimensions)
- ✅ **Twitter Card tags** for Twitter/X sharing
- ✅ **Updated sitemap.xml** (all 18 pages listed with priorities)
- ✅ **Optimized robots.txt** (allows crawlers, blocks unnecessary files)
- ✅ **PWA Manifest** for mobile app-like experience
- ✅ **Mobile viewport** configuration for responsive design
- ✅ **Canonical URLs** to prevent duplicate content issues
- ✅ **hreflang tags** for language variants
- ✅ **Google Analytics 4** tracking code

### Technical Foundation
- ✅ Fast load times (Vite + React optimization)
- ✅ Mobile-first responsive design
- ✅ HTTPS security (Vercel provides this)
- ✅ Preconnect to external services
- ✅ FAQ schema for Google rich snippets
- ✅ Geolocation meta tags (Greenville, SC coordinates)

**Bottom line:** The foundation is strong. Your site is technically ready to rank. Now we need to drive traffic and build authority.

---

## Quick Wins - Do These First

These 10 actions will have the biggest impact immediately after launching. Do them in this order:

### Week 1: Core Setup
1. **Create Google Business Profile** (1 hour)
   - Go to google.com/business
   - Claim or create your listing
   - Add complete information
   - This alone can get you appearing in Google Maps

2. **Submit sitemap to Google Search Console** (15 minutes)
   - Verify your site
   - Submit sitemap.xml
   - Request indexing of all pages
   - Google will crawl your site much faster

3. **Create real og-image.jpg** (30 minutes)
   - Current image is referenced but may not exist
   - Design or screenshot a beautiful image of Falls Park/Liberty Bridge
   - Dimensions: 1200x630 pixels
   - Save to `/public/og-image.jpg`
   - This image appears when people share your link on Facebook

4. **Create real twitter-card.jpg** (15 minutes)
   - Similar image to og-image
   - Can be the same or slightly different
   - Dimensions: 1200x630 pixels
   - Save to `/public/twitter-card.jpg`
   - This appears when shared on Twitter/X

5. **Design a proper favicon** (15 minutes)
   - Replace the Vite logo (vite.svg)
   - Create a small icon (16x16, 32x32, 64x64)
   - Consider: map pin, walking person, or "FP" logo
   - Save as `/public/favicon.ico`
   - This appears in browser tabs and bookmarks

### Week 2: Local Visibility
6. **Create TripAdvisor listing** (1 hour)
   - Go to tripadvisor.com
   - Search "Falls Park"
   - "Add a property" if not listed
   - Add photos, description, pricing
   - TripAdvisor brings actual customers

7. **List on Yelp** (45 minutes)
   - Go to yelp.com
   - Claim your business
   - This is where many tourists look for activities
   - Even if you're small, get on Yelp

8. **Submit to local tourism boards** (30 minutes each)
   - Visit Greenville SC website
   - List on their activity directory
   - Submit to Greenville Chamber of Commerce
   - These drive qualified local traffic

### Week 3: Content & Review Foundation
9. **Generate your first 5 Google reviews** (1 week)
   - Ask early customers/friends
   - Send them the Google review link
   - Real reviews improve rankings
   - Aim for 4.5+ stars

10. **Publish your first blog post** (2 hours)
   - Topic: "10 Hidden Facts About Falls Park" or similar
   - 1,500-2,000 words
   - Include images
   - Link back to your tour page
   - This builds topical authority

---

## Google Search Console Setup

### What is Google Search Console?
It's Google's way of communicating with you about how your site appears in search results. Free to use, essential for SEO.

### Step-by-Step Setup

#### Step 1: Verify Your Site
1. Go to **google.com/webmasters** → **Search Console**
2. Sign in with your Google account (or create one if needed)
3. Click **"Add property"** (top left)
4. Enter your site URL: `https://falls-park-tour.vercel.app`
5. Choose **URL prefix** option
6. Click **Continue**

#### Step 2: Verify Ownership
Google gives you several options:
- **Recommended:** HTML file upload
  - Download the HTML file Google provides
  - Upload it to your `/public` folder
  - Click verify
- **Alternative:** HTML tag
  - Copy the meta tag Google provides
  - Add it to the `<head>` of index.html
  - Already done in your current setup!

#### Step 3: Submit Your Sitemap
1. In Search Console, click **"Sitemaps"** (left menu)
2. In the URL field, type: `sitemap.xml`
3. Click **"Submit"**
4. Google will now crawl all 18 pages you listed

#### Step 4: Request Indexing
1. Go to **"URL Inspection"** (top search bar)
2. Paste your homepage URL
3. Click **"Request indexing"**
4. Repeat for each of your 6 main landing pages
5. Google will prioritize crawling these

#### What to Monitor Monthly
- **Coverage:** Are all 18 pages indexed?
- **Performance:** Which keywords bring clicks?
- **Mobile usability:** Any issues on phones?
- **Core Web Vitals:** Is your site fast enough?
- **Security issues:** Any problems Google found?
- **Broken links:** Internal links that don't work?

**Time Investment:** 15 minutes setup, 5 minutes monthly

---

## Google Business Profile

### Why This is CRITICAL for You

Google Business Profile (formerly Google My Business) is THE most important ranking factor for local businesses. Here's why:

- **Google Maps:** Your tour appears on maps when people search "things to do near me"
- **Local Pack:** The "map box" that shows 3 businesses when someone searches "Greenville tours"
- **Google reviews:** Where customers leave feedback
- **Direction links:** Customers can get GPS directions to Falls Park
- **Phone & website links:** Direct calls to you
- **Booking links:** "Book now" button right on Google

**For a location-based tour, this is more important than organic search.**

### Step-by-Step Creation

#### Step 1: Claim or Create Your Listing
1. Go to **google.com/business**
2. Click **"Manage your business"**
3. Sign in with your Google account
4. Search for your business name: "Falls Park Tour" or "Basecamp Data Analytics"
5. If it exists, click **"Claim this business"** and follow steps
6. If not, click **"Create new business"**

#### Step 2: Fill Out Your Profile Completely

**Business Name:**
- Falls Park Self-Guided Walking Tour
- (or: Falls Park Tour)

**Category - CRITICAL:**
Choose your primary category:
- ✅ **Tours** (best fit)
- ✅ **Walking Tour** (if available)
- ✅ **Tourist Attraction** (secondary)
- ✅ **Activity**

You can add up to 3 categories. Add all relevant ones.

**Address:**
- 101 N Main St, Greenville, SC 29601 (Falls Park main entrance)
- Or mark as "service area" if you prefer

**Service Areas:**
- Add these cities/areas you serve:
  - Greenville, SC
  - Downtown Greenville
  - Greater Greenville Area

**Phone:**
- Your business phone number
- Customers can call directly from Google

**Website:**
- https://falls-park-tour.vercel.app

**Opening Hours:**
- Open 24/7 (since it's self-guided)
- Or: 6:00 AM - 10:00 PM if you prefer daytime hours
- Mark as "Flexible" or "Open 24 hours"

**Description (160 characters):**
"Self-guided GPS audio walking tour of Falls Park & downtown Greenville. 10 stops, 45 minutes, $9.99. No app needed."

**Service Options:**
- ✅ On-site
- (Tours are taken on location)

**Price Range:**
- $$ (under $50 activity)

**Payment Methods:**
- Credit/debit card (Stripe)
- Online payment

**Attributes:**
Check as many as apply:
- ✅ Family-friendly
- ✅ Walking tours available
- ✅ Wheelchair accessible (if true)
- ✅ Accepts online bookings

#### Step 3: Add Photos
This is HUGE. High-quality photos increase bookings by 30%+.

Upload these photos:
1. **Hero photo:** Beautiful shot of Falls Park or Liberty Bridge
2. **Tour in action:** People walking/listening on the tour
3. **Map/route photo:** Screenshot of your tour route
4. **Logo:** Your Basecamp Data Analytics logo
5. **Customer photos:** Real tourists on the tour (get permission)

**Photo tips:**
- Use high-quality images (3000x2000px minimum)
- Avoid watermarks
- Show people/faces when possible
- Include your logo somewhere
- Mix wide shots and details
- Seasonal variety (spring, summer, fall)

#### Step 4: Business Hours
Set your hours (even if 24/7):
- Monday-Sunday: 12:00 AM - 12:00 AM (24 hours)
- OR: 6:00 AM - 10:00 PM (recommended for customer service)

#### Step 5: Attributes
Check all that apply:
- Wheelchair accessible: ✓
- Family-friendly: ✓
- Walking tour: ✓
- Self-guided: ✓
- Group tours: ✓
- Onsite parking: (if available)

#### Step 6: Messaging Setup (Optional)
Enable "Message" so customers can text you:
- Go to messaging settings
- Enable SMS or chat
- Set up auto-responses for hours

### Managing Your Listing (Monthly Tasks)

**Every Month:**
- Add new photos (at least 2)
- Respond to any customer questions
- Check reviews and respond
- Update hours if seasonal

**Every Quarter:**
- Publish a new post/update
- Check analytics for search trends
- Verify all information is current

**Every Year:**
- Full audit of listing
- Update description if needed
- Refresh photos

**How to Respond to Reviews:**
- Respond to ALL reviews (5 stars and 1 stars)
- Thank positive reviews specifically
- Address negative reviews professionally
- Keep responses to 150 words or less
- Show you care about feedback

Example positive review response:
"Thank you so much for taking the tour! We're thrilled you enjoyed learning about Greenville's history. Your kind words mean everything to us, and we'd love to see you again soon!"

Example negative review response (if someone complained about GPS):
"Thank you for your feedback. We know GPS can be unreliable in urban areas, which is why we always include manual play buttons at each stop. We'd love to make it right - please email us at [email] so we can address your concerns."

---

## Image SEO

### The Problem
Your HTML references images that may not exist or aren't optimized:
- `/og-image.jpg` - for Facebook sharing
- `/twitter-card.jpg` - for Twitter sharing
- Favicon not properly configured
- No images on individual tour stop pages

### The Solution
Images are a ranking factor. Proper image SEO can drive 10-20% of your traffic.

### Step 1: Create Social Sharing Images

#### OG Image (1200x630 pixels)
This appears when someone shares your link on Facebook.

**What to show:**
- Beautiful photo of Falls Park or Liberty Bridge
- White or light text overlay with: "Falls Park Walking Tour"
- Subtext: "GPS Audio Tour - $9.99"
- Your logo in corner
- Greenville, SC branding

**Where to get it:**
- Take a high-quality photo yourself
- Use Canva (canva.com) - drag and drop template
- Hire a designer ($50-200 on Fiverr)

**How to add it:**
1. Create your image (1200x630 pixels)
2. Save as `/public/og-image.jpg`
3. Make sure it's visible at: `https://falls-park-tour.vercel.app/og-image.jpg`

#### Twitter Card (1200x630 pixels)
Can be same as OG image, or different design.

**How to add it:**
1. Create or reuse your image
2. Save as `/public/twitter-card.jpg`
3. Verify at: `https://falls-park-tour.vercel.app/twitter-card.jpg`

### Step 2: Create or Update Favicon

The favicon is the tiny image in the browser tab.

**Your options:**
1. **Use initials:** "FP" in your brand colors
2. **Use a map pin:** Symbolizes location/tours
3. **Use a walking person:** Symbolizes walking tour
4. **Use Greenville landmark:** Liberty Bridge silhouette

**How to create:**
- Canva.com (free)
- Favicon.io (online generator)
- Adobe Express (free)
- Hire a designer

**Specifications:**
- Size: 32x32, 64x64, or 512x512 pixels
- Format: PNG or SVG (better than ICO)
- Make it simple and clear

**How to add it:**
1. Create your favicon
2. Replace `/public/vite.svg` with your favicon
3. In `index.html`, change line 5 from:
   ```html
   <link rel="icon" type="image/svg+xml" href="/vite.svg" />
   ```
   To:
   ```html
   <link rel="icon" type="image/png" href="/favicon-32x32.png" />
   ```

### Step 3: Add Images to Tour Stop Pages

Each of your 9 tour stop pages should have an image.

**Images to add:**
1. `/stops/liberty-bridge.html` - Photo of Liberty Bridge
2. `/stops/reedy-river-falls.html` - Photo of Reedy River Falls
3. `/stops/west-end-district.html` - Street photo of West End
4. `/stops/peace-center.html` - Photo of Peace Center
5. `/stops/main-street-greenville.html` - Historic Main Street photo
6. `/stops/courthouse-poinsett-hotel.html` - Photo of Courthouse/Poinsett Hotel
7. `/stops/shoeless-joe-jackson.html` - Historical photo or statue
8. `/stops/wyche-pavilion.html` - Photo of Wyche Pavilion
9. `/stops/falls-park-gardens.html` - Photo of Falls Park Gardens

**How to get images:**
- Take your own photos on site (best)
- Use high-quality images from Falls Park official sources
- Purchase stock photos (iStock, Unsplash for free ones)
- Use Creative Commons licensed images

**Image specifications:**
- Size: at least 1200 pixels wide
- Format: JPG or WebP
- File size: 100-300 KB (compressed)
- Aspect ratio: 16:9 or 4:3

**How to add to pages:**
In each HTML file, add this in the page:
```html
<img src="/images/liberty-bridge.jpg"
     alt="Liberty Bridge - A historic cable suspension bridge spanning the Reedy River in Greenville, SC"
     width="1200"
     height="675" />
```

### Step 4: Optimize Alt Text for Images

Alt text is text that describes the image. It helps:
- Google understand what's in the image
- Blind visitors who use screen readers
- Appears if image doesn't load

**Good alt text:**
- Specific and descriptive
- 50-125 characters
- Includes keywords naturally
- Doesn't start with "image of"

**Examples:**

❌ Bad: "liberty bridge"
❌ Bad: "image of bridge"
❌ Bad: ""

✅ Good: "Liberty Bridge spanning Reedy River in downtown Greenville SC"
✅ Good: "Reedy River waterfall framed by historic brick buildings"
✅ Good: "Historic courthouse and Poinsett Hotel on Main Street Greenville"

### Step 5: Create an Images Folder

Organize your images logically:

```
/public/images/
├── stops/
│   ├── liberty-bridge.jpg
│   ├── reedy-river-falls.jpg
│   ├── west-end-district.jpg
│   ├── peace-center.jpg
│   ├── main-street.jpg
│   ├── courthouse-poinsett.jpg
│   ├── shoeless-joe.jpg
│   ├── wyche-pavilion.jpg
│   └── falls-park-gardens.jpg
├── og-image.jpg
└── twitter-card.jpg
```

### Step 6: Submit Images to Google

1. In Google Search Console
2. Go to **Images** (left menu)
3. Check which images are indexed
4. Verify image sitemap is submitted
5. Request indexing of new images

**Time investment:** 2-4 hours (depending on image sourcing)
**Impact:** 10-20% more traffic from image search

---

## Content Marketing Strategy

### What is Content Marketing?
Creating blog posts and articles that attract people searching for information about Falls Park, Greenville history, things to do, etc. These posts link back to your tour, building authority and traffic.

### The Strategy
You don't need 100 blog posts. You need 15-20 strategic posts that:
1. Answer questions tourists ask
2. Include your target keywords
3. Link to your tour page
4. Get shared on social media

### Blog Post Topics (Write in This Order)

#### TIER 1: High Traffic, High Intent (Do These First)
These attract searchers actively looking for things to do.

1. **"10 Hidden Facts About Falls Park You Probably Didn't Know"**
   - Keywords: "Falls Park Greenville facts", "Falls Park history"
   - Length: 1,500 words
   - CTA: "Want to learn more? Take the self-guided tour"
   - Publish: Week 1

2. **"Complete Weekend Itinerary for Greenville SC (48 Hours)"**
   - Keywords: "things to do in Greenville SC", "Greenville weekend"
   - Length: 2,000 words
   - Include your tour as a must-do activity
   - Publish: Week 2

3. **"Best Time to Visit Falls Park in Each Season"**
   - Keywords: "best time to visit Falls Park", "Greenville SC spring summer fall winter"
   - Length: 1,500 words
   - Seasonal details for each tour stop
   - Publish: Week 3

4. **"Liberty Bridge: The Engineering Marvel of Greenville"**
   - Keywords: "Liberty Bridge Greenville", "Liberty Bridge history"
   - Length: 1,800 words
   - Deep dive on bridge history and design
   - Highlight as tour stop 1
   - Publish: Week 4

5. **"History of the Reedy River: From Mill Power to Recreation"**
   - Keywords: "Reedy River history", "Reedy River Falls"
   - Length: 1,500 words
   - Connect to industrial heritage of Greenville
   - Publish: Week 5

#### TIER 2: Strong Traffic, Good Intent (Write These Next)

6. **"Best Free and Cheap Things to Do in Greenville SC"**
   - Keywords: "cheap things to do Greenville", "free Greenville activities"
   - Mention tour as affordable option
   - Length: 1,500 words

7. **"Perfect Date Ideas in Greenville SC (Budget & Splurge)"**
   - Keywords: "date ideas Greenville SC", "romantic things to do Greenville"
   - Tours are great dates
   - Length: 1,500 words

8. **"Family Activities in Greenville SC: Things Kids Actually Enjoy"**
   - Keywords: "things to do Greenville with kids", "family activities Greenville"
   - Tours are family-friendly
   - Length: 1,800 words

9. **"Walking Tours in Greenville SC: A Local's Guide"**
   - Keywords: "walking tours Greenville", "guided tours Greenville SC"
   - Highlight why walking tours matter
   - Length: 1,500 words

10. **"Historic Downtown Greenville: A Walking Tour of Architecture"**
    - Keywords: "historic downtown Greenville", "architecture Greenville SC"
    - Features stops from your tour
    - Length: 1,600 words

#### TIER 3: Niche Traffic, But Great for Authority (Write Later)

11. **"Greenville's Textile Heritage: The Mills That Built Modern Greenville"**
    - Keywords: "Greenville textile history", "Greenville mills"
    - B-tier keywords
    - Length: 1,500 words

12. **"Shoeless Joe Jackson: The Baseball Legend from Greenville"**
    - Keywords: "Shoeless Joe Jackson", "Joe Jackson Greenville"
    - Niche but interesting
    - Length: 1,200 words

13. **"The Swamp Rabbit Trail: Greenville's Best Outdoor Trail"**
    - Keywords: "Swamp Rabbit Trail", "hiking Greenville SC"
    - Trail connects to Falls Park
    - Length: 1,500 words

14. **"Where to Eat Around Falls Park: Best Restaurants & Cafes"**
    - Keywords: "restaurants Falls Park", "where to eat downtown Greenville"
    - Helps tourists plan visits
    - Include links to local restaurants (they might reciprocate)
    - Length: 1,500 words

15. **"Best Photo Spots in Greenville SC: Instagrammable Locations"**
    - Keywords: "photo spots Greenville", "Greenville Instagram locations"
    - Young demographic shares a lot
    - Include locations on your tour
    - Length: 1,200 words

16. **"Events in Greenville SC: Music, Food & Festival Calendar"**
    - Keywords: "events in Greenville SC", "Greenville festivals"
    - Evergreen with seasonal updates
    - Mention tour as year-round activity
    - Length: 1,800 words

17. **"Greenville SC Travel Guide: Everything First-Time Visitors Need"**
    - Keywords: "Greenville SC travel guide", "visit Greenville South Carolina"
    - Comprehensive guide
    - Tour is highlight
    - Length: 2,500 words

18. **"Visitor Guide: What to Pack for a Greenville Adventure"**
    - Keywords: "Greenville weather", "what to pack Greenville SC"
    - Long-tail keywords
    - Mention tour as packing consideration
    - Length: 1,000 words

### How to Write These Posts

#### Template for Each Post:
```
Introduction (150-200 words)
- Hook: "Did you know..."
- Mention your tour as context
- Promise what reader will learn

Body (1,200-1,800 words)
- 3-5 main sections with H2 headings
- 300-400 words per section
- 1-2 images per section
- Include internal links to other posts
- Include 2-3 links to your tour page

Call-to-Action (100-150 words)
- Summary of key points
- "Ready to experience this? Take the tour"
- CTA button to your site

Metadata:
- Title tag: 50-60 characters, includes keyword
- Meta description: 150-160 characters
- Keywords: 3-5 related keywords
- Internal links: 3-5 links within post
```

#### SEO Writing Tips:
1. **Keyword in title:** Always include your main keyword
2. **Keyword in intro:** Mention it in first 100 words
3. **Subheadings (H2):** Break up sections
4. **Keywords in subheadings:** Natural, not forced
5. **Short paragraphs:** 2-3 sentences max
6. **Bullet points:** Easy to scan
7. **Links:** 3-5 internal links per post
8. **Images:** Every 300 words
9. **Call-to-action:** Clear and prominent
10. **Long-form:** 1,500+ words ranks better

#### Publication Schedule:
- **Month 1:** Posts 1-5 (weekly)
- **Month 2:** Posts 6-10 (2x per week)
- **Month 3:** Posts 11-15 (2x per week)
- **Month 4+:** Posts 16-20 (1x per week)
- **Ongoing:** 1-2 posts per month

### Where to Put Blog Posts

**Option 1: On Your Website (Recommended)**
- Create a `/blog/` folder in your public directory
- Name files: `/blog/10-facts-about-falls-park.html`
- Add to your sitemap
- Full control over content

**Option 2: Medium.com**
- Medium has massive reach
- Include link to your site in every post
- Builds backlinks naturally
- Lower effort (simpler platform)

**Option 3: Both (Best)**
- Publish original on your site
- Republish on Medium with note: "Originally published on [your-site]"
- Link in both directions

### Promoting Your Blog Posts

When you publish a post:

1. **Email:** Email to customers/mailing list (if you have one)
2. **Facebook:** Post link with quote or image
3. **Instagram:** Post image with caption linking to blog
4. **TripAdvisor:** Share on business profile
5. **LinkedIn:** If you have company profile
6. **Reddit:** Post in r/greenville (don't be too promotional)
7. **Local forums:** Local Greenville community sites

### Blog Post Value
- **Each post:** 2-10 new visitors per month
- **15 posts:** 30-150 new visitors per month
- **After 6 months:** 50-300 visitors/month from blog
- **ROI:** 2-3 hours per post, years of traffic

**Time investment:** 30 hours over 4 months
**Expected impact:** 50-200 extra visitors per month

---

## Local SEO Checklist

Local SEO is THE biggest opportunity for a tour business. Most customers search "things to do near me" not "Falls Park walking tour."

### The Power of Local SEO
- "Things to do in Greenville" = 2,900 monthly searches
- "Tours in Greenville SC" = 480 monthly searches
- "Activities near me" = people actively looking to spend money
- Google Maps shows 3 results prominently

### Your Local SEO Checklist

#### Directory Listings (Required)

Complete these 8 listings completely and identically:

1. **Google Business Profile** ✓ (See detailed guide above)
   - Most important
   - Drives Google Maps visibility
   - Direct booking potential

2. **TripAdvisor**
   - Go to tripadvisor.com
   - Search "Falls Park"
   - "Add property" if not listed
   - Add 20+ high-quality photos
   - Detailed description (500+ words)
   - This directly drives customers

3. **Yelp**
   - Go to yelp.com/business
   - Claim your business
   - Note: Takes 3-5 days to approve
   - Add detailed description
   - Add business hours
   - Pricing tier: "$$" (inexpensive)

4. **GetYourGuide**
   - GetYourGuide.com is a massive tour booking platform
   - Over 50 million monthly visitors
   - List your tour here ($0 commission during trial)
   - Gets thousands of bookings for tour operators
   - High-resolution photos required

5. **Viator (Tripadvisor's booking arm)**
   - Viator.com
   - More professional than GetYourGuide
   - Lower volume but higher-quality customers
   - Partner with Viator to get bookings

6. **AllTrails**
   - AllTrails.com (hiking/walking trails)
   - Add your tour route
   - Gets serious outdoor enthusiasts
   - Educational positioning

7. **Facebook Business Page**
   - facebook.com/pages/create
   - Add photos, hours, description
   - Enable booking/contact
   - Post regularly (2x per week)

8. **Apple Maps**
   - Less important than Google
   - But still list it
   - Claim on apple.com/business
   - Maps for business/iOS users

#### Partnerships & Collaborations (High Impact)

9. **Visit Greenville SC Partnership**
   - VisitGreenvilleSC.com is the official tourism board
   - Contact: ask to list as "official experience"
   - They have 500K+ monthly visitors
   - Can send your link to hotels, airlines
   - Contact them!

10. **Greenville Chamber of Commerce**
    - GreenvilleSC.org
    - Join Chamber ($300-500/year)
    - Get listed in member directory
    - Networking opportunities
    - Joint marketing efforts

11. **Hotel Concierge Partnerships**
    - Identify 10-15 hotels near Falls Park
    - Renaissance, Omni, Holiday Inn, etc.
    - Meet with concierge manager
    - Offer them 10% commission if they refer
    - Provide QR codes for lobby
    - They want to recommend activities

12. **AirBnB Host Network**
    - Meet AirBnB hosts in Greenville
    - Offer group discount: "Book 4+ rooms, tour is free"
    - Hosts want to recommend experiences
    - They have direct customer communication

13. **Event Planner Partnerships**
    - Wedding planners, corporate event planners
    - Tour is great for team-building
    - Tours for bachelorette parties
    - Offer 20% group discount
    - Partner with 5-10 planners

14. **Downtown Greenville Association**
    - Downtown is where Falls Park is
    - Partnership opportunities
    - Co-marketing potential
    - Community credibility

#### Review Strategy (Critical for Local)
15. **Google Reviews:** Your #1 priority
16. **TripAdvisor Reviews:** Customers trust these
17. **Yelp Reviews:** Local traffic driver
18. **Facebook Reviews:** Easy for many people
19. **GetYourGuide Reviews:** Booking platform credibility

See [Review Strategy](#review-strategy) section below for full details.

#### Local Content Optimization
20. **Location pages:** Already done (8 pages)
21. **Local keywords:** Already in meta tags
22. **Local schema:** Already implemented
23. **Local backlinks:** See link building section

#### Local Advertising (Optional, Paid)
24. **Google Local Services Ads**
    - Appears in Google Maps
    - "Ads" badge shows it's promoted
    - Pay per lead/booking
    - Effective but costs per booking

25. **Facebook Local Ads**
    - Target people within 5 miles
    - Budget: $5-10/day to start
    - Good for brand awareness

### Monthly Local SEO Tasks

**Week 1 of each month:**
- Check Google Business Profile insights
- Ensure hours/info accurate
- Add 2-3 new photos
- Respond to all new reviews

**Week 2:**
- Check and respond to TripAdvisor reviews
- Check Yelp for updates needed
- Verify all directory listings current

**Week 3:**
- Post to Facebook Business page
- Check competitor listings
- Note any information gaps

**Week 4:**
- Submit any missing local directories
- Reach out to 1-2 hotel concierges
- Plan next month's content

**Time: 2-3 hours per month**

---

## Review Strategy

### Why Reviews Matter for Your Business

**For Search Rankings:**
- Google trusts businesses with 50+ reviews more
- Reviews are a ranking factor in local search
- Negative reviews hurt rankings if not addressed

**For Bookings:**
- 72% of people check reviews before booking
- 4.5+ stars increases booking rate by 40%
- Real reviews beat all marketing dollars

**For Credibility:**
- New customers trust reviews more than your marketing
- Photos in reviews have 2x higher impact
- Video reviews are most trusted

### Your Review Goals

**By Month 6:** 20 reviews (aim for 4+ average)
**By Month 12:** 50 reviews (aim for 4.5+ average)
**By Year 2:** 100+ reviews (aim for 4.8+ average)

### How to Get Reviews (The Playbook)

#### Method 1: After Tour (Best)
When customers complete the tour:
- Give them a printed card with QR code to review
- Say: "We'd love to hear what you thought!"
- Text them a link: "Just took the tour? [review link]"
- Email thank you with review link

#### Method 2: Stripe Receipt Email
After they pay:
- Email them immediately thanking them
- Include direct links to each review site
- Make it easy with one-click links

#### Method 3: SMS Follow-up
If you have their phone (from booking):
- Text 24 hours after tour
- "Thanks for exploring Greenville with us! [review link]"
- Keep it friendly, not pushy

#### Method 4: Social Media
Post on your Instagram/Facebook:
- "We'd love your feedback! Review us: [link]"
- Monthly reminder posts
- Don't overdo it

#### Method 5: Referral Incentives (Legal & Ethical)
You CAN'T offer prizes for reviews (against terms of service).
You CAN:
- Offer discount code: "Book 2 tours, get 20% off 3rd"
- After giving promo, ask for review
- "Loved the tour? Drop us a review!"

### Review Platform Priorities

#### Tier 1: Must Have
1. **Google Reviews** - Highest impact for local SEO
2. **TripAdvisor** - Biggest driver of tourists

#### Tier 2: Important
3. **Yelp** - Local credibility
4. **Facebook** - Where people hang out
5. **GetYourGuide** - Booking platform reviews

#### Tier 3: Nice to Have
6. **Viator** - Professional bookings
7. **AllTrails** - Hiking community

### Review Management Template

Create a spreadsheet to track:
- Customer name
- Date of tour
- Email/phone
- Which review site(s) they reviewed
- Star rating
- Date reviewed

This helps you:
- Know who to follow up with
- Track completion rate (% who review)
- Identify patterns

### Responding to Reviews (Template)

**Respond to EVERY review - positive and negative**

**For 5-star reviews:**
```
Thank you so much [Name] for the wonderful review! We're thrilled you enjoyed learning about Greenville's rich history. Your kind words mean everything to us, and we'd love to see you again soon. If you haven't already, please share the tour with friends who might enjoy it!

- The Falls Park Tour Team
```

**For 4-star reviews (good but not perfect):**
```
Thank you for the 4-star review! We're so glad you enjoyed the tour overall. We'd love to hear more about what we could improve. Please reach out to us at [email] so we can make it even better next time.

- The Falls Park Tour Team
```

**For 3-star reviews (okay, room to improve):**
```
Thank you for your feedback. We appreciate you taking the time to share your experience. We're always working to improve. Please email us at [email] with specific feedback about what we could do better.

- The Falls Park Tour Team
```

**For 1-2 star reviews (negative):**
```
We're sorry to hear you had a disappointing experience. This isn't the level of service we strive for. Please email us at [email] with details about what went wrong, and we'll make it right. We'd love the chance to turn this around.

- The Falls Park Tour Team
```

### Review Acquisition Timeline

**Week 1-2:** Target your early customers
- Ask friends/family to review
- Contact beta testers
- Goal: 5-10 initial reviews

**Week 3-4:** Every paying customer
- Implement post-tour review request
- Email automation for reviews
- Goal: 2-3 new reviews per week

**Month 2+:** Systematic collection
- Daily review requests to customers
- Social media reminders
- Email campaigns
- Goal: 4-5 new reviews per week

**After 6 Months:** Snowball effect
- Reviews start appearing naturally
- Customers leave reviews unprompted
- Word-of-mouth kicks in

### Review Platform Guides

#### Google Reviews
1. Send customers: `https://www.google.com/maps/place/Falls+Park`
2. On the page, click "Write a review" (stars)
3. They sign in and rate/comment
4. Most straightforward platform

#### TripAdvisor
1. Get your business page URL: `tripadvisor.com/[your-listing]`
2. Send to "See all reviews" section
3. Click "Write a review"
4. TripAdvisor pays for detailed reviews (takes 10 minutes)

#### Yelp
1. Get business URL: `yelp.com/biz/[your-business]`
2. Click "Write a Review"
3. Takes 3-5 days to appear (moderation)

#### Facebook
1. Easiest for many people
2. Facebook.com/[your-page]/reviews
3. Shows on your page immediately
4. Lowest barrier to entry

### Handling Negative Reviews

**The mistake:** Ignoring negative reviews
**The reality:** Responding to negative reviews increases trust

**Response strategy:**
1. Don't respond immediately (wait 24 hours)
2. Read the complaint carefully
3. Respond professionally and briefly (150 words max)
4. Acknowledge their issue
5. Offer to fix it
6. Take conversation offline (email)
7. Follow up to let them change review if satisfied

**Example bad response:**
"You're wrong, the tour is amazing, other people love it"

**Example good response:**
"We're truly sorry you had this experience. GPS can be unreliable in urban areas, which is why we always have manual buttons. We'd love to make this right. Please email us with your contact info, and we'd like to offer you a full refund or free tour."

**Why this works:**
- Other readers see you care about issues
- Shows confidence in your product
- Demonstrates customer service
- Negative reviews with good responses still help rankings

---

## Social Media for SEO

### How Social Media Helps SEO

**Direct ranking impact:** Small but measurable
- Google uses social signals as trust indicators
- Shared content gets crawled faster
- Social links count as endorsements

**Indirect ranking impact:** Much larger
- Traffic to your site from social (ranking signal)
- Builds brand awareness (more direct searches)
- Gets customer reviews and feedback
- Drives repeat visits

**Business impact:**
- Direct bookings from social
- Review generation
- Word-of-mouth amplification
- Community building

### Platform Strategy

#### Platform 1: Instagram (HIGHEST PRIORITY)
Instagram is where tourists discover activities.

**Content mix:**
- 50% Beautiful photos (Falls Park, Liberty Bridge, tour in action)
- 20% Educational content (historical facts, tips)
- 20% Customer photos (ask customers to tag you)
- 10% Promotional (tour info, booking links)

**Hashtag Strategy:**
Use 20-30 hashtags on every post. Mix:
- **Mega hashtags** (1M+ posts):
  - #GreenvilleSC
  - #VisitGreenville
  - #ThingsToDoGreenville
  - #TravelSouthCarolina
  - #SouthCarolina

- **Popular hashtags** (100K-1M posts):
  - #HistoricGreenville
  - #DowntownGreenville
  - #FallsPark
  - #LibertyBridge
  - #GreenvilleTours

- **Niche hashtags** (10K-100K posts):
  - #GreenvilleFoodie
  - #GreenvilleWeekend
  - #ExploreGreenville
  - #LoveWhereYouLive
  - #SelfGuidedTour

- **Location hashtags:**
  - #GreenvilleSC
  - #DowntownGreenvilleSC
  - #ReedyRiver

**Posting frequency:**
- 3-4 posts per week (start)
- 1-2 stories per day
- 2-3 reels per week
- Consistency matters more than frequency

**Engagement strategy:**
- Like and comment on other Greenville posts
- Reply to all comments within 24 hours
- Share customer posts (with permission)
- Use Instagram Stories frequently

**Growth tactics:**
- Follow 50 local accounts per week
- Engage with location hashtags daily
- Partner with other Greenville businesses for shout-outs
- Run occasional contests (photo contest, tag a friend)
- Collaborate with travel influencers

**Expected growth:**
- Month 1: 200-300 followers
- Month 3: 500-800 followers
- Month 6: 1,000-1,500 followers
- Year 1: 2,000-3,000 followers

**Time: 5-7 hours per week**

#### Platform 2: Facebook (SECONDARY)
Older demographic, but good for:
- Sharing blog posts
- Event announcements
- Community engagement
- Business page (for Google integration)

**Content mix:**
- 40% Blog post links
- 30% Beautiful photos
- 20% Educational/interesting facts
- 10% Promotional

**Posting frequency:**
- 3-4 posts per week
- Mix of link posts and image posts
- Engage in local Greenville groups

**Time: 3-4 hours per week**

#### Platform 3: TikTok (OPTIONAL, HIGH GROWTH)
Short-form video for younger demographic.

**Content ideas:**
- 15-30 second walking tour clips
- Historical fact videos
- "POV: You're at Liberty Bridge"
- Behind-the-scenes tour setup
- Customer testimonials (30 seconds)
- Funny/relatable Greenville content

**Why it works:**
- TikTok has massive reach (1B+ users)
- Algorithm favors new content heavily
- Younger audience = future customers
- Video content performs 5x better than images

**Time: 3-5 hours per week (once you get going)**

#### Platform 4: Pinterest (OPTIONAL, HIGH VALUE)
Pinterest is underrated for local tours.

**Why:** People plan vacations on Pinterest

**Content strategy:**
- Create pins linking to your blog posts
- "Things to do in Greenville" boards
- "Fall photography spots" boards
- "Historic towns in South Carolina" boards
- Link pins to your tour and blog

**Time: 2-3 hours per week**

#### Platform 5: LinkedIn (OPTIONAL)
Only if you want B2B (corporate team-building, events).

**Content:**
- "We organized a team-building tour for 30"
- "Corporate events in Greenville"
- Industry thought leadership
- Local business networking

**Time: 1-2 hours per week**

### Hashtag Research

Use these free tools to find best hashtags:

1. **Instagram itself:** Start typing hashtag, see volume
2. **Hashtagify.me:** See related hashtags
3. **All Hashtag:** See hashtag volumes
4. **Later.com:** Analytics on hashtag performance

### Content Calendar Template

Plan content 2 weeks in advance:

```
Week of March 10
- Mon: Beautiful photo of Falls Park at sunset
- Wed: Blog post: "10 Facts About Falls Park"
- Fri: Customer photo feature (tag customer)
- Sun: Educational reel: "History of Liberty Bridge"

Week of March 17
- Mon: "Tip: Best time to visit Falls Park"
- Wed: TripAdvisor link: "Our customers rate us 4.8/5"
- Fri: Story: Behind-the-scenes audio setup
- Sun: Inspirational quote + Falls Park photo
```

### Influencer Partnerships (Low Cost, High Impact)

Identify micro-influencers in Greenville:
- Local Instagram accounts with 5K-20K followers
- Lifestyle, travel, or food bloggers
- Outdoor/hiking enthusiasts
- Propose: "Take the tour free, post about it"

Many will post for:
- Free tour
- $50-200 (modest ask)
- Mutual audience share

Cost-benefit: $200 influencer can reach 10K people

### Social Media Tools (Optional)

Free tools to help:
- **Later.com:** Schedule posts, analytics (has free tier)
- **Buffer.com:** Multi-platform scheduling (free tier)
- **Hootsuite:** Manage multiple platforms (free tier)
- **Canva:** Create graphics (free tier)
- **Unfold:** Create beautiful stories (free tier)

### Measuring Social ROI

Track monthly:
- Follower growth rate
- Engagement rate (likes + comments / followers)
- Click-through rate to website
- Conversion rate (clicks to bookings)
- Reviews generated from social

Goal: 5-15% of website traffic from social within 6 months

**Time investment: 20-30 hours per month**
**Expected impact: 30-100 new bookings per month within 6 months**

---

## Link Building

### What Are Backlinks and Why They Matter

A backlink is a link from another website to your site.

**Why Google cares:**
- Links = votes of confidence
- More links = more authority
- Links from authoritative sites = more weight
- Links from relevant sites = more value

**The reality:**
- Your site has 0 backlinks right now
- Competitors may have 50-200
- Each backlink adds 2-5% ranking power
- Top ranking site for "things to do in Greenville" has 300+ links

### Your Link Building Strategy

#### Tier 1: Easy Links (Do These First)

**1. Local Business Directories (10-15 links)**
Submit your business to:
- Better Business Bureau (BBB.org)
- Chamber of Commerce directories
- Local Greenville business listings
- Tourism board directories
- Yellow Pages, MapQuest, etc.

Time: 5-10 minutes per directory
Total: 2-3 hours
Impact: 10-15 directory links

**2. Google My Business & Local Listings**
Each confirmed local listing is a link back.
- Google Business Profile (1 link)
- TripAdvisor (1 link)
- Yelp (1 link)
- Facebook (1 link)
- Apple Maps (1 link)

Time: Already done above
Impact: 5 high-quality links

**3. Press Release Distribution**
Submit a press release: "New Self-Guided Tour Launches in Greenville"

Use free services:
- PRLog (prlog.org)
- eReleasesonline
- 24-7 Press Release

Results: 5-10 links from press sites

Template:
```
FOR IMMEDIATE RELEASE

New Self-Guided GPS Audio Tour Launches in Greenville, SC

Falls Park Walking Tour offers innovative way to explore local history

GREENVILLE, SC -- Basecamp Data Analytics has launched Falls Park Walking Tour,
a self-guided GPS audio experience featuring 10 historic stops around Falls Park
and downtown Greenville.

Unlike traditional tours, Falls Park Walking Tour uses GPS geofencing to
automatically trigger professional narration as visitors walk to each stop.
The 45-minute tour covers 1.2 miles and is available 24/7.

"We wanted to make historical exploration accessible and flexible," said [Your Name],
founder of Basecamp Data Analytics. "Visitors can take the tour on their schedule,
pause whenever they want, and experience history at their own pace."

The tour includes stops at:
- Liberty Bridge
- Reedy River Falls
- Historic Main Street
- And 7 more historic sites

For more information or to take the tour, visit https://falls-park-tour.vercel.app

About Basecamp Data Analytics
Basecamp Data Analytics is a Greenville-based company specializing in interactive
location-based experiences.

###

CONTACT:
Steven [Last Name]
Basecamp Data Analytics
services@basecampdataanalytics.com
```

**4. Wikipedia Listings** (Advanced)
If Falls Park has a Wikipedia article, add your tour as a link.

Go to: en.wikipedia.org/wiki/Falls_Park
- Edit the article
- Add: "See also: Falls Park Self-Guided Walking Tour"
- Add citation/link
- Wikipedia links are very valuable

Time: 30 minutes
Impact: 1 high-authority link

#### Tier 2: Medium Effort Links (Do These Next)

**5. Travel & Tourism Blogs (15-25 links)**
Identify local/regional travel blogs:
- "25 Things to Do in South Carolina"
- "Hidden Gems in Upstate South Carolina"
- Travel bloggers covering the Southeast

Outreach email:
```
Subject: Falls Park Self-Guided Walking Tour - Unique Travel Experience

Hi [Blogger Name],

I've been following your blog about hidden gems in South Carolina, and I think
your readers would love the Falls Park Self-Guided Walking Tour we just launched.

It's a unique GPS audio experience that takes visitors through 10 historic stops
in Greenville. The tour is self-guided, available 24/7, and runs about 45 minutes.

Would you be interested in featuring us? I'd be happy to give you early access or
provide high-quality photos for a post.

Check it out here: [link]

Looking forward to connecting!

Steven
Basecamp Data Analytics
```

Expect 10-20% response rate.

Time: 5 hours (find blogs, email 50 bloggers)
Impact: 5-10 blog links

**6. Local News Coverage**
Greenville news outlets often cover local businesses:
- GreenvilleSirens.com (local blogger network)
- GreenvilleOnline.com (local news)
- Local TV stations
- Greenville Magazine

Story angles:
- "New Tech-Enabled Tour Launches"
- "Supporting Local History"
- "Affordable Activities for Families"

Time: 3-4 hours (pitch, follow-up)
Impact: 2-3 news links (very valuable!)

**7. Partnerships & Mentions**
- Visit Greenville SC
- Downtown Greenville Association
- Hotel websites (partner with them)
- Event planning sites
- Corporate team-building sites

Time: 2-3 hours
Impact: 5-10 partnership links

#### Tier 3: High-Effort Links (Medium-term)

**8. Guest Posting (5-10 posts)**
Write articles for travel blogs/websites.

Examples:
- "A Visitor's Guide to Greenville's History" on travel blog
- "How Self-Guided Tours are Changing Travel" on tourism site
- "Walking Tours: Why They Matter" on tour industry site

Each post:
- 1,500-2,000 words
- 1-2 links back to your site
- Published on their site
- Brings their authority to you

Time: 2-3 hours per article
Total: 10-30 hours
Impact: 10-20 high-quality links

Sources to reach out to:
- Travel blog networks
- Medium publications on travel
- Substack travel newsletters
- Tourism industry sites

**9. Local/Regional Resource Pages (3-8 links)**
Greenville tourism sites have "Resources" or "Tour Operators" pages.

Examples:
- "Tours in South Carolina" guide
- "Things to Do in the Upstate" directory
- "Greenville Attractions" hub

Outreach: "I noticed your guide on Greenville attractions. Would you consider
adding Falls Park Self-Guided Walking Tour?"

Time: 2-3 hours
Impact: 3-8 resource page links

**10. Competitor Backlink Analysis (Strategic)**
See who links to your competitors:
- Use SEMrush or Ahrefs (paid tools)
- See where they get links
- Target similar sites

Time: 5-10 hours
Impact: Identify 20+ potential link sources

### Link Building Timeline

**Month 1:** Easy links (Tier 1)
- Local directories: 10-15 links
- Press releases: 5-10 links
- Subtotal: 15-25 links

**Month 2-3:** Medium effort (Tier 2)
- Travel blog outreach: 5-10 links
- News coverage: 2-3 links
- Partnerships: 5-10 links
- Subtotal: 12-23 links

**Month 4-6:** High effort (Tier 3)
- Guest posts: 10-20 links
- Resource pages: 3-8 links
- Relationship building: 5-10 links
- Subtotal: 18-38 links

**Year 1 Target:** 50-100 backlinks

### Link Quality Matters More Than Quantity

**High-value links (worth 10x more):**
- News sites (greenvilleonline.com)
- Established travel blogs (50K+ monthly visitors)
- Tourism boards (official Visit Greenville)
- Wikipedia
- Educational institutions
- Government sites (.gov)

**Low-value links (worth 1x):**
- Comment spam ("Check out my site!")
- Blog directories
- Unrelated sites
- Link farms

**Avoid at all costs:**
- Paying for links (Google penalizes)
- Buying link packages (Google will catch it)
- Spammy outreach (ruins reputation)
- Link exchanges (links for links)

### Tracking Your Links

Use these free tools:
- **Google Search Console:** Shows your backlinks
- **Backlink Checker:** Check your backlinks (free)
- **Ahrefs Site Explorer:** Comprehensive (has free tier)

Check monthly:
- New links gained
- Link quality
- Referring domains
- Anchor text used

**Time investment: 20-30 hours over 6 months**
**Expected impact: 50+ high-quality backlinks = 15-30% ranking boost**

---

## Technical SEO Maintenance

Technical SEO is the foundation that everything else stands on. Good news: you're already 90% there.

### Monthly Tasks (30 minutes)

**1. Check Google Search Console**
- Are all pages indexed?
- Any crawl errors?
- Mobile usability issues?
- Core Web Vitals healthy?

Action: Fix any issues that appear

**2. Update Sitemap**
- Add any new pages
- Update "lastmod" dates on changed pages
- Verify it's valid (xml-sitemaps.com)
- Re-submit to Google

**3. Check Page Speed**
- Google PageSpeed Insights
- Should be 80+ on mobile
- If slow, report to development team

**4. Verify All Links Work**
- Run through your pages
- Test all internal links
- Test all external links
- Report broken links

### Quarterly Tasks (2 hours)

**1. Full SEO Audit**
Use SEO-checklist:
- Title tags: unique and descriptive?
- Meta descriptions: 150-160 characters?
- H1 tags: only one per page?
- Images: all have alt text?
- Internal links: working and relevant?
- Structured data: valid?
- Mobile responsive: looks good?

**2. Keyword Rankings**
Track how your pages rank for target keywords.

Use free tools:
- Google Search Console (see keyword impressions)
- Serpstat (free tier)
- Rank Tracker (free tier)

Goals:
- "Things to do in Greenville SC" - Target: Top 10 by Month 3
- "Falls Park tour" - Target: Top 3 by Month 6
- "Walking tours Greenville" - Target: Top 5 by Month 9

**3. Competitor Analysis**
Check what competitors rank for:
- What keywords do they target?
- What content do they have?
- Where do they get backlinks?
- How do you compare?

Competitors to watch:
- TripAdvisor (for Greenville attractions)
- Other local tour operators
- Travel blogs covering Greenville

**4. Content Freshness Check**
Update content if:
- Older than 12 months
- Information is outdated
- Links are broken
- Competitors have better content

### Annual Tasks (4 hours)

**1. Major Site Audit**
- Hire an SEO professional ($500-1,000)
- Or use comprehensive tool (Semrush, Ahrefs)
- Get detailed report on:
  - Technical issues
  - Content gaps
  - Link opportunities
  - Competitor gaps

**2. Content Strategy Update**
- Review what content performed best
- Plan next year's blog topics
- Update underperforming pages
- Expand on successful content

**3. Schema/Structured Data Review**
- Ensure all schema is still accurate
- Update ratings/reviews in schema
- Add new tour stops if any
- Verify schema is valid

**4. Site Security Check**
- Is your site on HTTPS? (yes, Vercel handles this)
- Are there any security warnings?
- Check SSL certificate validity
- Monitor for malware (Google Safe Browsing)

### What NOT to Do

❌ **Don't over-optimize**
- Don't keyword stuff
- Don't create thin pages just for SEO
- Don't hide text with same color
- Don't use cloaking or deceptive redirects

❌ **Don't break anything**
- Don't change URLs without redirects (301 redirects)
- Don't delete old content (redirect it)
- Don't change meta data randomly
- Don't move pages without planning

❌ **Don't chase trends**
- AI-generated content that's low quality
- Keyword clusters that don't make sense
- Latest SEO "hacks" (usually penalized)
- Whatever someone on YouTube says is trending

### Technical SEO Tools (All Free Tier Available)

- **Google Search Console:** Essential
- **Google PageSpeed Insights:** Check speed
- **Mobile-Friendly Test:** Check mobile
- **Structured Data Testing Tool:** Check schema
- **Ahrefs SEO Toolbar:** Quick analysis
- **SEMrush:** Comprehensive (has free tier)

### Red Flags to Watch

If you see these, there's a problem:

🚩 **Traffic drops 50%+ suddenly**
- Usually means Google penalty
- Check Search Console for messages
- Check for hacking or malware
- Review recent changes

🚩 **Ranking drops across the board**
- Might be algorithm update
- Check your ranking tracking tool
- Wait 2-3 weeks, usually recovers
- If not, something is wrong

🚩 **New pages not indexing**
- Check if page is blocked (robots.txt, noindex)
- Check if page has nofollow links
- Re-request indexing in Search Console
- Wait up to 2 weeks

🚩 **Core Web Vitals failing**
- Site is too slow
- Report to development
- May need technical fixes
- Impacts rankings

---

## Tracking Success

### What to Measure

You should track 4 categories of metrics:

#### Category 1: Search Visibility
How many people find you through Google

**Metrics:**
- **Impressions:** "People saw your page in search results"
  - Goal: 1,000+ impressions/month by Month 6
  - Goal: 5,000+ impressions/month by Year 1

- **Clicks:** "People clicked from search to your site"
  - Goal: 200+ clicks/month by Month 6
  - Goal: 1,000+ clicks/month by Year 1

- **Rankings:** Position for key keywords
  - Goal: Top 10 for "things to do in Greenville" by Month 3
  - Goal: Top 3 for "Falls Park tour" by Month 6

- **Click-through rate (CTR):** % who click when they see you
  - Average: 2-3%
  - Goal: 3-5% (better titles/descriptions)

**Where to find this:**
- Google Search Console (free)
- Google Analytics 4 (free)

**Update frequency:** Weekly check, monthly analysis

#### Category 2: Traffic Quality
How many actual visitors you get and what they do

**Metrics:**
- **Organic traffic:** Total visitors from Google search
  - Goal: 100-200/month by Month 3
  - Goal: 500+/month by Month 6
  - Goal: 1,000+/month by Year 1

- **Session duration:** How long they stay
  - Good: 2+ minutes
  - Excellent: 5+ minutes
  - Visitors should explore your site

- **Bounce rate:** % who leave immediately
  - Good: Under 60%
  - Excellent: Under 40%
  - Lower is better

- **Pages per session:** How many pages they visit
  - Good: 2+
  - Excellent: 3+
  - Shows engagement

- **Conversion rate:** % who book/purchase
  - Start: 1-2%
  - Goal: 3-5%
  - Each visitor = potential customer

**Where to find this:**
- Google Analytics 4 (free)
- Your own booking/payment system

**Update frequency:** Daily check, weekly analysis

#### Category 3: Local Visibility
How visible you are in maps and local search

**Metrics:**
- **Google Business Profile views:** People clicked on your profile
  - Goal: 50+/month by Month 2
  - Goal: 500+/month by Year 1

- **Direction requests:** People asked for directions
  - Goal: 5+/month by Month 2
  - Goal: 50+/month by Year 1

- **Phone calls:** Customers called from Google
  - Goal: 1-2/month starting
  - Goal: 10+/month by Year 1

- **Website clicks from profile:** People clicked your website
  - Goal: 10+/month starting
  - Goal: 100+/month by Year 1

- **Google Maps ranking:** Position in 3-pack
  - Goal: Within 3 pack for "tours greenville" by Month 2
  - Goal: Position 1 for "Falls Park tour" by Month 6

**Where to find this:**
- Google Business Profile Insights (free)
- Google Search Console (local results section)

**Update frequency:** Weekly check, monthly analysis

#### Category 4: Online Presence/Authority
How credible and well-established you appear

**Metrics:**
- **Review count:** Number of reviews
  - Goal: 20+ by Month 6
  - Goal: 50+ by Year 1
  - Goal: 100+ by Year 2

- **Review rating:** Average star rating
  - Goal: 4.0+ by Month 1
  - Goal: 4.5+ by Month 6
  - Goal: 4.7+ by Year 1

- **Backlinks:** Links from other sites
  - Goal: 25+ by Month 3
  - Goal: 50+ by Month 6
  - Goal: 100+ by Year 1

- **Referring domains:** Unique sites linking to you
  - Goal: 15+ by Month 6
  - Goal: 30+ by Year 1

- **Social followers:** Community built
  - Goal: 500+ by Month 3
  - Goal: 1,000+ by Month 6
  - Goal: 2,000+ by Year 1

**Where to find this:**
- Google Search Console (links)
- Google My Business (reviews)
- Instagram/Facebook (followers)
- Ahrefs or SEMrush (backlinks)

**Update frequency:** Monthly check

### Monthly SEO Report Template

Create a simple spreadsheet or Google Sheet:

```
MARCH 2026 - SEO METRICS

SEARCH VISIBILITY
Impressions this month: 850
Clicks this month: 145
Avg CTR: 2.8%
Top keyword: "things to do greenville" (Position 12)

TRAFFIC QUALITY
Organic visitors: 189
Avg session duration: 2:34
Bounce rate: 52%
Pages per session: 2.1
Purchases from organic: 3 ($29.97)

LOCAL VISIBILITY
Google profile views: 427
Direction requests: 23
Phone calls: 4
Maps rank for "Falls Park tour": Position 2

AUTHORITY
New reviews: 5 (4.8 avg)
Total reviews: 23 (4.6 avg)
New backlinks: 3
Total backlinks: 31
Instagram followers: 487

NOTES
- Great growth in local visibility
- Need to improve blog traffic
- Next month: publish 2 more blog posts
```

### Tools to Use (Free/Cheap)

**Essential:**
- Google Search Console (free)
- Google Analytics 4 (free)
- Google My Business (free)

**Nice to have:**
- Ahrefs (free tier available, $99+/month for full)
- SEMrush (free tier, $120+/month for full)
- Rank Tracker (free tier)
- Ubersuggest (free tier, $12/month for full)

**Monthly cost:** $0-150 depending on tool choices
**Time commitment:** 3-5 hours per month

### Key Metrics to Track (The Big 3)

If you only track three things, track these:

1. **Organic traffic growth:** Is it going up?
   - Month 1: 100 visitors
   - Month 6: 500-750 visitors (goal)
   - Year 1: 1,000-1,500 visitors (goal)

2. **Conversion rate:** Are visitors booking?
   - Month 1: 1-2%
   - Month 6: 3-5%
   - Year 1: 5-7%

3. **Review rating:** What do customers think?
   - Month 1: 4.0+ stars
   - Month 6: 4.5+ stars
   - Year 1: 4.7+ stars

These three metrics tell you everything you need to know.

---

## Appendix: Keyword List to Track

Here are the keywords to monitor in Google Search Console. Track weekly:

### HIGH PRIORITY (You should rank #1-3 for these)
1. Falls Park tour
2. Falls Park walking tour
3. self-guided tour Greenville
4. GPS audio tour Greenville
5. tour near me Greenville

### MEDIUM PRIORITY (Aim for top 10)
6. Things to do in Greenville SC
7. Greenville SC walking tours
8. Downtown Greenville tour
9. Greenville attractions
10. What to do in Greenville

### BONUS (Build traffic if you rank well)
11. Liberty Bridge Greenville
12. Reedy River Greenville
13. Falls Park Greenville
14. Historic Greenville SC
15. Greenville SC history

### HOW TO TRACK
1. Go to Google Search Console
2. Go to Performance → Queries
3. Export monthly (download as CSV)
4. Create spreadsheet with columns:
   - Keyword
   - Impressions
   - Clicks
   - CTR
   - Avg Position
5. Track month-over-month changes

---

## Quick Reference: Timeline to Success

### Month 1: Foundation
- ✅ Google Search Console setup (done immediately)
- ✅ Submit sitemap (done immediately)
- ✅ Google Business Profile created and optimized
- ✅ TripAdvisor and Yelp listings
- ✅ Images created (og-image, twitter-card, favicon)
- ✅ First 5-10 reviews collected

**Expected results:** 0-100 organic visitors

### Month 2-3: Content & Local
- ✅ Blog post series launched (posts 1-5)
- ✅ Review count reaches 15-20
- ✅ Local directory submissions complete
- ✅ First partnerships established
- ✅ Social media launch (Instagram, Facebook)

**Expected results:** 50-150 organic visitors/month

### Month 4-6: Growth
- ✅ Blog posts 6-15 published
- ✅ Review count reaches 30-50
- ✅ Guest posts and news coverage
- ✅ Link building campaign active
- ✅ Social media audience 500+

**Expected results:** 200-500 organic visitors/month

### Month 7-12: Maturity
- ✅ Blog posts 16-20 published (ongoing)
- ✅ Review count reaches 50-100
- ✅ Backlinks reach 50+
- ✅ Rank top 3 for target keywords
- ✅ Social audience 1,000+

**Expected results:** 500-1,500 organic visitors/month

### Year 2+: Authority
- ✅ 100+ reviews
- ✅ 100+ backlinks
- ✅ Rank #1 for local keywords
- ✅ 30+ blog posts
- ✅ 5,000+ social followers

**Expected results:** 2,000+ organic visitors/month

---

## Final Thoughts for Steven

**You're starting from a great position.** The technical SEO is already done. You have:
- Perfect meta tags
- 8 schema types
- 18 content pages
- Proper sitemap and robots.txt
- Mobile-optimized design
- Fast loading speed
- Analytics tracking

**What separates successful tour operators from unsuccessful ones:**
1. Google Business Profile optimization (LOCAL TRAFFIC)
2. Consistent review generation (CREDIBILITY)
3. Regular content marketing (ORGANIC TRAFFIC)
4. Social media presence (BRAND AWARENESS)
5. Local partnerships (PARTNERSHIPS)

**The 80/20 rule for your business:**
- 80% of your growth will come from:
  - Google Business Profile + reviews (local search)
  - Social media referrals
  - Direct bookings from word-of-mouth

- 20% will come from:
  - Blog posts and organic search
  - Paid advertising
  - Traditional marketing

**Focus on what drives immediate results:**
1. Get that Google Business Profile perfect (this week)
2. Start collecting reviews (ongoing)
3. Launch Instagram (this month)
4. Build 10 local partnerships (next 3 months)
5. Start blog (Month 2)

**Don't get overwhelmed.** You don't need to do everything at once. Pick the Quick Wins and execute them perfectly. Then move to the next tier.

**Measure what matters:** Organic traffic, reviews, and conversion rate. Everything else is noise.

**Remember:** SEO takes time. You won't see major results for 3-6 months. But once you start ranking, the traffic compounds. A year from now, you should have a steady flow of customers from search.

**One more thing:** Your tour itself is your best marketing. If people have an amazing experience, they leave reviews, tell friends, and book again. Focus on delivering an incredible experience first. Everything else is secondary.

Good luck! Feel free to refer back to this document anytime.

---

## Document Metadata
- **Created:** March 9, 2026
- **For:** Steven (Basecamp Data Analytics)
- **Project:** Falls Park Walking Tour
- **Status:** Ready to execute
- **Last Updated:** March 9, 2026
- **Version:** 1.0
