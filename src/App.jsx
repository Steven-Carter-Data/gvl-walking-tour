import { useState, useEffect } from 'react';
import WelcomeScreen from './components/WelcomeScreen';
import TourMap from './components/TourMap';
import AudioPlayer from './components/AudioPlayer';
import PaymentFlow from './components/PaymentFlow';
import AdminPanel from './components/AdminPanel';
import tourData from './data/greenville_tour_stops_with_test_scripts.json';

function App() {
  const [currentScreen, setCurrentScreen] = useState('welcome');
  const [userLocation, setUserLocation] = useState(null);
  const [tourPurchased, setTourPurchased] = useState(true); // Free for MVP
  const [currentStop, setCurrentStop] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    // Request location permissions on app load
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error('Location access denied:', error);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    }

    // Tour is free for MVP - no purchase check needed
  }, []);

  const handleScreenChange = (screen) => {
    setCurrentScreen(screen);
  };

  const handlePurchaseComplete = () => {
    setTourPurchased(true);
    localStorage.setItem('tourPurchased', 'true');
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
          onScreenChange={handleScreenChange}
          tourPurchased={tourPurchased}
        />
      )}
      
      {currentScreen === 'payment' && (
        <PaymentFlow
          onPaymentComplete={handlePurchaseComplete}
          onBack={() => handleScreenChange('welcome')}
        />
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
