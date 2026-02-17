import { useState } from 'react';
import { createPaymentSession } from '../utils/stripe.js';
import tourConfig from '../config/tourConfig.js';

function PricingSelection({ onBack }) {
  const [selectedAmount, setSelectedAmount] = useState(tourConfig.pricing.defaultAmount);
  const [customAmount, setCustomAmount] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [showPromoInput, setShowPromoInput] = useState(false);

  const handleAmountSelect = (amount) => {
    setSelectedAmount(amount);
    setShowCustomInput(false);
    setCustomAmount('');
  };

  const handleCustomAmount = () => {
    setShowCustomInput(true);
    setSelectedAmount(null);
  };

  const handleCustomSubmit = () => {
    const amount = parseFloat(customAmount);
    if (amount >= tourConfig.pricing.minimum) {
      setSelectedAmount(amount);
      setShowCustomInput(false);
    } else {
      alert(`Minimum amount is $${tourConfig.pricing.minimum.toFixed(2)}`);
    }
  };

  const handlePromoCodeSubmit = async () => {
    try {
      const response = await fetch('/api/validate-promo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: promoCode }),
      });
      const result = await response.json();

      if (result.valid) {
        localStorage.setItem('tour_access', 'granted');
        localStorage.setItem('promo_used', promoCode.toUpperCase());
        localStorage.setItem('payment_session', JSON.stringify({
          amount_total: 0,
          payment_status: 'promo_code',
          metadata: { promo_code: promoCode.toUpperCase() }
        }));
        window.location.href = '/?tour=true';
      } else {
        alert('Invalid promo code. Please try again.');
      }
    } catch (error) {
      console.error('Promo validation error:', error);
      alert('Unable to validate promo code. Please try again.');
    }
  };

  const handleContinue = async () => {
    if (promoCode.trim()) {
      handlePromoCodeSubmit();
      return;
    }

    const finalAmount = showCustomInput ? parseFloat(customAmount) : selectedAmount;
    if (finalAmount >= tourConfig.pricing.minimum) {
      setIsProcessing(true);
      try {
        const paymentData = {
          type: 'individual',
          amount: finalAmount,
          isCustom: showCustomInput,
          groupSize: 1,
          currency: tourConfig.pricing.currency.toLowerCase(),
          tourId: tourConfig.id,
        };

        const result = await createPaymentSession(paymentData);

        if (!result.success) {
          throw new Error(result.error || 'Payment session failed');
        }
      } catch (error) {
        console.error('Payment error:', error);
        alert('Payment processing failed. Please try again.');
        setIsProcessing(false);
      }
    }
  };

  return (
    <div className="min-h-screen" style={{backgroundColor: '#e5e3dc'}}>
      <title>Choose Your Price | Falls Park Walking Tour</title>
      <meta name="description" content="Pay what you want for the Falls Park self-guided audio tour. Choose from preset amounts or set your own price. 7 GPS-triggered stops in Greenville SC." />
      {/* Header - Simplified */}
      <header className="bc-primary-bg text-white">
        <div className="px-6 py-6">
          {/* Back Button */}
          <nav>
            <button
              onClick={onBack}
              className="mb-4 flex items-center text-white opacity-80 hover:opacity-100 transition-opacity"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
          </nav>

          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2" style={{color: 'white'}}>
              Choose Your Price
            </h1>
            <p className="text-lg opacity-90" style={{color: 'white'}}>
              Pay what feels fair to you
            </p>
          </div>
        </div>
      </header>

      <main className="px-6 py-6 max-w-md mx-auto">
        {/* Price Selection - Primary Focus */}
        <div className="bc-card-bg rounded-2xl p-6 shadow-lg mb-6">
          <div className="text-center mb-4">
            <p className="text-base font-semibold" style={{color: '#495a58'}}>
              Most people choose ${tourConfig.pricing.popularAmount}
            </p>
          </div>

          {/* Preset Amounts - Clean Grid */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            {tourConfig.pricing.presetAmounts.map((amount) => (
              <button
                key={amount}
                onClick={() => handleAmountSelect(amount)}
                className={`
                  p-4 rounded-xl text-center transition-all duration-200 border-2
                  ${selectedAmount === amount && !showCustomInput
                    ? 'transform scale-105 shadow-lg text-white'
                    : 'hover:transform hover:scale-105'
                  }
                `}
                style={{
                  backgroundColor: selectedAmount === amount && !showCustomInput ? '#d4967d' : '#e5e3dc',
                  borderColor: amount === tourConfig.pricing.popularAmount ? '#d4967d' : '#495a58',
                  color: selectedAmount === amount && !showCustomInput ? 'white' : '#303636',
                  borderWidth: amount === tourConfig.pricing.popularAmount ? '3px' : '2px'
                }}
              >
                <div className="text-2xl font-bold">${amount}</div>
                {amount === tourConfig.pricing.popularAmount && (
                  <div className="text-xs mt-1 opacity-75">Popular</div>
                )}
              </button>
            ))}

            {/* Custom Amount Button */}
            <button
              onClick={handleCustomAmount}
              className={`
                p-4 rounded-xl text-center transition-all duration-200 border-2
                ${showCustomInput
                  ? 'transform scale-105 shadow-lg text-white'
                  : 'hover:transform hover:scale-105'
                }
              `}
              style={{
                backgroundColor: showCustomInput ? '#d4967d' : '#e5e3dc',
                borderColor: '#495a58',
                color: showCustomInput ? 'white' : '#303636'
              }}
            >
              <div className="text-lg font-bold">Other</div>
              <div className="text-xs mt-1">Amount</div>
            </button>
          </div>

          {/* Custom Amount Input */}
          {showCustomInput && (
            <div className="mb-4 p-4 rounded-xl" style={{backgroundColor: '#e5e3dc'}}>
              <div className="flex items-center justify-center gap-3">
                <span className="text-2xl font-bold" style={{color: '#303636'}}>$</span>
                <input
                  type="number"
                  min={tourConfig.pricing.minimum}
                  step="0.01"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  className="w-24 p-3 text-center text-xl font-bold rounded-xl border-2"
                  style={{borderColor: '#d4967d'}}
                  placeholder="0.00"
                  autoFocus
                />
                <button
                  onClick={handleCustomSubmit}
                  className="px-4 py-3 rounded-xl text-white font-semibold"
                  style={{backgroundColor: '#d4967d'}}
                >
                  Set
                </button>
              </div>
              <p className="text-xs text-center mt-2" style={{color: '#495a58'}}>
                Minimum: ${tourConfig.pricing.minimum.toFixed(2)}
              </p>
            </div>
          )}

          {/* Continue Button */}
          <button
            onClick={handleContinue}
            disabled={(!selectedAmount && !customAmount) || isProcessing}
            className={`
              w-full px-8 py-4 rounded-xl text-xl font-bold text-white transition-all duration-200
              ${(selectedAmount || customAmount) && !isProcessing
                ? 'hover:transform hover:scale-105 shadow-lg'
                : 'opacity-50 cursor-not-allowed'
              }
            `}
            style={{backgroundColor: '#d4967d'}}
          >
            {isProcessing ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-2"></div>
                Processing...
              </div>
            ) : (
              `Continue with $${showCustomInput && customAmount ? customAmount : selectedAmount}`
            )}
          </button>
        </div>

        {/* What's Included - Compact */}
        <div className="bc-card-bg rounded-2xl p-5 shadow-lg mb-6">
          <h2 className="text-lg font-bold mb-3 text-center" style={{color: '#303636'}}>
            What's Included
          </h2>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {[
              { icon: "📍", text: `${tourConfig.stats.stops} GPS-triggered stops` },
              { icon: "🎙️", text: "Professional narration" },
              { icon: "🗺️", text: "Interactive map" },
              { icon: "♾️", text: "Lifetime access" },
            ].map((feature, index) => (
              <div key={index} className="flex items-center gap-2 p-2 rounded-lg" style={{backgroundColor: '#e5e3dc'}}>
                <span>{feature.icon}</span>
                <span style={{color: '#303636'}}>{feature.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Your Contribution Helps - Compact */}
        <div className="bc-card-bg rounded-2xl p-5 shadow-lg mb-6 text-center">
          <div className="text-2xl mb-2">💝</div>
          <h2 className="text-lg font-bold mb-2" style={{color: '#303636'}}>
            Your Contribution Matters
          </h2>
          <p className="text-sm" style={{color: '#495a58'}}>
            {tourConfig.content.contributionMessage}
          </p>
        </div>

        {/* Promo Code - Minimal */}
        <div className="bc-card-bg rounded-2xl p-5 shadow-lg">
          <div className="text-center">
            {!showPromoInput ? (
              <button
                onClick={() => setShowPromoInput(true)}
                className="text-sm font-medium hover:underline"
                style={{color: '#d4967d'}}
              >
                Have a promo code?
              </button>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-center gap-3">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                    className="px-4 py-2 text-center text-base font-bold rounded-xl border-2 uppercase w-32"
                    style={{borderColor: '#d4967d'}}
                    placeholder="CODE"
                    autoFocus
                  />
                  <button
                    onClick={handlePromoCodeSubmit}
                    disabled={!promoCode.trim()}
                    className={`px-4 py-2 rounded-xl text-white font-semibold transition-all duration-200 ${
                      promoCode.trim() ? 'hover:transform hover:scale-105' : 'opacity-50 cursor-not-allowed'
                    }`}
                    style={{backgroundColor: '#d4967d'}}
                  >
                    Apply
                  </button>
                </div>
                <button
                  onClick={() => {
                    setShowPromoInput(false);
                    setPromoCode('');
                  }}
                  className="text-xs opacity-60 hover:opacity-100"
                  style={{color: '#495a58'}}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default PricingSelection;
