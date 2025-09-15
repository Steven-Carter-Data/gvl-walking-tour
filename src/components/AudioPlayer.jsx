import { useState, useRef, useEffect } from 'react';

function AudioPlayer({ stop, isPlaying, onClose, audioUnlocked = false }) {
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showPlayPrompt, setShowPlayPrompt] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => {
      setPlaying(false);
      setCurrentTime(0);
      // Auto-close audio player when audio finishes
      setTimeout(() => {
        onClose();
      }, 1000); // Brief delay to show completion
    };
    const handleError = (e) => {
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
  }, [isPlaying, stop.title, audioUnlocked]);

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
      } catch (error) {
        console.error('Audio playback failed:', error.message);
        
        // Try alternative approach
        try {
          audio.currentTime = 0;
          await audio.play();
          setPlaying(true);
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
                style={{
                  width: '56px',
                  height: '56px',
                  background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
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
                  color: '#4f46e5',
                  fontWeight: '600'
                }}>
                  🎧 Premium Audio Experience
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
                  background: '#e0e7ff',
                  color: '#4338ca',
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
          background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.6), rgba(67, 56, 202, 0.4))',
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
                    background: '#e0e7ff',
                    color: '#4338ca',
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
                      background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
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
                      Historic Stop {stop.order}
                    </h2>
                    <p style={{
                      color: '#2563eb',
                      fontWeight: 'bold',
                      fontSize: '18px',
                      margin: 0
                    }}>
                      🎧 Premium Audio Experience
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
            {/* Images Section Removed - Audio-First Launch */}

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
                    background: '#e0e7ff',
                    color: '#4338ca',
                    padding: '8px 16px',
                    borderRadius: '16px',
                    fontWeight: 'bold',
                    fontSize: '14px',
                    display: 'inline-block',
                    marginBottom: '16px'
                  }}>
                    📍 Historical Stop {stop.order} of 8
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
              <div style={{
                textAlign: 'center',
                marginBottom: '32px'
              }}>
                <h4 style={{
                  fontSize: '24px',
                  fontWeight: '900',
                  color: '#111827',
                  marginBottom: '8px',
                  margin: '0 0 8px 0'
                }}>
                  Premium Audio Controls
                </h4>
                <p style={{
                  color: '#6b7280',
                  margin: 0
                }}>Professional Historical Experience</p>
              </div>
              
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
                      color: '#4338ca'
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
                      color: '#7c3aed'
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
                      background: 'linear-gradient(to right, #4f46e5, #7c3aed)',
                      borderRadius: '8px',
                      width: `${progressPercent}%`,
                      transition: 'width 0.3s'
                    }}
                  ></div>
                </div>
              </div>

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
                  style={{
                    padding: '16px',
                    background: '#f9fafb',
                    borderRadius: '16px',
                    border: '1px solid #e5e7eb',
                    cursor: 'pointer',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    color: '#4f46e5'
                  }}
                >
                  ⏪ 15s
                </button>
                
                <button
                  onClick={togglePlay}
                  style={{
                    width: '80px',
                    height: '80px',
                    background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                    color: 'white',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '28px'
                  }}
                >
                  {playing ? '⏸️' : '▶️'}
                </button>
                
                <button
                  onClick={skipForward}
                  style={{
                    padding: '16px',
                    background: '#f9fafb',
                    borderRadius: '16px',
                    border: '1px solid #e5e7eb',
                    cursor: 'pointer',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    color: '#4f46e5'
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
                    background: '#e0e7ff',
                    color: '#4338ca',
                    fontWeight: 'bold',
                    borderRadius: '12px',
                    border: '1px solid #a5b4fc',
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
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '16px'
              }}>
                {/* Image 1 */}
                <div style={{
                  borderRadius: '16px',
                  overflow: 'hidden',
                  border: '1px solid #e5e7eb'
                }}>
                  <img
                    src={`/images/stops/${stop.id}_1.jpg`}
                    alt={`${stop.title} - Historical Image 1`}
                    style={{
                      width: '100%',
                      height: '200px',
                      objectFit: 'cover'
                    }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>

                {/* Image 2 */}
                <div style={{
                  borderRadius: '16px',
                  overflow: 'hidden',
                  border: '1px solid #e5e7eb'
                }}>
                  <img
                    src={`/images/stops/${stop.id}_2.jpg`}
                    alt={`${stop.title} - Historical Image 2`}
                    style={{
                      width: '100%',
                      height: '200px',
                      objectFit: 'cover'
                    }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>

                {/* Image 3 */}
                <div style={{
                  borderRadius: '16px',
                  overflow: 'hidden',
                  border: '1px solid #e5e7eb'
                }}>
                  <img
                    src={`/images/stops/${stop.id}_3.jpg`}
                    alt={`${stop.title} - Historical Image 3`}
                    style={{
                      width: '100%',
                      height: '200px',
                      objectFit: 'cover'
                    }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Hidden Audio Element */}
          <audio
            ref={audioRef}
            src={stop.audio_url}
            preload="metadata"
          />
        </div>
      </div>
    </div>
  );
}

export default AudioPlayer;