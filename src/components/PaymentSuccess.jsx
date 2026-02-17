import { useState, useEffect } from 'react';
import { verifyPayment } from '../utils/stripe.js';
import { audioPreloader } from '../utils/audioPreloader.js';
import { ga4 } from '../services/analytics.js';
import tourConfig from '../config/tourConfig.js';

function PaymentSuccess() {
  const [paymentStatus, setPaymentStatus] = useState('verifying');
  const [sessionDetails, setSessionDetails] = useState(null);
  const [showDownloadOption, setShowDownloadOption] = useState(false);
  const [downloadStatus, setDownloadStatus] = useState('idle');
  const [downloadProgress, setDownloadProgress] = useState(0);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');

    if (sessionId) {
      verifyPayment(sessionId).then(result => {
        if (result.success) {
          setPaymentStatus('success');
          setSessionDetails(result.session);
          localStorage.setItem('tour_access', 'granted');
          localStorage.setItem('payment_session', JSON.stringify(result.session));
          ga4.purchase(sessionId, result.session?.amount_total / 100 || tourConfig.pricing.defaultAmount);

          // Auto-start background preload (non-blocking)
          startBackgroundPreload();
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

  const startBackgroundPreload = async () => {
    const audioUrls = tourConfig.stops.map(stop => stop.audio_url);
    try {
      await audioPreloader.preloadAudioFiles(audioUrls, () => {});
      localStorage.setItem('tour_content_downloaded', 'true');
      localStorage.setItem('download_timestamp', Date.now().toString());
    } catch (error) {
      console.log('Background preload failed, will stream instead');
    }
  };

  const handleStartTour = () => {
    window.location.href = '/?tour=true';
  };

  const handleDownloadOffline = async () => {
    if (downloadStatus === 'downloading') return;

    setDownloadStatus('downloading');
    setDownloadProgress(0);

    const audioUrls = tourConfig.stops.map(stop => stop.audio_url);

    try {
      const result = await audioPreloader.preloadAudioFiles(
        audioUrls,
        (progress) => setDownloadProgress(progress)
      );

      if (result.success) {
        setDownloadStatus('completed');
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{borderColor: '#d4967d'}}></div>
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
            <div className="text-4xl mb-4">❌</div>
            <h1 className="text-2xl font-bold mb-2" style={{color: 'white'}}>
              Payment Verification Failed
            </h1>
            <p className="text-lg opacity-90">
              We couldn't verify your payment. Please try again.
            </p>
          </div>
        </div>

        <div className="px-6 py-8 text-center">
          <div className="bc-card-bg rounded-2xl p-6 shadow-lg max-w-md mx-auto">
            <p className="mb-4" style={{color: '#495a58'}}>
              If you believe this is an error, please contact support.
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
      <title>You're All Set! | Falls Park Walking Tour</title>
      <meta name="description" content="Payment confirmed. Start your Falls Park self-guided walking tour now. Download audio for offline use or begin exploring immediately." />
      {/* Header - Success */}
      <header className="bc-primary-bg text-white">
        <div className="px-6 py-8 text-center">
          <div className="text-4xl mb-4">🎉</div>
          <h1 className="text-2xl font-bold mb-2" style={{color: 'white'}}>
            You're All Set!
          </h1>
          <p className="text-lg" style={{color: 'white'}}>
            {tourConfig.content.thankYouMessage}
          </p>
        </div>
      </header>

      <main className="px-6 py-6 max-w-md mx-auto">
        {/* Primary CTA - Start Tour (Above the fold) */}
        <div className="bc-card-bg rounded-2xl p-6 shadow-xl mb-6 text-center" style={{borderColor: '#d4967d', border: '2px solid'}}>
          <h2 className="text-xl font-bold mb-2" style={{color: '#303636'}}>
            Ready to Explore?
          </h2>
          <p className="text-base mb-4" style={{color: '#495a58'}}>
            Head to {tourConfig.startPoint} to begin your tour
          </p>
          <button
            onClick={handleStartTour}
            className="w-full px-8 py-4 rounded-xl text-xl font-bold text-white shadow-lg hover:transform hover:scale-105 transition-all duration-200"
            style={{backgroundColor: '#d4967d'}}
          >
            Start Your Tour
          </button>
        </div>

        {/* What You Get - Compact confirmation */}
        <div className="bc-card-bg rounded-2xl p-5 shadow-lg mb-6">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-2">
              <span style={{color: '#d4967d'}}>✓</span>
              <span style={{color: '#303636'}}>{tourConfig.stats.stops} tour stops</span>
            </div>
            <div className="flex items-center gap-2">
              <span style={{color: '#d4967d'}}>✓</span>
              <span style={{color: '#303636'}}>GPS-triggered audio</span>
            </div>
            <div className="flex items-center gap-2">
              <span style={{color: '#d4967d'}}>✓</span>
              <span style={{color: '#303636'}}>Lifetime access</span>
            </div>
            <div className="flex items-center gap-2">
              <span style={{color: '#d4967d'}}>✓</span>
              <span style={{color: '#303636'}}>Share with group</span>
            </div>
          </div>
        </div>

        {/* Optional Download - Collapsed by default */}
        <div className="bc-card-bg rounded-2xl p-5 shadow-lg mb-6">
          {!showDownloadOption ? (
            <button
              onClick={() => setShowDownloadOption(true)}
              className="w-full text-center text-base font-medium"
              style={{color: '#495a58'}}
            >
              📱 Download for offline use (optional)
            </button>
          ) : (
            <div className="text-center">
              <h3 className="text-base font-bold mb-2" style={{color: '#303636'}}>
                Download for Offline Use
              </h3>
              <p className="text-sm mb-4" style={{color: '#495a58'}}>
                Download audio for areas with poor cell service
              </p>

              {downloadStatus === 'idle' && (
                <button
                  onClick={handleDownloadOffline}
                  className="w-full px-6 py-3 rounded-xl text-white font-semibold"
                  style={{backgroundColor: '#d4967d'}}
                >
                  Download Audio Files
                </button>
              )}

              {downloadStatus === 'downloading' && (
                <div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                    <div
                      className="h-2 rounded-full transition-all duration-300"
                      style={{ width: `${downloadProgress}%`, backgroundColor: '#d4967d' }}
                    ></div>
                  </div>
                  <p className="text-sm" style={{color: '#495a58'}}>
                    Downloading... {downloadProgress}%
                  </p>
                </div>
              )}

              {downloadStatus === 'completed' && (
                <div className="p-3 rounded-xl" style={{backgroundColor: '#e8f5e8'}}>
                  <p className="font-semibold text-green-800">✓ Download Complete!</p>
                </div>
              )}

              {downloadStatus === 'error' && (
                <div>
                  <p className="text-sm text-red-600 mb-2">Download failed, but tour will still work online</p>
                  <button
                    onClick={handleDownloadOffline}
                    className="text-sm font-medium"
                    style={{color: '#d4967d'}}
                  >
                    Try Again
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Support - Minimal */}
        <div className="text-center">
          <p className="text-sm mb-1" style={{color: '#495a58'}}>
            Need help?
          </p>
          <a
            href={`mailto:${tourConfig.support.email}`}
            className="text-base font-semibold hover:underline"
            style={{color: '#d4967d'}}
          >
            {tourConfig.support.email}
          </a>
        </div>
      </main>
    </div>
  );
}

export default PaymentSuccess;
