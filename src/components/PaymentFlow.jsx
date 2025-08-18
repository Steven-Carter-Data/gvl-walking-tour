import { useState } from 'react';

function PaymentFlow({ onPaymentComplete, onBack }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleStripeCheckout = async () => {
    setLoading(true);
    setError(null);

    try {
      // In production, this would integrate with your backend to create Stripe checkout session
      // For demo purposes, we'll simulate a successful payment
      console.log('Initiating Stripe checkout...');
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate successful payment
      console.log('Payment successful!');
      onPaymentComplete();
      
    } catch (err) {
      setError('Payment failed. Please try again.');
      console.error('Payment error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoPurchase = () => {
    // For development/demo purposes - skip actual payment
    console.log('Demo purchase - bypassing payment');
    onPaymentComplete();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center">
          <button 
            onClick={onBack}
            className="mr-4 p-2 text-gray-600 hover:text-gray-900"
          >
            ← Back
          </button>
          <h1 className="text-xl font-semibold text-gray-900">
            Complete Purchase
          </h1>
        </div>
      </div>

      <div className="p-6">
        {/* Order Summary */}
        <div className="card mb-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-900">
            Order Summary
          </h2>
          <div className="flex justify-between items-center py-3 border-b border-gray-200">
            <div>
              <h3 className="font-medium text-gray-900">Falls Park Historical Tour</h3>
              <p className="text-sm text-gray-500">Self-guided audio experience • 10 stops</p>
            </div>
            <div className="text-right">
              <div className="font-semibold text-gray-900">$9.99</div>
            </div>
          </div>
          
          <div className="pt-3">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-gray-900">Total</span>
              <span className="text-xl font-bold text-blue-600">$9.99</span>
            </div>
          </div>
        </div>

        {/* What's Included */}
        <div className="card mb-6">
          <h3 className="font-semibold mb-3 text-gray-900">What's Included</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
              10 GPS-triggered audio stops (3-5 minutes each)
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
              Historical photos and visual content
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
              Interactive map with your location
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
              Offline download for reliable playback
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
              Lifetime access - tour anytime
            </li>
          </ul>
        </div>

        {/* Payment Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleStripeCheckout}
            disabled={loading}
            className="btn-primary"
          >
            {loading ? 'Processing...' : 'Pay with Stripe'}
          </button>
          
          {/* Demo Button - Remove in production */}
          <button
            onClick={handleDemoPurchase}
            className="btn-secondary text-orange-600 border-orange-300 hover:bg-orange-50"
          >
            Demo Purchase (Skip Payment)
          </button>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {/* Security Notice */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              🔒
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">Secure Payment</h3>
              <p className="mt-1 text-sm text-blue-600">
                Payments processed securely through Stripe. We never store your payment information.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PaymentFlow;