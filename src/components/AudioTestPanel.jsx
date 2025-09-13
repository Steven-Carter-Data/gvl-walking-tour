import { useState, useRef } from 'react';
import tourData from '../data/falls_park_tour_stops.json';

function AudioTestPanel() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [error, setError] = useState(null);
  const audioRef = useRef(null);

  const libertyBridgeStop = tourData.stops[0];

  const handlePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    try {
      setError(null);
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        await audio.play();
        setIsPlaying(true);
      }
    } catch (err) {
      setError(`Audio playback failed: ${err.message}`);
      console.error('Audio error:', err);
    }
  };

  const handleTimeUpdate = () => {
    const audio = audioRef.current;
    if (audio) {
      setCurrentTime(audio.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    const audio = audioRef.current;
    if (audio) {
      setDuration(audio.duration);
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg shadow-lg p-4 max-w-sm z-50">
      <h3 className="font-semibold text-gray-900 mb-3">🎧 Audio Test Panel</h3>
      
      {/* Audio Info */}
      <div className="mb-3 text-sm">
        <div className="font-medium text-gray-800">{libertyBridgeStop.title}</div>
        <div className="text-gray-600">Audio: {libertyBridgeStop.audio_url}</div>
      </div>

      {/* Audio Controls */}
      <div className="space-y-3">
        {/* Play/Pause Button */}
        <button
          onClick={handlePlay}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded font-medium"
        >
          {isPlaying ? '⏸️ Pause' : '▶️ Play'}
        </button>

        {/* Progress */}
        {duration > 0 && (
          <div className="text-sm text-gray-600">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>
        )}

        {/* Volume Control */}
        <div className="space-y-1">
          <label className="text-sm text-gray-600">Volume: {Math.round(volume * 100)}%</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={handleVolumeChange}
            className="w-full"
          />
        </div>

        {/* Error Display */}
        {error && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">
            {error}
          </div>
        )}

        {/* Audio Element Status */}
        <div className="text-xs text-gray-500 space-y-1">
          <div>Status: {isPlaying ? 'Playing' : 'Paused'}</div>
          <div>Ready State: {audioRef.current?.readyState || 'Not loaded'}</div>
          <div>Network State: {audioRef.current?.networkState || 'Unknown'}</div>
        </div>
      </div>

      {/* Hidden Audio Element */}
      <audio
        ref={audioRef}
        src={libertyBridgeStop.audio_url}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onError={(e) => setError(`Audio load error: ${e.target.error?.message || 'Unknown error'}`)}
        onEnded={() => setIsPlaying(false)}
        preload="metadata"
      />
    </div>
  );
}

export default AudioTestPanel;