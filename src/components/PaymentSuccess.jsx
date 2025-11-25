import { useState, useEffect } from 'react';
import { verifyPayment } from '../utils/stripe.js';
import { audioPreloader } from '../utils/audioPreloader.js';
import { ga4 } from '../services/analytics.js';
import ShareButtons from './ShareButtons.jsx';
import tourData from '../data/falls_park_tour_stops.json';

function PaymentSuccess() {
  const [paymentStatus, setPaymentStatus] = useState('verifying');
  const [sessionDetails, setSessionDetails] = useState(null);
  const [downloadStatus, setDownloadStatus] = useState('idle'); // idle, downloading, completed, error
  const [downloadProgress, setDownloadProgress] = useState(0);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');
    
    if (sessionId) {
      verifyPayment(sessionId).then(result => {
        if (result.success) {
          setPaymentStatus('success');
          setSessionDetails(result.session);
          // Store successful payment in localStorage
          localStorage.setItem('tour_access', 'granted');
          localStorage.setItem('payment_session', JSON.stringify(result.session));
          // Track purchase in GA4
          ga4.purchase(sessionId, result.session?.amount_total / 100 || 8);
        } else {
          setPaymentStatus('failed');
        }
      }).catch(error => {
        console.error('Payment verification error:', error);
        setPaymentStatus('failed');
      });
    } else {
      setPaymentStatus('failed');
    }
  }, []);

  const handleStartTour = () => {
    // Navigate to the tour interface - update URL to trigger tour mode
    window.location.href = '/?tour=true';
  };

  const handleDownloadOffline = async () => {
    if (downloadStatus === 'downloading') return;

    setDownloadStatus('downloading');
    setDownloadProgress(0);

    // Get all audio URLs from tour data
    const audioUrls = tourData.stops.map(stop => stop.audio_url);

    try {
      const result = await audioPreloader.preloadAudioFiles(
        audioUrls,
        (progress, loaded, total) => {
          setDownloadProgress(progress);
        }
      );

      if (result.success) {
        setDownloadStatus('completed');
        // Store in localStorage that content is downloaded
        localStorage.setItem('tour_content_downloaded', 'true');
        localStorage.setItem('download_timestamp', Date.now().toString());
      } else {
        setDownloadStatus('error');
      }
    } catch (error) {
      console.error('Download failed:', error);
      setDownloadStatus('error');
    }
  };

  if (paymentStatus === 'verifying') {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{backgroundColor: '#e5e3dc'}}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-xl" style={{color: '#303636'}}>Verifying your payment...</p>
        </div>
      </div>
    );
  }

  if (paymentStatus === 'failed') {
    return (
      <div className="min-h-screen" style={{backgroundColor: '#e5e3dc'}}>
        <div className="bc-primary-bg text-white">
          <div className="px-6 py-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 mb-6 bg-red-500 bg-opacity-20 rounded-full">
              <div className="text-3xl">❌</div>
            </div>
            <h1 className="text-3xl font-bold mb-4" style={{color: 'white'}}>
              Payment Verification Failed
            </h1>
            <p className="text-xl opacity-90">
              We couldn't verify your payment. Please try again.
            </p>
          </div>
        </div>
        
        <div className="px-6 py-8 text-center">
          <div className="bc-card-bg rounded-2xl p-8 shadow-lg max-w-md mx-auto">
            <p className="mb-6" style={{color: '#495a58'}}>
              If you believe this is an error, please contact support with your payment details.
            </p>
            <button 
              onClick={() => window.location.href = '/'}
              className="w-full px-6 py-3 rounded-xl text-white font-semibold"
              style={{backgroundColor: '#d4967d'}}
            >
              Return to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{backgroundColor: '#e5e3dc'}}>
      {/* Header */}
      <div className="bc-primary-bg text-white">
        <div className="px-6 py-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-6 bg-green-500 bg-opacity-20 rounded-full">
            <div className="text-3xl">🎉</div>
          </div>
          <h1 className="text-3xl font-bold mb-4" style={{color: 'white'}}>
            Payment Successful!
          </h1>
          <p className="text-xl" style={{color: 'white'}}>
            Thank you for supporting local history
          </p>
        </div>
      </div>

      <div className="px-6 py-8 max-w-4xl mx-auto">
        {/* Payment Summary */}
        <div className="bc-card-bg rounded-2xl p-6 shadow-lg mb-8">
          <div className="grid md:grid-cols-2 gap-4 text-sm mb-6">
            <div>✅ Full access to all 8 tour stops</div>
            <div>✅ GPS-triggered audio narration</div>
            <div>✅ Lifetime access - use anytime</div>
            <div>✅ Share with your group</div>
          </div>
          
          {sessionDetails?.customer_email && (
            <div className="text-sm" style={{color: '#495a58'}}>
              Receipt sent to: {sessionDetails.customer_email}
            </div>
          )}
        </div>

        {/* Primary Action - Start Tour */}
        <div className="grid gap-4 mb-8">
          <button
            onClick={handleStartTour}
            className="w-full px-8 py-4 rounded-xl text-xl font-bold text-white shadow-lg hover:transform hover:scale-105 transition-all duration-200"
            style={{backgroundColor: '#d4967d'}}
          >
            🎧 Start Your Tour Now
          </button>
        </div>

        {/* Offline Download Recommendation */}
        <div className="bc-card-bg rounded-2xl p-6 shadow-lg mb-6">
          <div className="text-center mb-4">
            <h3 className="text-lg font-bold mb-2" style={{color: '#303636'}}>
              📱 Strongly Recommended: Download for Offline Use
            </h3>
            <p className="text-sm mb-4" style={{color: '#495a58'}}>
              Download the audio content now to avoid any technical issues during your tour. This ensures a seamless experience even without cell service.
            </p>
            {downloadStatus === 'idle' && (
              <button
                onClick={handleDownloadOffline}
                className="w-full px-8 py-3 rounded-xl text-lg font-semibold mb-4 hover:transform hover:scale-105 transition-all duration-200"
                style={{backgroundColor: '#d4967d', color: 'white'}}
              >
                📱 Download for Offline Use
              </button>
            )}

            {downloadStatus === 'downloading' && (
              <div className="text-center mb-4">
                <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
                  <div
                    className="h-3 rounded-full transition-all duration-300"
                    style={{
                      width: `${downloadProgress}%`,
                      backgroundColor: '#d4967d'
                    }}
                  ></div>
                </div>
                <p className="text-sm font-semibold" style={{color: '#303636'}}>
                  Downloading audio files... {downloadProgress}%
                </p>
                <p className="text-xs" style={{color: '#495a58'}}>
                  Please keep this page open
                </p>
              </div>
            )}

            {downloadStatus === 'completed' && (
              <div className="text-center mb-4 p-4 rounded-xl" style={{backgroundColor: '#e8f5e8'}}>
                <div className="text-2xl mb-2">✅</div>
                <p className="font-semibold text-green-800 mb-1">Download Complete!</p>
                <p className="text-sm text-green-700">
                  All audio files are ready for offline use
                </p>
              </div>
            )}

            {downloadStatus === 'error' && (
              <div className="text-center mb-4">
                <div className="p-4 rounded-xl mb-3" style={{backgroundColor: '#fee'}}>
                  <div className="text-2xl mb-2">⚠️</div>
                  <p className="font-semibold text-red-800 mb-1">Download Issues</p>
                  <p className="text-sm text-red-700">
                    Some files couldn't download, but your tour will still work
                  </p>
                </div>
                <button
                  onClick={handleDownloadOffline}
                  className="w-full px-6 py-2 rounded-xl text-sm font-semibold hover:transform hover:scale-105 transition-all duration-200"
                  style={{backgroundColor: '#d4967d', color: 'white'}}
                >
                  Try Again
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Support Contact */}
        <div className="bc-card-bg rounded-2xl p-6 shadow-lg mb-6 text-center">
          <h3 className="text-lg font-bold mb-4" style={{color: '#303636'}}>
            Need Technical Support?
          </h3>
          <p className="text-sm mb-4" style={{color: '#495a58'}}>
            If you experience any technical issues that cannot be resolved, please contact us:
          </p>
          <a
            href="mailto:services@basecampdataanalytics.com"
            className="text-lg font-semibold hover:underline transition-all duration-200 block"
            style={{color: '#d4967d'}}
          >
            services@basecampdataanalytics.com
          </a>
          <p className="text-xs mt-2" style={{color: '#495a58'}}>
            We typically respond within 24 hours
          </p>
        </div>

        {/* Share with Friends */}
        <div className="bc-card-bg rounded-2xl p-6 shadow-lg mb-6">
          <ShareButtons
            title="Falls Park Self-Guided Walking Tour"
            text="I just got access to an amazing self-guided tour of Falls Park in Greenville, SC! GPS-triggered audio at historic stops. Check it out:"
            url="https://tours.basecampdataanalytics.com"
          />
        </div>

        {/* Thank You Message */}
        <div className="bc-card-bg rounded-2xl p-6 shadow-lg text-center">
          <h3 className="text-lg font-bold mb-4" style={{color: '#303636'}}>
            🏆 You're supporting local history!
          </h3>
          <p className="text-sm mb-4" style={{color: '#495a58'}}>
            Your contribution helps us research new tours, maintain the app, and keep this accessible for everyone in the community.
          </p>
          <div className="text-center p-4 rounded-xl" style={{backgroundColor: '#d4967d', color: 'white'}}>
            <div className="font-semibold mb-1">Ready to explore?</div>
            <div className="text-sm opacity-90">Head to Falls Park and let the tour guide you!</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PaymentSuccess;