import { useState, useEffect } from 'react';
import { verifyPayment } from '../utils/stripe.js';

function PaymentSuccess() {
  const [paymentStatus, setPaymentStatus] = useState('verifying');
  const [sessionDetails, setSessionDetails] = useState(null);

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

  const handleDownloadOffline = () => {
    // Trigger offline content download
    console.log('Starting offline download...');
    // This would integrate with your offline download system
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
          <p className="text-xl opacity-90">
            Thank you for supporting local history
          </p>
        </div>
      </div>

      <div className="px-6 py-8 max-w-4xl mx-auto">
        {/* Payment Summary */}
        <div className="bc-card-bg rounded-2xl p-6 shadow-lg mb-8">
          <h3 className="text-xl font-bold mb-4" style={{color: '#303636'}}>
            Your Contribution: ${sessionDetails?.amount_total ? (sessionDetails.amount_total / 100).toFixed(2) : 'N/A'}
          </h3>
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

        {/* Action Buttons */}
        <div className="grid gap-4 mb-8">
          <button
            onClick={handleStartTour}
            className="w-full px-8 py-4 rounded-xl text-xl font-bold text-white shadow-lg hover:transform hover:scale-105 transition-all duration-200"
            style={{backgroundColor: '#d4967d'}}
          >
            🎧 Start Your Tour Now
          </button>
          
          <button
            onClick={handleDownloadOffline}
            className="w-full px-8 py-4 rounded-xl text-lg font-semibold border-2 hover:transform hover:scale-105 transition-all duration-200"
            style={{borderColor: '#d4967d', color: '#d4967d', backgroundColor: 'transparent'}}
          >
            📱 Download for Offline Use
          </button>
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