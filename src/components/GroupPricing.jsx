import { useState } from 'react';
import { createPaymentSession } from '../utils/stripe.js';

function GroupPricing({ groupData, onPaymentSelect, onBack }) {
  const [selectedAmount, setSelectedAmount] = useState(groupData.pricing); // Default to recommended amount
  const [customAmount, setCustomAmount] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [showPromoInput, setShowPromoInput] = useState(false);
  
  // Different preset amounts based on group size
  const getPresetAmounts = () => {
    if (groupData.id === 'small-group') {
      return [10, 12, 15, 18, 20]; // 2-4 people
    } else if (groupData.id === 'large-group') {
      return [20, 25, 30, 35, 40]; // 5+ people
    }
    return [15]; // fallback
  };
  
  const presetAmounts = getPresetAmounts();
  
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
          type: groupData.id,
          amount: finalAmount,
          isCustom: showCustomInput,
          groupSize: groupData.id === 'small-group' ? '2-4' : '5+',
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
          <button 
            onClick={onBack}
            className="flex items-center mb-4 text-white opacity-80 hover:opacity-100"
          >
            <span className="text-xl mr-2">←</span>
            Back
          </button>
          
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 mb-6 bg-white bg-opacity-10 rounded-full">
              <div className="text-3xl">{groupData.icon}</div>
            </div>
            <h1 className="text-3xl font-bold mb-4" style={{color: 'white'}}>
              {groupData.title} - What's this experience worth to you?
            </h1>
            <p className="text-xl opacity-90" style={{color: 'white'}}>
              Pay what feels fair - you decide
            </p>
          </div>
        </div>
      </div>

      <div className="px-6 py-8 max-w-4xl mx-auto">
        {/* Value Anchoring */}
        <div className="bc-card-bg rounded-2xl p-6 shadow-lg mb-8">
          <h3 className="text-xl font-bold mb-4 text-center" style={{color: '#303636'}}>
            For comparison in downtown Greenville:
          </h3>
          <div className="grid grid-cols-1 gap-3 text-sm">
            <div className="flex justify-between items-center">
              <span>🌟 Professional guided tour:</span>
              <span className="font-semibold ml-2">$25-35</span>
            </div>
            <div className="flex justify-between items-center">
              <span>☕ Coffee at local café:</span>
              <span className="font-semibold ml-2">$5-6</span>
            </div>
            <div className="flex justify-between items-center">
              <span>🚗 2-hour downtown parking:</span>
              <span className="font-semibold ml-2">$4-8</span>
            </div>
            <div className="flex justify-between items-center">
              <span>📱 Our historical tour:</span>
              <span className="font-semibold ml-2" style={{color: '#d4967d'}}>You decide!</span>
            </div>
          </div>
        </div>

        {/* Value Reinforcement */}
        <div className="bc-card-bg rounded-2xl p-6 shadow-lg mb-8">
          <h3 className="text-lg font-bold mb-4" style={{color: '#303636'}}>
            ✅ Your contribution supports:
          </h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm mb-6">
            <div>• Local storytelling and historical research</div>
            <div>• App improvements and new tour development</div>
            <div>• Keeping this accessible to everyone</div>
            <div>• Supporting visitors who can't afford the full experience</div>
          </div>
          
          <div className="text-center p-4 rounded-xl" style={{backgroundColor: '#d4967d', color: 'white'}}>
            <div className="font-semibold">🎯 No pressure, just great stories</div>
          </div>
        </div>

        {/* Payment Selection */}
        <div className="bc-card-bg rounded-2xl p-6 shadow-lg mb-8">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold mb-2" style={{color: '#303636'}}>
              🏆 Most people choose ${groupData.pricing} 🏆
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
                  borderColor: amount === groupData.pricing ? '#d4967d' : '#495a58',
                  color: selectedAmount === amount && !showCustomInput ? 'white' : '#303636',
                  borderWidth: amount === groupData.pricing ? '3px' : '2px'
                }}
              >
                <div className="text-2xl font-bold">${amount}</div>
                {amount === groupData.pricing && (
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
                  min="1"
                  step="0.50"
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

export default GroupPricing;