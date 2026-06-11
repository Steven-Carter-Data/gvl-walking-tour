import { useState, useRef, useEffect } from 'react';
import tourConfig from '../config/tourConfig.js';
import { getSignedAudioUrl, isFreeAudio } from '../utils/audioAccess.js';

function AudioPlayer({ stop, isPlaying, onClose, audioUnlocked = false, nextStop = null, tourPurchased = true, onPlayNext, onUnlock }) {
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showPlayPrompt, setShowPlayPrompt] = useState(false);
  const [showNextUp, setShowNextUp] = useState(false);
  const [showSources, setShowSources] = useState(false);
  const [sourcesText, setSourcesText] = useState('');
  const audioRef = useRef(null);
  const totalStops = tourConfig.stats.stops;
  // Paid audio needs a signed URL (free files resolve synchronously)
  const [audioSrc, setAudioSrc] = useState(() =>
    isFreeAudio(stop.audio_url) ? stop.audio_url : null
  );

  // Reset the "up next" card when a new stop starts playing
  useEffect(() => {
    setShowNextUp(false);
  }, [stop.id]);

  // Resolve the (possibly signed) audio URL whenever the stop changes
  useEffect(() => {
    let cancelled = false;
    if (isFreeAudio(stop.audio_url)) {
      setAudioSrc(stop.audio_url);
      return;
    }
    setAudioSrc(null);
    getSignedAudioUrl(stop.audio_url).then((url) => {
      if (!cancelled) setAudioSrc(url);
    });
    return () => { cancelled = true; };
  }, [stop.audio_url]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => {
      setPlaying(false);
      setCurrentTime(0);
      // Guide the listener onward instead of dropping them back on the map
      setIsMinimized(false);
      setShowNextUp(true);
    };
    const handleError = () => {
      console.error('Audio loading error:', audio.error?.message || 'Unknown error');
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, []);

  // Autoplay when geofence triggered and audio is unlocked
  useEffect(() => {
    if (!audioSrc) return; // wait for the signed URL to resolve
    if (isPlaying && audioRef.current && audioUnlocked) {
      const audio = audioRef.current;
      
      const attemptAutoplay = async () => {
        try {
          // Force load if not ready
          if (audio.readyState < 2) {
            audio.load();
            await new Promise((resolve, reject) => {
              const timeout = setTimeout(() => reject(new Error('Autoplay timeout')), 5000);
              const handleReady = () => {
                clearTimeout(timeout);
                audio.removeEventListener('canplay', handleReady);
                audio.removeEventListener('error', handleError);
                resolve();
              };
              const handleError = (e) => {
                clearTimeout(timeout);
                audio.removeEventListener('canplay', handleReady);
                audio.removeEventListener('error', handleError);
                reject(e);
              };
              
              if (audio.readyState >= 2) {
                clearTimeout(timeout);
                resolve();
                return;
              }
              
              audio.addEventListener('canplay', handleReady);
              audio.addEventListener('error', handleError);
            });
          }
          
          await audio.play();
          setPlaying(true);
        } catch (error) {
          console.error('Autoplay failed:', error.message);
          setShowPlayPrompt(true);
        }
      };
      
      attemptAutoplay();
    } else if (isPlaying && !audioUnlocked) {
      setShowPlayPrompt(true);
    }
  }, [isPlaying, stop.title, audioUnlocked, audioSrc]);

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      try {
        // Force load if not ready
        if (audio.readyState < 2) {
          await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => reject(new Error('Load timeout')), 5000);
            const handleLoad = () => {
              clearTimeout(timeout);
              audio.removeEventListener('canplay', handleLoad);
              audio.removeEventListener('error', handleError);
              resolve();
            };
            const handleError = (e) => {
              clearTimeout(timeout);
              audio.removeEventListener('canplay', handleLoad);
              audio.removeEventListener('error', handleError);
              reject(e);
            };
            
            if (audio.readyState >= 2) {
              clearTimeout(timeout);
              resolve();
              return;
            }
            
            audio.addEventListener('canplay', handleLoad);
            audio.addEventListener('error', handleError);
            audio.load();
          });
        }
        
        await audio.play();
        setPlaying(true);
        setShowPlayPrompt(false);
      } catch (error) {
        console.error('Audio playback failed:', error.message);

        // Try alternative approach
        try {
          audio.currentTime = 0;
          await audio.play();
          setPlaying(true);
          setShowPlayPrompt(false);
        } catch (altError) {
          console.error('Alternative playback failed:', altError.message);
        }
      }
    }
  };

  const skipForward = () => {
    const audio = audioRef.current;
    audio.currentTime = Math.min(audio.currentTime + 15, audio.duration);
  };

  const skipBackward = () => {
    const audio = audioRef.current;
    audio.currentTime = Math.max(audio.currentTime - 15, 0);
  };

  const handleSeek = (e) => {
    const audio = audioRef.current;
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    audio.currentTime = percent * audio.duration;
  };

  const handleSpeedChange = () => {
    const speeds = [1, 1.25, 1.5, 2];
    const currentIndex = speeds.indexOf(playbackRate);
    const nextIndex = (currentIndex + 1) % speeds.length;
    const newRate = speeds[nextIndex];
    
    setPlaybackRate(newRate);
    audioRef.current.playbackRate = newRate;
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const loadSources = async () => {
    try {
      const response = await fetch('/references/tour_sources.txt');
      if (response.ok) {
        const text = await response.text();
        setSourcesText(text);
        setShowSources(true);
      } else {
        setSourcesText('Sources document not found.');
        setShowSources(true);
      }
    } catch (error) {
      console.error('Error loading sources:', error);
      setSourcesText('Unable to load sources at this time.');
      setShowSources(true);
    }
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  if (isMinimized) {
    return (
      <div style={{
        position: 'fixed',
        bottom: '24px',
        left: '24px',
        right: '24px',
        zIndex: 50
      }}>
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(12px)',
          borderRadius: '24px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.5)',
          padding: '20px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              flex: '1',
              gap: '16px'
            }}>
              <button
                onClick={togglePlay}
                aria-label={playing ? 'Pause narration' : 'Play narration'}
                style={{
                  width: '56px',
                  height: '56px',
                  background: 'linear-gradient(135deg, #d4967d, #b87a5e)',
                  color: 'white',
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '20px'
                }}
              >
                {playing ? '⏸️' : '▶️'}
              </button>
              
              <div style={{ flex: '1' }}>
                <div style={{
                  fontSize: '16px',
                  fontWeight: 'bold',
                  color: '#111827',
                  marginBottom: '4px'
                }}>
                  {stop.title}
                </div>
                <div style={{
                  fontSize: '14px',
                  color: '#495a58',
                  fontWeight: '600'
                }}>
                  🎧 {tourConfig.shortName}
                </div>
              </div>
            </div>
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <button
                onClick={() => setIsMinimized(false)}
                style={{
                  padding: '12px',
                  background: '#e5e3dc',
                  color: '#495a58',
                  borderRadius: '16px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '18px'
                }}
              >
                ⬆️
              </button>
              <button
                onClick={onClose}
                style={{
                  padding: '12px',
                  background: '#fecaca',
                  color: '#dc2626',
                  borderRadius: '16px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '18px'
                }}
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 50
    }}>
      {/* Backdrop - click to close */}
      <div 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.6), rgba(73, 90, 88, 0.5))',
          backdropFilter: 'blur(12px)',
          cursor: 'pointer'
        }}
        onClick={onClose}
        title="Tap to close audio player"
      ></div>
      
      {/* Main container */}
      <div style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'flex-end'
      }}>
        <div 
          style={{
            width: '100%',
            backgroundColor: 'white',
            borderRadius: '48px 48px 0 0',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div style={{
            position: 'sticky',
            top: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(12px)',
            padding: '24px',
            borderRadius: '48px 48px 0 0',
            borderBottom: '1px solid #f3f4f6'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px'
              }}>
                <button
                  onClick={() => setIsMinimized(true)}
                  style={{
                    padding: '12px',
                    background: '#e5e3dc',
                    color: '#495a58',
                    borderRadius: '16px',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '18px'
                  }}
                  title="Minimize player"
                >
                  ⬇️
                </button>
                <button
                  onClick={onClose}
                  style={{
                    padding: '12px',
                    background: '#fecaca',
                    color: '#dc2626',
                    borderRadius: '16px',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '18px',
                    fontWeight: 'bold'
                  }}
                  title="Close audio player"
                >
                  ✕
                </button>
                
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px'
                }}>
                  <div style={{
                    position: 'relative'
                  }}>
                    <div style={{
                      width: '64px',
                      height: '64px',
                      background: 'linear-gradient(135deg, #d4967d, #b87a5e)',
                      borderRadius: '24px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '24px',
                      color: 'white'
                    }}>
                      🏛️
                    </div>
                    <div style={{
                      position: 'absolute',
                      top: '-4px',
                      right: '-4px',
                      width: '24px',
                      height: '24px',
                      background: '#10b981',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      color: 'white',
                      fontWeight: 'bold'
                    }}>
                      {stop.order}
                    </div>
                  </div>
                  
                  <div>
                    <h2 style={{
                      fontSize: '24px',
                      fontWeight: '900',
                      color: '#111827',
                      margin: '0 0 4px 0'
                    }}>
                      Stop {stop.order} of {totalStops}
                    </h2>
                    <p style={{
                      color: '#495a58',
                      fontWeight: 'bold',
                      fontSize: '18px',
                      margin: 0
                    }}>
                      🎧 {tourConfig.shortName}
                    </p>
                  </div>
                </div>
              </div>
              
              <button
                onClick={onClose}
                style={{
                  padding: '12px',
                  background: '#fecaca',
                  color: '#dc2626',
                  borderRadius: '16px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '18px'
                }}
              >
                ✕
              </button>
            </div>
          </div>

          {/* Content */}
          <div style={{
            padding: '32px'
          }}>
            {/* Up Next / Unlock card - shown when narration finishes */}
            {showNextUp && (
              <div style={{
                backgroundColor: '#ffffff',
                borderRadius: '24px',
                padding: '24px',
                marginBottom: '32px',
                border: '2px solid #d4967d',
                boxShadow: '0 4px 12px rgba(212, 150, 125, 0.25)',
                textAlign: 'center'
              }}>
                {!tourPurchased ? (
                  <>
                    <div style={{ fontSize: '36px', marginBottom: '8px' }}>🎁</div>
                    <h4 style={{
                      fontSize: '20px',
                      fontWeight: '900',
                      color: '#303636',
                      margin: '0 0 8px 0'
                    }}>
                      Enjoyed your free story?
                    </h4>
                    <p style={{
                      color: '#495a58',
                      fontSize: '15px',
                      margin: '0 0 16px 0',
                      lineHeight: 1.5
                    }}>
                      There are {totalStops - 1} more stories like this waiting along the route,
                      and you pick the price.
                    </p>
                    <button
                      onClick={() => onUnlock && onUnlock()}
                      style={{
                        backgroundColor: '#d4967d',
                        color: 'white',
                        border: 'none',
                        padding: '14px 24px',
                        borderRadius: '12px',
                        fontSize: '16px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        width: '100%'
                      }}
                    >
                      Unlock All {totalStops} Stops
                    </button>
                  </>
                ) : nextStop ? (
                  <>
                    <div style={{ fontSize: '36px', marginBottom: '8px' }}>🚶</div>
                    <h4 style={{
                      fontSize: '20px',
                      fontWeight: '900',
                      color: '#303636',
                      margin: '0 0 8px 0'
                    }}>
                      Up next: {nextStop.title}
                    </h4>
                    <p style={{
                      color: '#495a58',
                      fontSize: '15px',
                      margin: '0 0 16px 0',
                      lineHeight: 1.5
                    }}>
                      Head to Stop {nextStop.order} on the map. The story starts
                      automatically when you arrive.
                    </p>
                    <button
                      onClick={onClose}
                      style={{
                        backgroundColor: '#d4967d',
                        color: 'white',
                        border: 'none',
                        padding: '14px 24px',
                        borderRadius: '12px',
                        fontSize: '16px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        width: '100%',
                        marginBottom: '8px'
                      }}
                    >
                      Show Me the Way
                    </button>
                    <button
                      onClick={() => onPlayNext && onPlayNext(nextStop)}
                      style={{
                        backgroundColor: 'transparent',
                        color: '#495a58',
                        border: 'none',
                        padding: '8px',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        textDecoration: 'underline',
                        width: '100%'
                      }}
                    >
                      Already there? Play it now
                    </button>
                  </>
                ) : (
                  <>
                    <div style={{ fontSize: '36px', marginBottom: '8px' }}>🎉</div>
                    <h4 style={{
                      fontSize: '20px',
                      fontWeight: '900',
                      color: '#303636',
                      margin: '0 0 8px 0'
                    }}>
                      That's the final stop. You did it!
                    </h4>
                    <p style={{
                      color: '#495a58',
                      fontSize: '15px',
                      margin: '0 0 16px 0',
                      lineHeight: 1.5
                    }}>
                      {totalStops} stories, {tourConfig.stats.distance} miles of Greenville history.
                      Thanks for walking with us.
                    </p>
                    <button
                      onClick={onClose}
                      style={{
                        backgroundColor: '#d4967d',
                        color: 'white',
                        border: 'none',
                        padding: '14px 24px',
                        borderRadius: '12px',
                        fontSize: '16px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        width: '100%'
                      }}
                    >
                      Back to the Map
                    </button>
                  </>
                )}
              </div>
            )}

            {/* Stop Info */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '24px',
              padding: '32px',
              marginBottom: '32px',
              border: '1px solid #f3f4f6',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                marginBottom: '16px'
              }}>
                <div style={{
                  width: '16px',
                  height: '16px',
                  background: '#10b981',
                  borderRadius: '50%',
                  marginRight: '16px',
                  marginTop: '8px'
                }}></div>
                
                <div style={{ flex: '1' }}>
                  <h3 style={{
                    fontSize: '30px',
                    fontWeight: '900',
                    color: '#111827',
                    marginBottom: '12px',
                    margin: '0 0 12px 0'
                  }}>
                    {stop.title}
                  </h3>
                  
                  <span style={{
                    background: '#e5e3dc',
                    color: '#495a58',
                    padding: '8px 16px',
                    borderRadius: '16px',
                    fontWeight: 'bold',
                    fontSize: '14px',
                    display: 'inline-block',
                    marginBottom: '16px'
                  }}>
                    📍 Stop {stop.order} of {totalStops}
                  </span>
                  
                  <p style={{
                    color: '#374151',
                    lineHeight: 1.6,
                    fontSize: '18px',
                    margin: '16px 0 0 0'
                  }}>
                    {stop.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Audio Controls */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '24px',
              padding: '32px',
              border: '1px solid #f3f4f6',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}>
              {/* Progress Section */}
              <div style={{
                marginBottom: '32px'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '16px'
                }}>
                  <div>
                    <div style={{
                      fontSize: '24px',
                      fontWeight: '900',
                      color: '#495a58'
                    }}>{formatTime(currentTime)}</div>
                    <div style={{
                      fontSize: '12px',
                      color: '#6b7280',
                      textTransform: 'uppercase'
                    }}>Current</div>
                  </div>
                  
                  <div style={{ textAlign: 'center' }}>
                    <div style={{
                      fontSize: '18px',
                      fontWeight: 'bold',
                      color: '#374151'
                    }}>Audio Progress</div>
                    <div style={{
                      fontSize: '14px',
                      color: '#6b7280'
                    }}>{Math.round(progressPercent)}% Complete</div>
                  </div>
                  
                  <div style={{ textAlign: 'right' }}>
                    <div style={{
                      fontSize: '24px',
                      fontWeight: '900',
                      color: '#d4967d'
                    }}>{formatTime(duration)}</div>
                    <div style={{
                      fontSize: '12px',
                      color: '#6b7280',
                      textTransform: 'uppercase'
                    }}>Total</div>
                  </div>
                </div>
                
                <div 
                  style={{
                    width: '100%',
                    height: '16px',
                    background: '#f3f4f6',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    overflow: 'hidden'
                  }}
                  onClick={handleSeek}
                >
                  <div 
                    style={{
                      height: '16px',
                      background: 'linear-gradient(to right, #d4967d, #b87a5e)',
                      borderRadius: '8px',
                      width: `${progressPercent}%`,
                      transition: 'width 0.3s'
                    }}
                  ></div>
                </div>
              </div>

              {/* Tap-to-play prompt when the browser blocked autoplay */}
              {showPlayPrompt && !playing && (
                <div style={{
                  background: '#fef3c7',
                  border: '1px solid #f59e0b',
                  borderRadius: '12px',
                  padding: '12px 16px',
                  marginBottom: '16px',
                  textAlign: 'center',
                  color: '#92400e',
                  fontSize: '14px',
                  fontWeight: '600'
                }}>
                  Tap the play button below to start the narration
                </div>
              )}

              {/* Control Buttons */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '24px',
                marginBottom: '32px'
              }}>
                <button
                  onClick={skipBackward}
                  aria-label="Skip back 15 seconds"
                  style={{
                    padding: '16px',
                    background: '#f9fafb',
                    borderRadius: '16px',
                    border: '1px solid #e5e7eb',
                    cursor: 'pointer',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    color: '#495a58'
                  }}
                >
                  ⏪ 15s
                </button>

                <button
                  onClick={togglePlay}
                  aria-label={playing ? 'Pause narration' : 'Play narration'}
                  style={{
                    width: '80px',
                    height: '80px',
                    background: 'linear-gradient(135deg, #d4967d, #b87a5e)',
                    color: 'white',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '28px',
                    boxShadow: showPlayPrompt && !playing ? '0 0 0 4px #fcd34d' : 'none'
                  }}
                >
                  {playing ? '⏸️' : '▶️'}
                </button>

                <button
                  onClick={skipForward}
                  aria-label="Skip forward 15 seconds"
                  style={{
                    padding: '16px',
                    background: '#f9fafb',
                    borderRadius: '16px',
                    border: '1px solid #e5e7eb',
                    cursor: 'pointer',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    color: '#495a58'
                  }}
                >
                  15s ⏩
                </button>
              </div>

              {/* Speed Control */}
              <div style={{
                textAlign: 'center'
              }}>
                <span style={{
                  color: '#6b7280',
                  marginRight: '12px'
                }}>Playback Speed:</span>
                <button
                  onClick={handleSpeedChange}
                  style={{
                    padding: '12px 24px',
                    background: '#e5e3dc',
                    color: '#495a58',
                    fontWeight: 'bold',
                    borderRadius: '12px',
                    border: '1px solid #d4967d',
                    cursor: 'pointer',
                    fontSize: '16px'
                  }}
                >
                  {playbackRate}x
                </button>
              </div>
            </div>

            {/* Stop Images */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '24px',
              padding: '32px',
              marginTop: '32px',
              border: '1px solid #f3f4f6',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}>
              <div style={{
                textAlign: 'center',
                marginBottom: '24px'
              }}>
                <h4 style={{
                  fontSize: '24px',
                  fontWeight: '900',
                  color: '#111827',
                  marginBottom: '8px',
                  margin: '0 0 8px 0'
                }}>
                  Historical Images
                </h4>
                <p style={{
                  color: '#6b7280',
                  margin: 0
                }}>Visual references for this stop</p>
              </div>

              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '20px'
              }}>
                {/* Image 1 */}
                <div style={{
                  borderRadius: '16px',
                  overflow: 'hidden',
                  border: '1px solid #e5e7eb',
                  backgroundColor: '#f9fafb'
                }}>
                  <img
                    src={`/images/stops/${stop.id}_1.jpg`}
                    alt={`${stop.title} - Historical Image 1`}
                    style={{
                      width: '100%',
                      height: 'auto',
                      display: 'block',
                      maxHeight: '400px',
                      objectFit: 'contain'
                    }}
                    onError={(e) => {
                      e.target.parentElement.style.display = 'none';
                    }}
                  />
                </div>

                {/* Image 2 */}
                <div style={{
                  borderRadius: '16px',
                  overflow: 'hidden',
                  border: '1px solid #e5e7eb',
                  backgroundColor: '#f9fafb'
                }}>
                  <img
                    src={`/images/stops/${stop.id}_2.jpg`}
                    alt={`${stop.title} - Historical Image 2`}
                    style={{
                      width: '100%',
                      height: 'auto',
                      display: 'block',
                      maxHeight: '400px',
                      objectFit: 'contain'
                    }}
                    onError={(e) => {
                      e.target.parentElement.style.display = 'none';
                    }}
                  />
                </div>
              </div>

              {/* Sources Link */}
              <div style={{
                textAlign: 'center',
                marginTop: '24px',
                paddingTop: '20px',
                borderTop: '1px solid #e5e7eb'
              }}>
                <button
                  onClick={loadSources}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#6b7280',
                    fontSize: '14px',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    transition: 'color 0.2s'
                  }}
                  onMouseEnter={(e) => e.target.style.color = '#374151'}
                  onMouseLeave={(e) => e.target.style.color = '#6b7280'}
                  title="View sources and references for this tour"
                >
                  📚 Sources & References
                </button>
              </div>
            </div>
          </div>

          {/* Sources Modal */}
          {showSources && (
            <div style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              zIndex: 60,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px'
            }}>
              <div style={{
                backgroundColor: 'white',
                borderRadius: '16px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                maxWidth: '600px',
                maxHeight: '80vh',
                overflow: 'hidden',
                position: 'relative',
                width: '90vw'
              }}>
                {/* Header */}
                <div style={{
                  padding: '24px',
                  borderBottom: '1px solid #e5e7eb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div>
                    <h3 style={{
                      margin: 0,
                      fontSize: '20px',
                      fontWeight: '700',
                      color: '#111827'
                    }}>Sources & References</h3>
                    <p style={{
                      margin: '4px 0 0 0',
                      fontSize: '14px',
                      color: '#6b7280'
                    }}>Historical sources used in this tour</p>
                  </div>
                  <button
                    onClick={() => setShowSources(false)}
                    style={{
                      background: 'none',
                      border: 'none',
                      fontSize: '24px',
                      cursor: 'pointer',
                      color: '#6b7280',
                      padding: '4px',
                      borderRadius: '8px'
                    }}
                    title="Close"
                  >
                    ✕
                  </button>
                </div>

                {/* Content */}
                <div style={{
                  padding: '24px',
                  maxHeight: '60vh',
                  overflowY: 'auto'
                }}>
                  <pre style={{
                    whiteSpace: 'pre-wrap',
                    wordWrap: 'break-word',
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                    fontSize: '14px',
                    lineHeight: '1.6',
                    color: '#374151',
                    margin: 0
                  }}>
                    {sourcesText}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {/* Hidden Audio Element */}
          <audio
            ref={audioRef}
            src={audioSrc || undefined}
            preload="metadata"
          />
        </div>
      </div>
    </div>
  );
}

export default AudioPlayer;