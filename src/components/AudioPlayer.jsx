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
    const updateDuration = () => {
      console.log('📊 Audio metadata loaded. Duration:', audio.duration);
      setDuration(audio.duration);
    };
    const handleEnded = () => {
      setPlaying(false);
      setCurrentTime(0);
      // Auto-close audio player when audio finishes
      console.log('🎵 Audio finished, closing player');
      setTimeout(() => {
        onClose();
      }, 1000); // Brief delay to show completion
    };
    const handleError = (e) => {
      console.error('❌ Audio loading error:', e);
      console.error('Audio error details:', {
        error: audio.error,
        code: audio.error?.code,
        message: audio.error?.message,
        src: audio.src
      });
    };
    const handleLoadStart = () => {
      console.log('📡 Audio loading started from:', audio.src);
    };
    const handleCanPlay = () => {
      console.log('✅ Audio can play (enough data loaded)');
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);
    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('canplay', handleCanPlay);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('canplay', handleCanPlay);
    };
  }, []);

  // Disabled autoplay - focus on manual play button functionality
  // useEffect(() => {
  //   if (isPlaying && audioRef.current && audioUnlocked) {
  //     console.log('🎵 Auto-playing audio for:', stop.title, '(Audio unlocked:', audioUnlocked, ')');
  //     audioRef.current.play()
  //       .then(() => {
  //         setPlaying(true);
  //         console.log('✅ Audio autoplay successful');
  //       })
  //       .catch((error) => {
  //         console.error('❌ Audio autoplay failed despite unlock:', error);
  //         setShowPlayPrompt(true);
  //       });
  //   } else if (isPlaying && !audioUnlocked) {
  //     console.log('⚠️ Geofence triggered but audio not unlocked - user must tap play');
  //     setShowPlayPrompt(true);
  //   }
  // }, [isPlaying, stop.title, audioUnlocked]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) {
      console.error('❌ Audio element not found');
      return;
    }
    
    console.log('🎵 Toggle play button pressed. Current state:', {
      playing,
      audioSrc: audio.src,
      readyState: audio.readyState,
      networkState: audio.networkState
    });
    
    if (playing) {
      console.log('⏸️ Pausing audio');
      audio.pause();
      setPlaying(false);
    } else {
      console.log('▶️ Attempting to play audio from:', audio.src);
      audio.play()
        .then(() => {
          console.log('✅ Audio play successful');
          setPlaying(true);
        })
        .catch((error) => {
          console.error('❌ Audio play failed:', error);
          console.error('Audio element state:', {
            src: audio.src,
            readyState: audio.readyState,
            networkState: audio.networkState,
            error: audio.error
          });
        });
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
            {/* Images Section */}
            {stop.image_urls && stop.image_urls.length > 0 && (
              <div style={{
                marginBottom: '32px'
              }}>
                <h4 style={{
                  fontSize: '20px',
                  fontWeight: 'bold',
                  color: '#111827',
                  marginBottom: '24px',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <span style={{marginRight: '12px'}}>📸</span>
                  Historical Gallery
                </h4>
                
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px'
                }}>
                  {stop.image_urls.map((url, index) => (
                    <div key={index} style={{
                      backgroundColor: '#f9fafb',
                      borderRadius: '24px',
                      overflow: 'hidden',
                      border: '1px solid #e5e7eb',
                      aspectRatio: '16/9'
                    }}>
                      <img 
                        src={url}
                        alt={`${stop.title} - Historical Image ${index + 1}`}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.parentElement.innerHTML = `
                            <div style="display: flex; align-items: center; justify-content: center; height: 100%; text-align: center; color: #6b7280;">
                              <div>
                                <div style="font-size: 32px; margin-bottom: 8px;">📷</div>
                                <div style="font-size: 18px; font-weight: 600;">Historical Image ${index + 1}</div>
                                <div style="font-size: 14px; color: #9ca3af;">Loading: ${url.split('/').pop()}</div>
                              </div>
                            </div>
                          `;
                        }}
                      />
                    </div>
                  ))}
                </div>
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
                    background: '#e0e7ff',
                    color: '#4338ca',
                    padding: '8px 16px',
                    borderRadius: '16px',
                    fontWeight: 'bold',
                    fontSize: '14px',
                    display: 'inline-block',
                    marginBottom: '16px'
                  }}>
                    📍 Historical Stop {stop.order} of 10
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