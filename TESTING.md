# Testing & QA Plan - Falls Park Tour MVP

## Overview

This document outlines the testing strategy for the Falls Park Historical Tour web application, covering functionality, usability, and performance testing across multiple devices and scenarios.

## Testing Categories

### 1. Functional Testing

#### Core Features
- [ ] **QR Code to App Flow**
  - QR code redirects to correct URL
  - App loads properly on mobile browsers
  - Welcome screen displays correctly

- [ ] **Preview Functionality**
  - Preview audio plays for 2 minutes
  - Preview stop information displays
  - Preview doesn't unlock full tour

- [ ] **Payment Flow**
  - Stripe checkout opens correctly
  - Test payments process successfully
  - Purchase confirmation updates app state
  - Failed payments handle gracefully

- [ ] **Tour Map**
  - Map loads with correct center point (Liberty Bridge)
  - All 10 tour stops display as markers
  - User location shows when permission granted
  - Stop markers show correct information
  - Locked stops appear differently than unlocked

- [ ] **GPS Geofencing**
  - Location permission request appears
  - GPS triggers audio when entering 20m radius
  - Manual trigger works as backup
  - Multiple stops can be triggered in sequence
  - Location accuracy warnings display when appropriate

- [ ] **Audio Player**
  - Audio files load and play correctly
  - Play/pause controls work
  - 15-second skip forward/backward functions
  - Playback speed changes (1x, 1.25x, 1.5x, 2x)
  - Progress bar shows correct position
  - Mini-player mode functions
  - Audio continues when minimized

#### Data Management
- [ ] **Local Storage**
  - Purchase state persists across sessions
  - Tour progress saves correctly
  - Visited stops are remembered
  - App works offline after download

- [ ] **Offline Functionality**
  - Download prompt appears after purchase
  - Content downloads successfully
  - App functions without internet
  - Cached content plays offline
  - Progress syncs when back online

### 2. Device & Browser Testing

#### Mobile Browsers (Primary)
- [ ] **iOS Safari** (iPhone 12+, iOS 15+)
  - Audio autoplay compliance
  - Location permissions
  - Touch interactions
  - Responsive layout

- [ ] **Android Chrome** (Android 10+)
  - GPS accuracy
  - Audio playback
  - Payment flow
  - Map interactions

#### Desktop Browsers (Secondary)
- [ ] **Chrome** - Basic functionality
- [ ] **Firefox** - Map and audio compatibility
- [ ] **Safari** - Payment processing

### 3. Location-Specific Testing

#### GPS Accuracy Testing (On-location)
Test each stop location:
1. Liberty Bridge (34.8524, -82.3940)
2. Reedy River Falls Viewpoint (34.852236, -82.393611)
3. Old Mill Ruins (34.851832, -82.394225)
4. West End Gateway (34.851522, -82.398048)
5. Peace Center Plaza (34.850922, -82.39917)
6. Main Street - One City Plaza (34.851934, -82.399961)
7. Old County Courthouse (34.852836, -82.400962)
8. Shoeless Joe Jackson Statue (34.846969, -82.40187)
9. Wyche Pavilion (34.85105, -82.400212)
10. Falls Park Gardens (34.85234, -82.39389)

For each stop:
- [ ] GPS triggers within 20m radius
- [ ] Doesn't trigger outside 25m radius
- [ ] Manual trigger works as backup
- [ ] Audio plays correctly
- [ ] Progress updates

#### Network Conditions
- [ ] **Strong WiFi** - Full functionality
- [ ] **4G/LTE** - Adequate performance
- [ ] **3G** - Graceful degradation
- [ ] **No Connection** - Offline mode works

### 4. Performance Testing

#### Load Times
- [ ] Initial app load < 3 seconds
- [ ] Map renders < 2 seconds
- [ ] Audio starts < 1 second after trigger
- [ ] Payment flow < 5 seconds to Stripe

#### Battery Impact
- [ ] GPS usage doesn't drain battery excessively
- [ ] Audio playback is efficient
- [ ] Background location tracking is optimized

#### Data Usage
- [ ] Initial load < 2MB
- [ ] Full tour download ~ 30MB
- [ ] Efficient caching reduces repeat data

### 5. User Experience Testing

#### Accessibility
- [ ] Screen reader compatibility
- [ ] High contrast mode support
- [ ] Large text scaling
- [ ] Voice control navigation

#### Error Handling
- [ ] **Location Denied** - Clear instructions to enable
- [ ] **No GPS Signal** - Manual navigation options
- [ ] **Payment Failed** - Retry options and support info
- [ ] **Network Error** - Offline mode promotion
- [ ] **Audio Failed** - Alternative content display

#### Edge Cases
- [ ] **Multiple Stops Simultaneously** - Handle overlapping geofences
- [ ] **Rapid Movement** - Don't trigger every stop when driving
- [ ] **App Backgrounded** - Resume state correctly
- [ ] **Low Storage** - Warn before download
- [ ] **Old Browser** - Graceful fallback

## Test Scenarios

### Scenario 1: Happy Path Tourist
1. Tourist scans QR code at hotel
2. Plays preview, likes it
3. Purchases tour via Stripe
4. Downloads for offline use
5. Walks to Liberty Bridge
6. Completes full 10-stop tour
7. Provides feedback

### Scenario 2: Technical Difficulties
1. User starts tour with poor GPS signal
2. Location permission denied initially
3. Manual triggers used for first few stops
4. Permission granted mid-tour
5. Automatic triggers work for remaining stops

### Scenario 3: Partial Tour
1. User purchases and starts tour
2. Completes 5 stops over 2 days
3. Returns to complete remaining stops
4. Progress is maintained correctly

## Automated Testing Setup

### Unit Tests (Future Enhancement)
```bash
# Install testing dependencies
npm install --save-dev @testing-library/react @testing-library/jest-dom vitest

# Run tests
npm run test
```

### E2E Testing (Future Enhancement)
- Cypress for full user journey testing
- Automated regression testing
- GPS simulation for location testing

## QA Checklist Before Launch

### Pre-Launch Validation
- [ ] All 10 audio files uploaded and tested
- [ ] All images display correctly
- [ ] Firebase configuration is production-ready
- [ ] Stripe is configured for live payments
- [ ] Analytics tracking is operational
- [ ] Error monitoring is set up

### Content Quality
- [ ] Audio narration is clear and professional
- [ ] Historical facts are accurate
- [ ] Images are properly licensed
- [ ] Tour duration estimates are realistic

### Security & Privacy
- [ ] No sensitive data exposed in client code
- [ ] Payment processing is secure
- [ ] Location data is handled appropriately
- [ ] Privacy policy is accessible

### Performance Benchmarks
- [ ] Lighthouse score > 90
- [ ] Core Web Vitals pass
- [ ] Mobile performance is acceptable
- [ ] Accessibility score > 95

## Bug Tracking

Use GitHub Issues with labels:
- `bug` - Functional issues
- `performance` - Speed/efficiency issues
- `ux` - User experience problems
- `mobile` - Device-specific issues
- `location` - GPS/geofencing problems
- `audio` - Playback issues
- `payment` - Stripe integration issues

## Success Criteria

The MVP is ready for launch when:
- All functional tests pass
- Performance meets benchmarks
- On-location GPS testing is 90%+ accurate
- Payment flow works reliably
- Offline mode functions properly
- User testing shows 80%+ completion rate for preview-to-purchase flow