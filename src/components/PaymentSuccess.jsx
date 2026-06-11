import { useState, useEffect } from 'react';
import { verifyPayment, ACCESS_SESSION_KEY } from '../utils/stripe.js';
import { audioPreloader } from '../utils/audioPreloader.js';
import { getSignedAudioUrl } from '../utils/audioAccess.js';
import { ga4 } from '../services/analytics.js';
import tourConfig from '../config/tourConfig.js';

function PaymentSuccess() {
  const [paymentStatus, setPaymentStatus] = useState('verifying');
  const [showDownloadOption, setShowDownloadOption] = useState(false);
  const [downloadStatus, setDownloadStatus] = useState('idle');
  const [downloadProgress, setDownloadProgress] = useState(0);

  const runVerification = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');

    if (!sessionId) {
      setPaymentStatus('failed');
      return;
    }

    setPaymentStatus('verifying');
    verifyPayment(sessionId).then(result => {
      if (result.success) {
        setPaymentStatus('success');
        localStorage.setItem(ACCESS_SESSION_KEY, sessionId);
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
  };

  useEffect(() => {
    runVerification();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startBackgroundPreload = async () => {
    try {
      const audioUrls = await Promise.all(
        tourConfig.stops.map(stop => getSignedAudioUrl(stop.audio_url))
      );
      await audioPreloader.preloadAudioFiles(audioUrls, () => {});
      localStorage.setItem('tour_content_downloaded', 'true');
      localStorage.setItem('download_timestamp', Date.now().toString());
    } catch {
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

    try {
      const audioUrls = await Promise.all(
        tourConfig.stops.map(stop => getSignedAudioUrl(stop.audio_url))
      );
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
              This can happen on a weak connection. If you were charged, your
              purchase is safe. Try again or contact {tourConfig.support.email}.
            </p>
            <button
              onClick={runVerification}
              className="w-full px-6 py-3 rounded-xl text-white font-semibold mb-3"
              style={{backgroundColor: '#d4967d'}}
            >
              Try Again
            </button>
            <button
              onClick={() => window.location.href = '/'}
              className="w-full px-6 py-3 rounded-xl font-semibold border-2"
              style={{color: '#495a58', borderColor: '#495a58'}}
            >
              Return to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      <title>You're All Set! | Falls Park Walking Tour</title>
      <meta name="description" content="Payment confirmed. Start your Falls Park self-guided walking tour now. Download audio for offline use or begin exploring immediately." />
      {/* Header - Success */}
      <header className="bg-sage px-6 pt-12 pb-10 text-center">
        <p
          className="text-xs font-bold uppercase text-terracotta mb-3"
          style={{ letterSpacing: '0.25em' }}
        >
          {tourConfig.content.thankYouMessage}
        </p>
        <h1
          className="font-display uppercase text-white"
          style={{ fontSize: 'clamp(2.2rem, 8vw, 3rem)', lineHeight: 1.05 }}
        >
          You're all set
        </h1>
        <p className="font-serif italic text-white/85 mt-2" style={{ fontSize: '1.05rem' }}>
          {tourConfig.stats.stops} stories, yours for life.
        </p>
      </header>

      <main className="px-6 max-w-md mx-auto pb-16">
        {/* Primary CTA */}
        <section className="pt-10 text-center">
          <p className="text-base text-sage mb-5">
            Head to <span className="font-bold text-ink">{tourConfig.startPoint}</span> to begin your tour
          </p>
          <button onClick={handleStartTour} className="btn-primary text-xl">
            Start Your Tour <span aria-hidden>→</span>
          </button>
        </section>

        {/* What you get */}
        <section className="pt-12">
          <p className="kicker mb-4">Included With Your Tour</p>
          <div>
            {[
              `${tourConfig.stats.stops} tour stops`,
              'GPS-triggered audio',
              'Lifetime access',
              'Share with your group',
            ].map((feature, index) => (
              <div key={feature} className={`flex items-center justify-between py-3 ${index > 0 ? 'hairline' : ''}`}>
                <span className="text-ink font-semibold text-[15px]">{feature}</span>
                <svg width="16" height="16" viewBox="0 0 20 20" fill="none" className="flex-shrink-0" aria-hidden>
                  <path d="M2 10L8 16L18 4" stroke="#d4967d" strokeWidth="3" strokeLinecap="square" strokeLinejoin="miter" />
                </svg>
              </div>
            ))}
          </div>
        </section>

        {/* Optional offline download */}
        <section className="pt-10">
          {!showDownloadOption ? (
            <button
              onClick={() => setShowDownloadOption(true)}
              className="w-full text-center text-sm font-semibold text-sage underline underline-offset-4 bg-transparent border-none cursor-pointer"
            >
              Download audio for offline use (optional)
            </button>
          ) : (
            <div className="text-center">
              <p className="kicker justify-center mb-3">Offline Mode</p>
              <p className="text-sm text-sage mb-5">
                Download the audio now for areas with poor cell service.
              </p>

              {downloadStatus === 'idle' && (
                <button onClick={handleDownloadOffline} className="btn-outline">
                  Download Audio Files
                </button>
              )}

              {downloadStatus === 'downloading' && (
                <div>
                  <div className="w-full bg-sage/15 rounded-full h-1.5 mb-2 overflow-hidden">
                    <div
                      className="h-1.5 rounded-full bg-terracotta transition-all duration-300"
                      style={{ width: `${downloadProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-sage">Downloading… {downloadProgress}%</p>
                </div>
              )}

              {downloadStatus === 'completed' && (
                <p className="font-semibold text-green-800 bg-green-100 rounded-xl px-4 py-3">
                  ✓ Download complete. You're ready for anywhere.
                </p>
              )}

              {downloadStatus === 'error' && (
                <div>
                  <p className="text-sm text-red-700 mb-2">Download failed, but the tour still works online</p>
                  <button
                    onClick={handleDownloadOffline}
                    className="text-sm font-semibold text-terracotta-deep underline underline-offset-4 bg-transparent border-none cursor-pointer"
                  >
                    Try Again
                  </button>
                </div>
              )}
            </div>
          )}
        </section>

        {/* Support */}
        <section className="pt-12 text-center hairline mt-10">
          <p className="text-sm text-sage mt-8 mb-1">Need help?</p>
          <a
            href={`mailto:${tourConfig.support.email}`}
            className="text-base font-semibold text-terracotta-deep hover:underline"
          >
            {tourConfig.support.email}
          </a>
        </section>
      </main>
    </div>
  );
}

export default PaymentSuccess;
