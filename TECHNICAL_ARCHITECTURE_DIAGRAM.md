# Falls Park Historical Tour - Complete Technical Architecture

## 🏗️ System Architecture Overview

```mermaid
graph TB
    %% USER ACCESS LAYER
    subgraph "📱 User Access Layer"
        direction TB
        QR[📱 QR Code Scan<br/>Entry Point]
        PWA[🌍 Progressive Web App<br/>Mobile-First Design]
        Browser[🌐 Browser Support<br/>iOS Safari, Chrome, Firefox]
    end

    %% FRONTEND APPLICATION ARCHITECTURE
    subgraph "⚛️ Frontend Application (React 19 + Vite)"
        direction TB

        subgraph "🎭 Screen Components & Routing"
            AppJS[📋 App.jsx<br/>State Manager & Router]
            Welcome[🏠 WelcomeScreen.jsx<br/>Entry Point & Preview]
            GroupSize[👥 GroupSizeSelector.jsx<br/>Individual vs Group]
            IndividualPrice[💰 IndividualPricing.jsx<br/>Pay-What-You-Want]
            GroupPrice[👨‍👩‍👧‍👦 GroupPricing.jsx<br/>Group Rates]
            Payment[💳 PaymentFlow.jsx<br/>Stripe Integration]
            Success[✅ PaymentSuccess.jsx<br/>Confirmation Page]
            TourMap[🗺️ TourMap.jsx<br/>Core Map Interface]
            AudioPlayer[🎧 AudioPlayer.jsx<br/>Audio Controls]
            Admin[⚙️ AdminPanel.jsx<br/>Admin Interface]
        end

        subgraph "🔧 Specialized Components"
            LocationTracker[📍 LocationTracker<br/>GPS Geofencing Logic]
            RouteRenderer[🛤️ RouteRenderer<br/>Walking Path Display]
            OfflineDownload[📥 OfflineDownload.jsx<br/>Content Caching]
        end

        subgraph "🎣 Custom React Hooks"
            UseLocation[📍 useLocation.js<br/>GPS State Management]
            UseOffline[📡 useOffline.js<br/>Offline State Logic]
        end

        subgraph "🧰 Utility Libraries"
            LocationUtils[📍 location.js<br/>Haversine Distance Calc]
            StorageUtils[💾 storage.js<br/>localStorage Wrapper]
            StripeUtils[💳 stripe.js<br/>Payment Utilities]
        end
    end

    %% STATE & DATA MANAGEMENT
    subgraph "🏪 State Management Architecture"
        direction TB

        subgraph "📊 Application State"
            AppState[🎭 App.jsx Central State<br/>Screen Navigation, User Location<br/>Tour Purchased, Current Stop]
            ComponentState[🧩 Component Local State<br/>Audio Playing, Selected Group<br/>Payment Info, GPS Tracking]
        end

        subgraph "💾 Persistent Storage"
            LocalStorage[💾 localStorage<br/>tourPurchased, paymentInfo<br/>tour_access, offlineContent]
            SessionStorage[🔄 sessionStorage<br/>Temporary Session Data]
        end

        subgraph "📈 Runtime Data"
            UserLocation[📍 User Location State<br/>lat, lng, accuracy<br/>heading, speed, timestamp]
            TourProgress[📈 Tour Progress<br/>Visited Stops, Audio Status<br/>Current Position]
        end
    end

    %% GEOLOCATION & MAPPING SYSTEM
    subgraph "🗺️ Geolocation & Mapping System"
        direction TB

        subgraph "🌍 Map Rendering Stack"
            ReactLeaflet[🍃 React Leaflet<br/>React Map Components]
            Leaflet[🗺️ Leaflet.js Core<br/>Interactive Map Library]
            OpenStreetMap[🌐 OpenStreetMap<br/>Free Map Tiles]
        end

        subgraph "📍 Geolocation Services"
            BrowserGPS[🛰️ Browser Geolocation API<br/>navigator.geolocation]
            GPSTracking[📡 Continuous GPS Tracking<br/>watchPosition() with Options:<br/>enableHighAccuracy: true<br/>timeout: 15000ms<br/>maximumAge: 5000ms]
            Geofencing[⭕ Geofencing Engine<br/>20m Circular Geofences<br/>Haversine Distance Calculation<br/>Auto-trigger Logic]
        end

        subgraph "🛤️ Route Calculation"
            RoutingService[🛤️ routingService.js<br/>Walking Route Calculator]
            OpenRouteService[🗺️ OpenRouteService API<br/>External Routing Service]
            FallbackRoute[🔄 Fallback Routing<br/>Stop-to-Stop Direct Path]
        end

        subgraph "🎯 Map Features"
            UserMarker[📍 User Location Marker<br/>Dynamic with Heading Arrow<br/>GPS Accuracy Indicator]
            StopMarkers[🏛️ Tour Stop Markers<br/>Numbered Icons, START Marker<br/>Popup Information]
            GeofenceCircles[⭕ Geofence Visualization<br/>20m Radius Circles<br/>Green Fill & Border]
            RoutePolyline[🛤️ Walking Route Line<br/>Curved Path Between Stops<br/>Direction Arrows]
        end
    end

    %% BACKEND SERVICES ARCHITECTURE
    subgraph "☁️ Backend Services Architecture"
        direction TB

        subgraph "🔥 Firebase Backend Services"
            FirebaseApp[🔥 Firebase App<br/>Central Configuration]
            Firestore[🗃️ Firestore Database<br/>NoSQL Document Store<br/>Tour Data, Analytics]
            FirebaseStorage[📁 Firebase Storage<br/>Audio Files (.wav)<br/>Images, Static Assets]
            FirebaseAuth[🔐 Firebase Auth<br/>Optional User Authentication<br/>Anonymous & Social Login]
        end

        subgraph "▲ Vercel Serverless Functions"
            CreateCheckout[💳 create-checkout-session.js<br/>Stripe Session Creation<br/>Product Configuration<br/>Success/Cancel URLs]
            VerifyPayment[✅ verify-payment.js<br/>Payment Verification<br/>Webhook Handling<br/>Tour Access Grant]
        end

        subgraph "💳 Stripe Payment Platform"
            StripeCheckout[💳 Stripe Checkout<br/>Hosted Payment Page<br/>Card Processing<br/>Security Compliance]
            StripeWebhooks[🔔 Stripe Webhooks<br/>Payment Events<br/>Success/Failure Notifications]
            StripeAPI[🔌 Stripe API<br/>Payment Management<br/>Customer Records<br/>Transaction History]
        end
    end

    %% DATA LAYER ARCHITECTURE
    subgraph "📊 Data Layer Architecture"
        direction TB

        subgraph "🏛️ Static Tour Data"
            TourStopsJSON[📍 falls_park_tour_stops.json<br/>7 Historical Stops:<br/>• Cradle of Greenville<br/>• Liberty Bridge<br/>• Reedy River Falls<br/>• Wyche Pavilion<br/>• Charles H. Townes<br/>• Medusa Tree & Furman<br/>• Falls Park Gardens]

            AudioAssets[🎧 Audio Files<br/>Professional Narration<br/>WAV Format, 3-5min each<br/>Welcome Audio (0_WELCOME.wav)]

            ImageAssets[🖼️ Visual Assets<br/>Tour Stop Images<br/>UI Graphics & Icons<br/>Route Reference Maps]
        end

        subgraph "💾 Dynamic Application Data"
            UserSessionData[👤 User Session Data<br/>Current Screen State<br/>Selected Group Type<br/>Payment Information]

            PaymentData[💰 Payment Information<br/>Stripe Session IDs<br/>Purchase Confirmation<br/>Tour Access Status]

            TourProgressData[📈 Tour Progress Tracking<br/>Visited Stops<br/>Current Audio Position<br/>Completion Status]

            OfflineCacheData[📥 Offline Cache<br/>Downloaded Audio Files<br/>Cached Map Tiles<br/>Static Assets]
        end
    end

    %% CONFIGURATION SYSTEM
    subgraph "⚙️ Configuration System"
        direction TB

        subgraph "🔐 Environment Configuration"
            EnvVars[🔐 Environment Variables<br/>.env.local File]
            FirebaseConfig[🔥 Firebase Configuration<br/>API Keys, Project ID<br/>Storage Bucket, Auth Domain]
            StripeConfig[💳 Stripe Configuration<br/>Publishable Key (Client)<br/>Secret Key (Server)]
        end

        subgraph "⚡ Build Configuration"
            ViteConfig[⚡ vite.config.js<br/>Dev Server Settings<br/>Build Optimization<br/>HMR Configuration]
            TailwindConfig[🎨 Tailwind CSS Config<br/>Design System<br/>Custom Colors & Themes]
            ESLintConfig[🔍 ESLint Configuration<br/>Code Quality Rules<br/>React Best Practices]
        end

        subgraph "📦 Package Configuration"
            PackageJSON[📦 package.json<br/>Dependencies Management<br/>React 19, Vite 7<br/>Leaflet, Stripe, Firebase]
        end
    end

    %% DEPLOYMENT & INFRASTRUCTURE
    subgraph "🚀 Deployment & Infrastructure"
        direction TB

        subgraph "▲ Vercel Platform"
            VercelDeploy[🚀 Vercel Deployment<br/>Automatic CI/CD<br/>Git Integration<br/>Branch Previews]
            VercelDomain[🌐 Custom Domain<br/>tours.basecampdataanalytics.com<br/>SSL/TLS Encryption]
            VercelFunctions[⚡ Serverless Functions<br/>API Routes (/api/*)<br/>Node.js Runtime<br/>Global Edge Network]
            VercelCDN[🌐 Global CDN<br/>Static Asset Delivery<br/>Image Optimization<br/>Caching Strategy]
        end

        subgraph "📡 External Service Integration"
            StripeInfrastructure[💳 Stripe Infrastructure<br/>PCI DSS Compliance<br/>Global Payment Processing<br/>99.99% Uptime SLA]
            FirebaseCloud[☁️ Firebase Cloud Platform<br/>Google Cloud Infrastructure<br/>Global Data Centers<br/>Automatic Scaling]
            OSMInfrastructure[🗺️ OpenStreetMap CDN<br/>Community Map Data<br/>Tile Servers Worldwide]
            ORSInfrastructure[🛤️ OpenRouteService<br/>Routing Calculations<br/>Walking/Pedestrian Routes]
        end
    end

    %% DEVELOPMENT WORKFLOW
    subgraph "🛠️ Development Workflow"
        direction TB

        subgraph "💻 Development Environment"
            NodeJS[📦 Node.js 20+<br/>JavaScript Runtime<br/>Package Manager (npm)]
            ViteDev[⚡ Vite Dev Server<br/>Hot Module Replacement<br/>Fast Refresh<br/>Source Maps]
            DevTools[🔧 Browser DevTools<br/>React DevTools<br/>GPS Simulation<br/>Network Throttling]
        end

        subgraph "📝 Version Control"
            Git[📝 Git Version Control<br/>Feature Branches<br/>Commit History<br/>Collaborative Development]
            GitHub[🐙 GitHub Repository<br/>Code Hosting<br/>Issue Tracking<br/>Pull Requests]
        end

        subgraph "🧪 Testing & Quality"
            ESLint[🔍 ESLint Linting<br/>Code Quality Checks<br/>React Rules<br/>Security Patterns]
            BrowserTesting[🌐 Cross-Browser Testing<br/>iOS Safari Priority<br/>Chrome, Firefox<br/>Mobile Compatibility]
            GPSTesting[📍 GPS Testing Requirements<br/>On-Location Validation<br/>All 7 Tour Stops<br/>Geofence Accuracy]
        end
    end

    %% SECURITY & PERFORMANCE LAYER
    subgraph "🔒 Security & Performance"
        direction TB

        subgraph "🔐 Security Measures"
            HTTPS[🔒 HTTPS Encryption<br/>TLS 1.3 Protocol<br/>Certificate Management]
            EnvSecurity[🔐 Environment Security<br/>API Key Protection<br/>No Client-Side Secrets<br/>Serverless Function Isolation]
            DataPrivacy[🛡️ Data Privacy<br/>No GPS Data Storage<br/>Minimal User Tracking<br/>GDPR Compliance]
        end

        subgraph "⚡ Performance Optimization"
            LazyLoading[📦 Lazy Loading<br/>Component Code Splitting<br/>Route-Based Chunks<br/>Dynamic Imports]
            AssetOptimization[🖼️ Asset Optimization<br/>Image Compression<br/>Audio File Optimization<br/>Bundle Minimization]
            Caching[💾 Caching Strategy<br/>Browser Caching<br/>Service Worker<br/>Offline Content]
        end

        subgraph "📱 Mobile Performance"
            TouchOptimization[👆 Touch Optimization<br/>44px Touch Targets<br/>Gesture Recognition<br/>Smooth Animations]
            BatteryOptimization[🔋 Battery Optimization<br/>Efficient GPS Polling<br/>Background Processing<br/>Power Management]
            NetworkOptimization[📶 Network Optimization<br/>Offline Capability<br/>Progressive Loading<br/>Connection Resilience]
        end
    end

    %% DETAILED CONNECTIONS

    %% User Flow Connections
    QR --> Welcome
    Welcome --> GroupSize
    GroupSize --> IndividualPrice
    GroupSize --> GroupPrice
    IndividualPrice --> Payment
    GroupPrice --> Payment
    Payment --> Success
    Success --> TourMap
    Welcome --> TourMap

    %% Component Architecture
    AppJS --> Welcome
    AppJS --> GroupSize
    AppJS --> IndividualPrice
    AppJS --> GroupPrice
    AppJS --> Payment
    AppJS --> Success
    AppJS --> TourMap
    AppJS --> AudioPlayer
    AppJS --> Admin

    TourMap --> LocationTracker
    TourMap --> RouteRenderer
    TourMap --> OfflineDownload
    TourMap --> ReactLeaflet
    AudioPlayer --> AudioAssets

    %% State Management Flow
    AppJS --> AppState
    AppJS --> LocalStorage
    AppJS --> SessionStorage
    AppState --> ComponentState
    AppState --> UserLocation
    AppState --> TourProgress

    %% Geolocation System
    BrowserGPS --> GPSTracking
    GPSTracking --> LocationTracker
    LocationTracker --> Geofencing
    LocationTracker --> UserLocation
    Geofencing --> AudioPlayer

    %% Map System Integration
    ReactLeaflet --> Leaflet
    Leaflet --> OpenStreetMap
    TourMap --> UserMarker
    TourMap --> StopMarkers
    TourMap --> GeofenceCircles
    TourMap --> RoutePolyline
    RouteRenderer --> RoutingService
    RoutingService --> OpenRouteService
    RoutingService --> FallbackRoute

    %% Backend Integration
    Payment --> CreateCheckout
    CreateCheckout --> StripeAPI
    StripeAPI --> StripeCheckout
    StripeCheckout --> VerifyPayment
    VerifyPayment --> StripeWebhooks

    Firebase --> Firestore
    Firebase --> FirebaseStorage
    Firebase --> FirebaseAuth

    %% Data Flow
    TourStopsJSON --> TourMap
    TourStopsJSON --> LocationTracker
    AudioAssets --> AudioPlayer
    ImageAssets --> TourMap
    UserSessionData --> AppState
    PaymentData --> Payment

    %% Configuration Flow
    EnvVars --> FirebaseConfig
    EnvVars --> StripeConfig
    FirebaseConfig --> FirebaseApp
    StripeConfig --> CreateCheckout
    ViteConfig --> ViteDev
    TailwindConfig --> ViteDev

    %% Deployment Flow
    Git --> VercelDeploy
    VercelDeploy --> VercelFunctions
    VercelFunctions --> CreateCheckout
    VercelFunctions --> VerifyPayment
    VercelDomain --> VercelCDN
    VercelCDN --> PWA

    %% External Services
    CreateCheckout --> StripeInfrastructure
    Firestore --> FirebaseCloud
    OpenStreetMap --> OSMInfrastructure
    RoutingService --> ORSInfrastructure

    %% Development Workflow
    NodeJS --> ViteDev
    ViteDev --> DevTools
    Git --> GitHub
    ESLint --> BrowserTesting
    BrowserTesting --> GPSTesting

    %% STYLING
    classDef userLayer fill:#e1f5fe,stroke:#01579b,stroke-width:3px,color:#000
    classDef frontendLayer fill:#f3e5f5,stroke:#4a148c,stroke-width:2px,color:#000
    classDef stateLayer fill:#fff8e1,stroke:#ff8f00,stroke-width:2px,color:#000
    classDef geoLayer fill:#e8f5e8,stroke:#2e7d32,stroke-width:2px,color:#000
    classDef backendLayer fill:#e3f2fd,stroke:#1565c0,stroke-width:2px,color:#000
    classDef dataLayer fill:#fff3e0,stroke:#ef6c00,stroke-width:2px,color:#000
    classDef configLayer fill:#fce4ec,stroke:#ad1457,stroke-width:2px,color:#000
    classDef deployLayer fill:#f1f8e9,stroke:#558b2f,stroke-width:2px,color:#000
    classDef devLayer fill:#e0f2f1,stroke:#00796b,stroke-width:2px,color:#000
    classDef securityLayer fill:#ffebee,stroke:#c62828,stroke-width:2px,color:#000

    class QR,PWA,Browser userLayer
    class AppJS,Welcome,GroupSize,IndividualPrice,GroupPrice,Payment,Success,TourMap,AudioPlayer,Admin,LocationTracker,RouteRenderer,OfflineDownload,UseLocation,UseOffline,LocationUtils,StorageUtils,StripeUtils frontendLayer
    class AppState,ComponentState,LocalStorage,SessionStorage,UserLocation,TourProgress stateLayer
    class ReactLeaflet,Leaflet,OpenStreetMap,BrowserGPS,GPSTracking,Geofencing,RoutingService,OpenRouteService,FallbackRoute,UserMarker,StopMarkers,GeofenceCircles,RoutePolyline geoLayer
    class FirebaseApp,Firestore,FirebaseStorage,FirebaseAuth,CreateCheckout,VerifyPayment,StripeCheckout,StripeWebhooks,StripeAPI backendLayer
    class TourStopsJSON,AudioAssets,ImageAssets,UserSessionData,PaymentData,TourProgressData,OfflineCacheData dataLayer
    class EnvVars,FirebaseConfig,StripeConfig,ViteConfig,TailwindConfig,ESLintConfig,PackageJSON configLayer
    class VercelDeploy,VercelDomain,VercelFunctions,VercelCDN,StripeInfrastructure,FirebaseCloud,OSMInfrastructure,ORSInfrastructure deployLayer
    class NodeJS,ViteDev,DevTools,Git,GitHub,ESLint,BrowserTesting,GPSTesting devLayer
    class HTTPS,EnvSecurity,DataPrivacy,LazyLoading,AssetOptimization,Caching,TouchOptimization,BatteryOptimization,NetworkOptimization securityLayer
```

