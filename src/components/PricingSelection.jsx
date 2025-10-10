import { useState } from 'react';
import { createPaymentSession } from '../utils/stripe.js';

function PricingSelection({ onBack }) {
  const [selectedAmount, setSelectedAmount] = useState(8); // Default to $8
  const [customAmount, setCustomAmount] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [showPromoInput, setShowPromoInput] = useState(false);
  const [showWhatYouGet, setShowWhatYouGet] = useState(false);
  const [showComparison, setShowComparison] = useState(false);

  const presetAmounts = [3, 5, 8, 10, 15];

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
    if (amount > 0) {
      setSelectedAmount(amount);
      setShowCustomInput(false);
    }
  };

  const handlePromoCodeSubmit = () => {
    const validPromoCodes = ['ADMIN2024', 'REVIEW', 'TOUR_DEV'];

    if (validPromoCodes.includes(promoCode.toUpperCase())) {
      // Grant tour access without payment
      localStorage.setItem('tour_access', 'granted');
      localStorage.setItem('promo_used', promoCode.toUpperCase());
      localStorage.setItem('payment_session', JSON.stringify({
        amount_total: 0,
        payment_status: 'promo_code',
        metadata: { promo_code: promoCode.toUpperCase() }
      }));

      // Redirect directly to tour
      window.location.href = '/?tour=true';
    } else {
      alert('Invalid promo code. Please try again.');
    }
  };

  const handleContinue = async () => {
    // Check if promo code is being used
    if (promoCode.trim()) {
      handlePromoCodeSubmit();
      return;
    }

    const finalAmount = showCustomInput ? parseFloat(customAmount) : selectedAmount;
    if (finalAmount > 0) {
      setIsProcessing(true);
      try {
        const paymentData = {
          type: 'individual',
          amount: finalAmount,
          isCustom: showCustomInput,
          groupSize: 1,
          currency: 'usd'
        };

        // Create Stripe checkout session and redirect
        const result = await createPaymentSession(paymentData);

        if (!result.success) {
          throw new Error(result.error || 'Payment session failed');
        }

        // If we get here, Stripe will handle the redirect
        // The user will be redirected to Stripe checkout
      } catch (error) {
        console.error('Payment error:', error);
        alert('Payment processing failed. Please try again.');
        setIsProcessing(false);
      }
    }
  };

  return (
    <div className="min-h-screen" style={{backgroundColor: '#e5e3dc'}}>
      {/* Header */}
      <div className="bc-primary-bg text-white">
        <div className="px-6 py-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 mb-6 bg-white bg-opacity-10 rounded-full">
              <div className="text-3xl">💝</div>
            </div>
            <h1 className="text-3xl font-bold mb-4" style={{color: 'white'}}>
              What's this experience worth to you?
            </h1>
            <p className="text-xl opacity-90" style={{color: 'white'}}>
              Pay what feels fair - you decide
            </p>
          </div>
        </div>
      </div>

      <div className="px-6 py-8 max-w-4xl mx-auto">
        {/* Collapsible What You Get Section */}
        <div className="bc-card-bg rounded-2xl p-6 shadow-lg mb-6">
          <button
            onClick={() => setShowWhatYouGet(!showWhatYouGet)}
            className="w-full flex items-center justify-between"
            style={{cursor: 'pointer'}}
          >
            <h3 className="text-lg font-bold" style={{color: '#303636'}}>
              What's Included in Your Tour
            </h3>
            <span className="text-2xl" style={{color: '#d4967d'}}>
              {showWhatYouGet ? '−' : '+'}
            </span>
          </button>

          {showWhatYouGet && (
            <div className="mt-4 grid grid-cols-1 gap-3 pt-4 border-t" style={{borderColor: '#e5e3dc'}}>
              {[
                { icon: "📍", title: "7 GPS-Triggered Stops", subtitle: "Automatic audio activation as you walk" },
                { icon: "🎙️", title: "Professional Narration", subtitle: "3-5 minutes of storytelling per location" },
                { icon: "🖼️", title: "Historical Photos", subtitle: "Visual content and archival images" },
                { icon: "🗺️", title: "Interactive Map", subtitle: "Real-time location tracking" },
                { icon: "⏱️", title: "Self-Paced Experience", subtitle: "Start anytime, pause, skip ahead" },
                { icon: "♾️", title: "Lifetime Access", subtitle: "Tour as many times as you want" }
              ].map((feature, index) => (
                <div key={index} className="flex items-center p-3 rounded-xl border" style={{backgroundColor: '#e5e3dc', borderColor: '#d4967d'}}>
                  <div className="text-xl mr-3">{feature.icon}</div>
                  <div>
                    <div className="font-semibold text-sm" style={{color: '#303636'}}>{feature.title}</div>
                    <div className="text-xs" style={{color: '#495a58'}}>{feature.subtitle}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Collapsible Value Comparison */}
        <div className="bc-card-bg rounded-2xl p-6 shadow-lg mb-6">
          <button
            onClick={() => setShowComparison(!showComparison)}
            className="w-full flex items-center justify-between"
            style={{cursor: 'pointer'}}
          >
            <h3 className="text-lg font-bold" style={{color: '#303636'}}>
              How This Compares to Other Options
            </h3>
            <span className="text-2xl" style={{color: '#d4967d'}}>
              {showComparison ? '−' : '+'}
            </span>
          </button>

          {showComparison && (
            <div className="mt-4 grid grid-cols-1 gap-3 pt-4 border-t" style={{borderColor: '#e5e3dc'}}>
              <div className="flex justify-between items-center p-3 rounded-xl" style={{backgroundColor: '#e5e3dc'}}>
                <span className="text-sm">Professional guided tour:</span>
                <span className="font-bold">$25-35</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-xl" style={{backgroundColor: '#e5e3dc'}}>
                <span className="text-sm">Coffee at local café:</span>
                <span className="font-bold">$5-6</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-xl" style={{backgroundColor: '#e5e3dc'}}>
                <span className="text-sm">2-hour downtown parking:</span>
                <span className="font-bold">$4-8</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-xl border-2" style={{backgroundColor: '#d4967d', borderColor: '#495a58'}}>
                <span className="text-sm font-bold text-white">Our historical tour:</span>
                <span className="font-bold text-white">You decide!</span>
              </div>
            </div>
          )}
        </div>

        {/* PROMINENT: Your Contribution Supports - Hero Section */}
        <div className="bc-card-bg rounded-2xl p-8 shadow-2xl mb-8 border-2" style={{borderColor: '#d4967d'}}>
          <div className="text-center mb-6">
            <div className="inline-flex w-16 h-16 rounded-full items-center justify-center mb-4" style={{backgroundColor: '#d4967d'}}>
              <span className="text-3xl">💝</span>
            </div>
            <h3 className="text-2xl md:text-3xl font-bold mb-3" style={{color: '#303636', fontFamily: 'Anton, sans-serif'}}>
              YOUR CONTRIBUTION MATTERS
            </h3>
            <p className="text-lg mb-6" style={{color: '#495a58', lineHeight: '1.6'}}>
              Every dollar you contribute helps us continue sharing Greenville's history with visitors like you
            </p>
          </div>

          <div className="space-y-4 mb-6">
            {[
              {
                icon: "📚",
                title: "Local Storytelling",
                description: "Fund research and preservation of Greenville's rich history"
              },
              {
                icon: "🌱",
                title: "New Tour Development",
                description: "Help us create more experiences across Greenville"
              },
              {
                icon: "❤️",
                title: "Accessibility for All",
                description: "Keep tours available to visitors who can't afford traditional guided tours"
              },
              {
                icon: "✨",
                title: "App Improvements",
                description: "Better features, more content, enhanced experience"
              }
            ].map((item, index) => (
              <div key={index} className="flex items-start p-4 rounded-xl border-2" style={{backgroundColor: '#e5e3dc', borderColor: '#d4967d'}}>
                <div className="text-2xl mr-4 flex-shrink-0">{item.icon}</div>
                <div>
                  <div className="font-bold text-base mb-1" style={{color: '#303636'}}>{item.title}</div>
                  <div className="text-sm leading-relaxed" style={{color: '#495a58'}}>{item.description}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center p-6 rounded-xl" style={{backgroundColor: '#d4967d', color: 'white'}}>
            <p className="text-xl font-bold mb-2">
              Thank you for supporting local history! 🙏
            </p>
            <p className="text-sm opacity-90">
              Your generosity makes these tours possible for everyone
            </p>
          </div>
        </div>

        {/* Payment Selection */}
        <div className="bc-card-bg rounded-2xl p-6 shadow-lg mb-8">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold mb-2" style={{color: '#303636'}}>
              🏆 Most people choose $8 🏆
            </h3>
            <p className="text-sm" style={{color: '#495a58'}}>
              Select an amount or enter your own
            </p>
          </div>

          <div className="grid grid-cols-4 gap-3 mb-6">
            {presetAmounts.map((amount) => (
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
                  borderColor: amount === 8 ? '#d4967d' : '#495a58',
                  color: selectedAmount === amount && !showCustomInput ? 'white' : '#303636',
                  borderWidth: amount === 8 ? '3px' : '2px'
                }}
              >
                <div className="text-2xl font-bold">${amount}</div>
                {amount === 8 && (
                  <div className="text-xs mt-1 opacity-75">Popular</div>
                )}
              </button>
            ))}

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
              <div className="text-lg font-bold">Custom</div>
              <div className="text-xs mt-1">Amount</div>
            </button>
          </div>

          {showCustomInput && (
            <div className="mb-6">
              <div className="flex items-center justify-center gap-4">
                <span className="text-2xl font-bold">$</span>
                <input
                  type="number"
                  min="0.50"
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
                  className="px-4 py-2 rounded-xl text-white font-semibold"
                  style={{backgroundColor: '#d4967d'}}
                >
                  Set
                </button>
              </div>
            </div>
          )}

          <div className="text-center">
            <button
              onClick={handleContinue}
              disabled={(!selectedAmount && !customAmount) || isProcessing}
              className={`
                px-8 py-4 rounded-xl text-xl font-bold text-white transition-all duration-200
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
                `Continue with ${showCustomInput ? `$${customAmount}` : `$${selectedAmount}`}`
              )}
            </button>
          </div>
        </div>

        {/* Promo Code Section */}
        <div className="bc-card-bg rounded-2xl p-6 shadow-lg mb-8">
          <div className="text-center">
            <h3 className="text-lg font-bold mb-2" style={{color: '#303636'}}>
              🎫 Have a promo code?
            </h3>
            <p className="text-sm mb-4" style={{color: '#495a58'}}>
              Enter your code to access the tour
            </p>

            {!showPromoInput ? (
              <button
                onClick={() => setShowPromoInput(true)}
                className="px-6 py-2 rounded-xl border-2 font-semibold hover:transform hover:scale-105 transition-all duration-200"
                style={{borderColor: '#d4967d', color: '#d4967d'}}
              >
                Enter Promo Code
              </button>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-4">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                    className="px-4 py-3 text-center text-lg font-bold rounded-xl border-2 uppercase"
                    style={{borderColor: '#d4967d'}}
                    placeholder="ENTER CODE"
                    autoFocus
                  />
                  <button
                    onClick={handlePromoCodeSubmit}
                    disabled={!promoCode.trim()}
                    className={`px-6 py-3 rounded-xl text-white font-semibold transition-all duration-200 ${
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
                  className="text-sm opacity-60 hover:opacity-100"
                  style={{color: '#495a58'}}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

export default PricingSelection;
