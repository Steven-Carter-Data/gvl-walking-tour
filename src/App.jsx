import { useState, useEffect } from 'react';
import WelcomeScreen from './components/WelcomeScreen';
import GroupSizeSelector from './components/GroupSizeSelector';
import IndividualPricing from './components/IndividualPricing';
import TourMap from './components/TourMap';
import AudioPlayer from './components/AudioPlayer';
import PaymentFlow from './components/PaymentFlow';
import PaymentSuccess from './components/PaymentSuccess';
import AdminPanel from './components/AdminPanel';
import tourData from './data/greenville_tour_stops_with_test_scripts.json';

function App() {
  const [currentScreen, setCurrentScreen] = useState(() => {
    // Check URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    
    // Check if we're on the success page
    if (urlParams.get('session_id')) {
      return 'success';
    }
    
    // Check if user wants to go directly to tour
    if (urlParams.get('tour') === 'true') {
      return 'map';
    }
    
    return 'welcome';
  });
  const [userLocation, setUserLocation] = useState(null);
  const [tourPurchased, setTourPurchased] = useState(() => {
    // Check if tour access has been granted via payment
    return localStorage.getItem('tour_access') === 'granted' || 
           localStorage.getItem('tourPurchased') === 'true';
  });
  const [currentStop, setCurrentStop] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [paymentInfo, setPaymentInfo] = useState(null);

  useEffect(() => {
    let watchId;
    
    // Start continuous GPS tracking
    if (navigator.geolocation) {
      console.log('🛰️ Starting continuous GPS tracking...');
      
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
            heading: position.coords.heading,
            speed: position.coords.speed,
            timestamp: position.timestamp
          };
          
          console.log('📍 GPS Update:', newLocation);
          setUserLocation(newLocation);
        },
        (error) => {
          console.error('❌ GPS tracking error:', error);
          
          // Fallback to single position request
          navigator.geolocation.getCurrentPosition(
            (position) => {
              console.log('📍 Fallback GPS position obtained');
              setUserLocation({
                lat: position.coords.latitude,
                lng: position.coords.longitude,
                accuracy: position.coords.accuracy
              });
            },
            (fallbackError) => {
              console.error('❌ Fallback GPS also failed:', fallbackError);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
          );
        },
        { 
          enableHighAccuracy: true,    // Use GPS, not network location
          timeout: 15000,              // 15 second timeout
          maximumAge: 5000             // Accept positions up to 5 seconds old
        }
      );
    }

    // Cleanup: stop watching location when component unmounts
    return () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
        console.log('🛑 GPS tracking stopped');
      }
    };
  }, []);

  const handleScreenChange = (screen) => {
    setCurrentScreen(screen);
    // Unlock audio on first user interaction
    if (!audioUnlocked) {
      unlockAudio();
    }
  };
  
  const handleGroupSelect = (groupOption) => {
    setSelectedGroup(groupOption);
    if (groupOption.id === 'individual') {
      setCurrentScreen('individual-pricing');
    } else {
      // For now, skip to payment - we'll add group pricing pages later
      setPaymentInfo({
        type: 'group',
        groupSize: groupOption.id,
        amount: groupOption.pricing
      });
      setCurrentScreen('payment');
    }
  };
  
  const handlePaymentSelect = (paymentData) => {
    setPaymentInfo(paymentData);
    setCurrentScreen('payment');
  };
  
  const unlockAudio = () => {
    console.log('🔓 Attempting to unlock audio for autoplay...');
    // Create a silent audio context to unlock audio
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const buffer = audioContext.createBuffer(1, 1, 22050);
    const source = audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContext.destination);
    source.start(0);
    
    setAudioUnlocked(true);
    console.log('✅ Audio unlocked for autoplay');
  };

  const handlePurchaseComplete = () => {
    setTourPurchased(true);
    localStorage.setItem('tourPurchased', 'true');
    localStorage.setItem('paymentInfo', JSON.stringify(paymentInfo));
    setCurrentScreen('map');
  };

  const handleStopTriggered = (stop) => {
    setCurrentStop(stop);
    setIsPlaying(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {currentScreen === 'welcome' && (
        <WelcomeScreen
          onScreenChange={() => setCurrentScreen('group-size')}
          tourPurchased={tourPurchased}
        />
      )}
      
      {currentScreen === 'group-size' && (
        <GroupSizeSelector
          onGroupSelect={handleGroupSelect}
          onBack={() => setCurrentScreen('welcome')}
        />
      )}
      
      {currentScreen === 'individual-pricing' && (
        <IndividualPricing
          onPaymentSelect={handlePaymentSelect}
          onBack={() => setCurrentScreen('group-size')}
        />
      )}
      
      {currentScreen === 'payment' && (
        <PaymentFlow
          paymentInfo={paymentInfo}
          onPaymentComplete={handlePurchaseComplete}
          onBack={() => {
            if (paymentInfo?.type === 'individual') {
              setCurrentScreen('individual-pricing');
            } else {
              setCurrentScreen('group-size');
            }
          }}
        />
      )}
      
      {currentScreen === 'success' && (
        <PaymentSuccess />
      )}
      
      {currentScreen === 'map' && (
        <TourMap
          userLocation={userLocation}
          tourStops={tourData.stops}
          tourPurchased={tourPurchased}
          onStopTriggered={handleStopTriggered}
          onBack={() => handleScreenChange('welcome')}
        />
      )}
      
      {isPlaying && currentStop && (
        <AudioPlayer
          stop={currentStop}
          isPlaying={isPlaying}
          audioUnlocked={audioUnlocked}
          onClose={() => {
            setIsPlaying(false);
            setCurrentStop(null);
          }}
        />
      )}
      
      {/* Admin panel - only shows with ?admin=true */}
      <AdminPanel />
    </div>
  );
}

export default App;