## 📋 Architecture Deep Dive

### 🎯 **Core User Journey Flow**
```
QR Code Scan → Welcome Screen → Group Selection → Pricing → Payment → Tour Map → GPS Geofencing → Audio Playback
```

### 📍 **GPS Geofencing System Details**

**Location Tracking Configuration:**
```javascript
watchPosition(position => {
  // High-precision GPS tracking
}, error => {
  // Fallback handling
}, {
  enableHighAccuracy: true,    // Use GPS, not network
  timeout: 15000,              // 15 second timeout
  maximumAge: 5000             // Accept positions up to 5 seconds old
})
```

**Geofencing Logic:**
- **Radius**: 20m circular geofences around each stop
- **Algorithm**: Haversine formula for distance calculation
- **Triggers**: Auto-play audio on geofence entry
- **Re-trigger**: Allow re-entry after leaving 30m buffer zone
- **Fallback**: Manual play buttons for GPS issues

### 🗺️ **Tour Stop Details**
1. **Cradle of Greenville** - [34.845, -82.401] - 180s narration
2. **Liberty Bridge** - [34.845, -82.401] - 180s narration
3. **Reedy River Falls** - [34.845, -82.401] - 300s narration
4. **Wyche Pavilion** - [34.846, -82.402] - 180s narration
5. **Charles H. Townes** - [34.845, -82.402] - 180s narration
6. **Medusa Tree & Furman** - [34.844, -82.402] - 180s narration
7. **Falls Park Gardens** - [34.844, -82.402] - 180s narration

