import { useState } from 'react';
import { useOffline } from '../hooks/useOffline.js';

function OfflineDownload({ tourData, onClose }) {
  const { isOnline, isDownloading, downloadProgress, downloadTourForOffline } = useOffline();
  const [downloadStarted, setDownloadStarted] = useState(false);
  const [downloadComplete, setDownloadComplete] = useState(false);
  const [error, setError] = useState(null);

  const handleDownload = async () => {
    setDownloadStarted(true);
    setError(null);
    
    try {
      await downloadTourForOffline(tourData);
      setDownloadComplete(true);
    } catch (err) {
      setError(err.message);
      console.error('Download error:', err);
    }
  };

  const estimatedSize = tourData?.stops?.length * 3 || 30; // Rough estimate: 3MB per stop

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Offline Download
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600"
            disabled={isDownloading}
          >
            ✕
          </button>
        </div>

        {!downloadStarted && (
          <>
            {/* Benefits */}
            <div className="mb-6">
              <h3 className="font-medium text-gray-900 mb-3">
                Why download for offline use?
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  Works without internet connection
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  Faster audio loading
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  Saves mobile data during tour
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  Better GPS performance
                </li>
              </ul>
            </div>

            {/* Size and Requirements */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <div className="flex-shrink-0 text-blue-400">
                  ℹ️
                </div>
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-blue-800">
                    Download Details
                  </h4>
                  <p className="mt-1 text-sm text-blue-600">
                    Estimated size: ~{estimatedSize}MB<br/>
                    Includes: Audio files for all {tourData?.stops?.length || 10} stops
                  </p>
                  {!isOnline && (
                    <p className="mt-2 text-sm text-orange-600 font-medium">
                      ⚠️ You're currently offline. Download will start when connection is restored.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleDownload}
                disabled={!isOnline}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {!isOnline ? 'Waiting for Connection...' : 'Download for Offline Use'}
              </button>
              
              <button
                onClick={onClose}
                className="btn-secondary"
              >
                Skip for Now
              </button>
            </div>
          </>
        )}

        {downloadStarted && !downloadComplete && (
          <div className="text-center">
            {/* Progress */}
            <div className="mb-4">
              <div className="w-16 h-16 mx-auto mb-4 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Downloading Content
              </h3>
              <p className="text-sm text-gray-600">
                Please keep this page open while we download your tour content
              </p>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Progress</span>
                <span>{Math.round(downloadProgress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${downloadProgress}%` }}
                ></div>
              </div>
            </div>

            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 text-sm">{error}</p>
                <button
                  onClick={handleDownload}
                  className="mt-2 text-red-600 text-sm font-medium hover:underline"
                >
                  Try Again
                </button>
              </div>
            )}
          </div>
        )}

        {downloadComplete && (
          <div className="text-center">
            {/* Success */}
            <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">✓</span>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Download Complete!
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Your tour is now available offline. You can enjoy the experience even without an internet connection.
            </p>
            
            <button
              onClick={onClose}
              className="btn-primary"
            >
              Start Tour
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default OfflineDownload;