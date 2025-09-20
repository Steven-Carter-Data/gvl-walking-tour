import { useState, useRef } from 'react';
import tourData from '../data/falls_park_tour_stops.json';

function WelcomeScreen({ onScreenChange, tourPurchased }) {
  const [showPreview, setShowPreview] = useState(false);
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);
  const audioRef = useRef(null);
  const previewTimeoutRef = useRef(null);
  
  const previewStop = tourData.stops[0]; // Liberty Bridge - the first stop

  const handlePreviewPlay = async () => {
    setShowPreview(true);
    
    if (audioRef.current) {
      try {
        if (isPreviewPlaying) {
          audioRef.current.pause();
          setIsPreviewPlaying(false);
          if (previewTimeoutRef.current) {
            clearTimeout(previewTimeoutRef.current);
          }
        } else {
          audioRef.current.currentTime = 0; // Start from beginning
          await audioRef.current.play();
          setIsPreviewPlaying(true);
          
          // Stop audio after 15 seconds
          previewTimeoutRef.current = setTimeout(() => {
            if (audioRef.current) {
              audioRef.current.pause();
              setIsPreviewPlaying(false);
            }
          }, 15000);
        }
      } catch (error) {
        console.log('Audio autoplay prevented - user interaction required');
        // This is normal browser behavior
      }
    }
  };

  const handleStartTour = () => {
    // Go to group size selector first
    onScreenChange();
  };

  return (
    <div className="min-h-screen" style={{backgroundColor: '#e5e3dc'}}>
      {/* Basecamp Style Header - Using theme colors */}
      <div className="relative overflow-hidden bc-primary-bg text-bc-on-dark">
        <div className="absolute inset-0">
          {/* Subtle overlay */}
          <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-black to-transparent opacity-20"></div>
        </div>
        
        <div className="relative px-6 py-20 text-center">
          {/* Logo */}
          <div className="inline-flex items-center justify-center w-20 h-20 mb-8 bg-white bg-opacity-10 rounded-full shadow-lg border-2 border-white border-opacity-20">
            <div className="text-4xl">🗺️</div>
          </div>
          
          <p className="bc-brand-text mb-6">
            Basecamp Presents:
          </p>
          <h1 className="bc-title bc-h1 mb-4" style={{color: '#e5e3dc', fontWeight: '400'}}>
            <span className="bc-underline">Falls Park</span><br />
            <span>Self-Guided Walking Tour</span>
          </h1>
          
          <p className="text-xl text-white mb-6 max-w-lg mx-auto leading-relaxed font-light">
            An immersive journey through Falls Park's natural beauty and rich history.
          </p>
          
          {/* CTA Button */}
          <div className="mb-6">
            <button 
              onClick={handleStartTour}
              className="bc-btn-primary"
            >
              Start Your Walking Tour
            </button>
          </div>
        </div>
      </div>

      {/* Stats Section with proper contrast */}
      <div className="px-6 py-8 bc-card-bg shadow-lg">
        <div className="grid grid-cols-3 gap-6 max-w-md mx-auto">
          <div className="text-center">
            <div className="text-3xl font-black mb-2" style={{color: '#d4967d'}}>7</div>
            <div className="text-xs font-semibold uppercase tracking-wide" style={{color: '#495a58'}}>
              Historic Stops
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-black mb-2" style={{color: '#d4967d'}}>45</div>
            <div className="text-xs font-semibold uppercase tracking-wide" style={{color: '#495a58'}}>
              Minutes
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-black mb-2" style={{color: '#d4967d'}}>1.2</div>
            <div className="text-xs font-semibold uppercase tracking-wide" style={{color: '#495a58'}}>
              Miles
            </div>
          </div>
        </div>
      </div>

      {/* Content Section with proper Basecamp colors */}
      <div className="flex-1 px-6 py-8 space-y-6" style={{backgroundColor: '#e5e3dc'}}>
        
        {/* What Makes Us Different Section */}
        <div className="bc-card-bg rounded-2xl p-8 shadow-xl border" style={{borderColor: '#495a58'}}>
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold mb-4" style={{color: '#303636', fontFamily: 'Anton, sans-serif', fontWeight: '700'}}>
              WHY CHOOSE OUR TOUR?
            </h2>
            <p className="text-lg leading-relaxed" style={{color: '#495a58'}}>
              Unlike other walking tours, we deliver a <strong>premium storytelling experience</strong> that brings Falls Park's rich history to life through professional narration, real-time GPS guidance, and exclusive historical insights.
            </p>
          </div>
          
          {/* Key Differentiators */}
          <div className="grid grid-cols-1 gap-4">
            {[
              { 
                icon: "🎭", 
                title: "Professional Storytelling", 
                description: "Quality narration that transforms historical facts into engaging stories you'll remember" 
              },
              { 
                icon: "🎯", 
                title: "Precision GPS Technology", 
                description: "Audio automatically triggers as you approach each location. No guesswork at all!" 
              },
              { 
                icon: "🏛️", 
                title: "Exclusive Historical Access", 
                description: "Hear untold stories from Greenville's mill town era to modern renaissance" 
              },
              { 
                icon: "⚡", 
                title: "Smart & Self-Paced", 
                description: "Take the full 45-minute experience or customize your journey. Pause anytime, revisit stops, and explore at your own pace!" 
              }
            ].map((feature, index) => (
              <div key={index} className="flex items-start p-4 rounded-xl border" style={{backgroundColor: '#e5e3dc', borderColor: '#d4967d'}}>
                <div className="text-3xl mr-4 flex-shrink-0">{feature.icon}</div>
                <div>
                  <h3 className="font-bold text-lg mb-1" style={{color: '#303636'}}>{feature.title}</h3>
                  <p className="text-sm leading-relaxed" style={{color: '#495a58'}}>{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 p-4 rounded-xl text-center" style={{backgroundColor: '#d4967d', color: '#ffffff'}}>
            <p className="font-medium">
              🚀 Experience Falls Park's remarkable story.
            </p>
          </div>
        </div>
        
        {/* Audio Preview Card */}
        <div className="bc-card-bg rounded-2xl p-8 shadow-xl border" style={{borderColor: '#495a58'}}>
          <div className="flex items-center mb-6">
            <div className="w-16 h-16 rounded-xl flex items-center justify-center shadow-lg" style={{backgroundColor: '#d4967d'}}>
              <div className="text-2xl text-white">🎧</div>
            </div>
            <div className="ml-4">
              <h3 className="text-2xl font-bold" style={{color: '#303636'}}>Audio Preview</h3>
              <p className="font-medium" style={{color: '#495a58'}}>Experience Premium Quality</p>
            </div>
          </div>
          
          <p className="text-lg leading-relaxed mb-6" style={{color: '#495a58'}}>
            Listen to our professionally narrated sample from Liberty Bridge and discover the exceptional quality of our immersive storytelling experience.
          </p>
          
          <button 
            onClick={handlePreviewPlay}
            className="bc-btn-primary w-full"
          >
            <div className="flex items-center justify-center">
              <span className="mr-3 text-2xl">
                {isPreviewPlaying ? '⏸️' : '▶️'}
              </span>
              {isPreviewPlaying ? 'Pause Premium Preview' : 'Play Premium Preview'}
            </div>
          </button>
          
          {showPreview && (
            <div className="mt-6 p-6 rounded-xl border" style={{backgroundColor: '#e5e3dc', borderColor: '#d4967d'}}>
              <div className="flex items-center mb-3">
                <div className="w-3 h-3 rounded-full mr-3" style={{backgroundColor: '#d4967d'}}></div>
                <h4 className="font-bold text-lg" style={{color: '#303636'}}>
                  "{previewStop.title}"
                </h4>
              </div>
              <p className="leading-relaxed mb-4" style={{color: '#495a58'}}>
                {previewStop.description}
              </p>
            </div>
          )}
        </div>

        {/* Start Tour Card */}
        <div className="bc-card-bg rounded-2xl p-8 shadow-xl border" style={{borderColor: '#495a58'}}>
          <div className="flex items-center mb-6">
            <div className="w-16 h-16 rounded-xl flex items-center justify-center shadow-lg" style={{backgroundColor: '#495a58'}}>
              <div className="text-2xl text-white">🚀</div>
            </div>
            <div className="ml-4">
              <h3 className="text-2xl font-bold" style={{color: '#303636'}}>Begin Your Journey</h3>
              <p className="font-medium" style={{color: '#495a58'}}>Professional Historical Experience</p>
            </div>
          </div>
          
          {/* Feature List */}
          <div className="grid grid-cols-1 gap-4 mb-8">
            {[
              { icon: "📍", title: "7 GPS-Triggered Stops", subtitle: "Automatic audio activation" },
              { icon: "🎙️", title: "Professional Narration", subtitle: "3-5 minutes per location" },
              { icon: "⏱️", title: "Self-Paced Experience", subtitle: "~45 minutes total journey" }
            ].map((feature, index) => (
              <div key={index} className="flex items-center p-4 rounded-xl border" style={{backgroundColor: '#e5e3dc', borderColor: '#d4967d'}}>
                <div className="text-2xl mr-4">{feature.icon}</div>
                <div>
                  <div className="font-semibold" style={{color: '#303636'}}>{feature.title}</div>
                  <div className="text-sm" style={{color: '#495a58'}}>{feature.subtitle}</div>
                </div>
              </div>
            ))}
          </div>
          
          <button 
            onClick={handleStartTour}
            className="bc-btn-primary w-full text-lg"
          >
            <div className="flex items-center justify-center">
              <span className="mr-3 text-2xl">🎧</span>
              Start Premium Experience
            </div>
          </button>
        </div>
      </div>

      {/* Contact Section */}
      <div className="px-6 py-8 bg-white border-t-2" style={{borderColor: '#d4967d'}}>
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-6 rounded-full" style={{backgroundColor: '#d4967d'}}>
            <div className="text-2xl text-white">📧</div>
          </div>
          <h3 className="text-2xl font-bold mb-4" style={{color: '#303636'}}>
            Questions, Comments, or Suggestions?
          </h3>
          <p className="text-lg mb-6" style={{color: '#495a58'}}>
            We'd love to hear from you! Send us your feedback, reviews, or any questions about the tour experience.
          </p>
          <div className="bg-white p-6 rounded-2xl border-2 shadow-lg" style={{borderColor: '#d4967d'}}>
            <p className="text-sm font-medium mb-2" style={{color: '#495a58'}}>
              Contact us at:
            </p>
            <a 
              href="mailto:services@basecampdataanalytics.com"
              className="text-2xl font-bold hover:underline transition-all duration-200"
              style={{color: '#d4967d'}}
            >
              services@basecampdataanalytics.com
            </a>
            <p className="text-sm mt-3" style={{color: '#495a58'}}>
              We typically respond within 24 hours
            </p>
          </div>
        </div>
      </div>

      {/* Footer with Basecamp colors */}
      <div className="bc-muted-bg text-white py-8 px-6">
        <div className="text-center">
          <p className="text-white font-medium mb-2">
            Powered by Basecamp Data Analytics
          </p>
          <p className="text-sm" style={{color: '#d4967d'}}>
            Start at Liberty Bridge • Self-paced experience • Premium quality audio
          </p>
        </div>
      </div>

      {/* Hidden Audio Element for Preview */}
      <audio
        ref={audioRef}
        src={previewStop.audio_url}
        onEnded={() => {
          setIsPreviewPlaying(false);
          if (previewTimeoutRef.current) {
            clearTimeout(previewTimeoutRef.current);
          }
        }}
        onPause={() => {
          setIsPreviewPlaying(false);
          if (previewTimeoutRef.current) {
            clearTimeout(previewTimeoutRef.current);
          }
        }}
        preload="metadata"
      />
    </div>
  );
}

export default WelcomeScreen;