### 💳 **Payment Flow Architecture**

**Stripe Integration:**
```javascript
// Client-side (PaymentFlow.jsx)
const stripe = await loadStripe(VITE_STRIPE_PUBLISHABLE_KEY);

// Server-side (create-checkout-session.js)
const session = await stripe.checkout.sessions.create({
  payment_method_types: ['card'],
  mode: 'payment',
  success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
  cancel_url: `${origin}/payment?cancelled=true`
});
```

**Pricing Structure:**
- **Individual**: Pay-what-you-want (minimum $0.50)
- **Small Group** (2-4 people): Group rates
- **Large Group** (5+ people): Volume pricing

### ⚡ **Performance Optimizations**

**Bundle Splitting:**
- Route-based code splitting
- Lazy loading of map components
- Dynamic audio loading

**Mobile Optimizations:**
- Touch targets ≥44px
- Efficient GPS polling
- Battery usage optimization
- Offline content caching

**Network Resilience:**
- Service worker implementation
- Fallback route rendering
- Progressive loading strategy

### 🔒 **Security Implementation**

**API Key Protection:**
```javascript
// Client-side - Only publishable keys
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...

// Server-side - Secret keys in environment
STRIPE_SECRET_KEY=sk_test_...
```

**Data Privacy:**
- GPS coordinates not permanently stored
- Minimal user data collection
- GDPR compliance measures
- Secure payment processing (PCI DSS)

### 📱 **Mobile Browser Compatibility**

**iOS Safari Specific:**
- Audio autoplay handling
- Touch event optimization
- Viewport configuration
- Battery optimization

**Android Chrome:**
- GPS permission handling
- Background processing limits
- Performance monitoring

### 🧪 **Testing Strategy**

**GPS Testing Requirements:**
- Physical testing at all 7 tour stop locations
- Geofence accuracy validation (±5m tolerance)
- Different weather conditions
- Various mobile devices

**Payment Testing:**
- Stripe test card numbers
- Success/failure scenarios
- Webhook verification
- Error handling

**Browser Testing Matrix:**
- iOS Safari (primary target)
- Chrome Mobile
- Firefox Mobile
- Desktop fallback support

This comprehensive architecture ensures a robust, scalable, and user-friendly tour experience with enterprise-grade security, performance, and reliability.