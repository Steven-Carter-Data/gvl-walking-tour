import { useState, useEffect } from 'react';
import { createPaymentSession } from '../utils/stripe.js';
import tourConfig from '../config/tourConfig.js';
import { ga4 } from '../services/analytics.js';

function PricingSelection({ onBack }) {
  const [selectedAmount, setSelectedAmount] = useState(tourConfig.pricing.defaultAmount);
  const [customAmount, setCustomAmount] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPromoInfo, setShowPromoInfo] = useState(false);
  const [customAmountError, setCustomAmountError] = useState(null);
  const [paymentError, setPaymentError] = useState(null);

  // Funnel event: welcome → pricing drop-off is measurable from this
  useEffect(() => {
    ga4.event('pricing_page_viewed');
  }, []);

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
      setCustomAmountError(null);
    } else {
      setCustomAmountError(`Minimum amount is $${tourConfig.pricing.minimum.toFixed(2)}`);
    }
  };

  const handleContinue = async () => {
    const finalAmount = showCustomInput ? parseFloat(customAmount) : selectedAmount;
    if (finalAmount >= tourConfig.pricing.minimum) {
      setIsProcessing(true);
      setPaymentError(null);
      ga4.beginCheckout(finalAmount);
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
        setPaymentError('We couldn’t open the secure checkout page. Please check your connection and try again.');
        setIsProcessing(false);
      }
    } else if (showCustomInput) {
      setCustomAmountError(`Minimum amount is $${tourConfig.pricing.minimum.toFixed(2)}`);
    }
  };

  const displayAmount = showCustomInput && customAmount ? customAmount : selectedAmount;

  return (
    <div className="min-h-screen bg-cream">
      <title>Choose Your Price | Falls Park Walking Tour</title>
      <meta name="description" content="Pay what you want for the Falls Park self-guided audio tour. Choose from preset amounts or set your own price. 7 GPS-triggered stops in Greenville SC." />

      {/* Header */}
      <header className="bg-sage px-6 pt-6 pb-10">
        <div className="max-w-md mx-auto">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-white/80 hover:text-white text-sm font-semibold bg-transparent border-none cursor-pointer mb-7 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>

          <p
            className="text-xs font-bold uppercase text-terracotta mb-2"
            style={{ letterSpacing: '0.25em' }}
          >
            Pay What You Want
          </p>
          <h1
            className="font-display uppercase text-white"
            style={{ fontSize: 'clamp(2.2rem, 8vw, 3rem)', lineHeight: 1.05 }}
          >
            Name your price
          </h1>
          <p className="font-serif italic text-white/85 mt-2" style={{ fontSize: '1.05rem' }}>
            Pay what feels fair to you.
          </p>
        </div>
      </header>

      <main className="max-w-md mx-auto px-6 pb-16">
        {/* Price Selection */}
        <section className="pt-10">
          <p className="text-sm font-semibold text-sage text-center mb-5">
            Most people choose <span className="text-terracotta-deep font-bold">${tourConfig.pricing.popularAmount}</span>
          </p>

          {/* Preset amounts */}
          <div className="grid grid-cols-3 gap-3 mb-3">
            {tourConfig.pricing.presetAmounts.map((amount) => {
              const isSelected = selectedAmount === amount && !showCustomInput;
              const isPopular = amount === tourConfig.pricing.popularAmount;
              return (
                <button
                  key={amount}
                  onClick={() => handleAmountSelect(amount)}
                  className={`relative py-4 rounded-2xl text-center font-display text-2xl transition-all duration-150 cursor-pointer border-2 ${
                    isSelected
                      ? 'bg-terracotta text-white border-terracotta shadow-lg scale-105'
                      : 'bg-white/60 text-ink border-sage/25 hover:border-terracotta hover:bg-white'
                  }`}
                >
                  ${amount}
                  {isPopular && (
                    <span
                      className={`absolute -top-2.5 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${
                        isSelected ? 'bg-white text-terracotta-deep' : 'bg-terracotta text-white'
                      }`}
                      style={{ letterSpacing: '0.1em', fontFamily: 'var(--font-sans)' }}
                    >
                      Popular
                    </span>
                  )}
                </button>
              );
            })}

            {/* Custom amount */}
            <button
              onClick={handleCustomAmount}
              className={`py-4 rounded-2xl text-center transition-all duration-150 cursor-pointer border-2 ${
                showCustomInput
                  ? 'bg-terracotta text-white border-terracotta shadow-lg scale-105'
                  : 'bg-white/60 text-ink border-sage/25 hover:border-terracotta hover:bg-white'
              }`}
            >
              <span className="font-display text-lg block leading-none">Other</span>
              <span className="text-[10px] font-semibold uppercase opacity-75" style={{ letterSpacing: '0.08em' }}>
                amount
              </span>
            </button>
          </div>

          {/* Custom amount input */}
          {showCustomInput && (
            <div className="py-4">
              <div className="flex items-end justify-center gap-3 max-w-[240px] mx-auto">
                <span className="font-display text-3xl text-ink" aria-hidden>$</span>
                <input
                  type="number"
                  min={tourConfig.pricing.minimum}
                  step="0.01"
                  value={customAmount}
                  onChange={(e) => {
                    setCustomAmount(e.target.value);
                    setCustomAmountError(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCustomSubmit();
                  }}
                  className="input-line text-center font-display text-2xl"
                  placeholder="0.00"
                  autoFocus
                />
                <button
                  onClick={handleCustomSubmit}
                  className="btn-primary flex-shrink-0"
                  style={{ width: 'auto', padding: '0.6rem 1.4rem', fontSize: '0.95rem' }}
                >
                  Set
                </button>
              </div>
              <p className="text-xs text-center mt-3 text-sage">
                Minimum: ${tourConfig.pricing.minimum.toFixed(2)}
              </p>
              {customAmountError && (
                <p className="text-sm text-center mt-2 font-semibold px-3 py-2 rounded-xl bg-red-100 text-red-900 max-w-[280px] mx-auto">
                  {customAmountError}
                </p>
              )}
            </div>
          )}

          {paymentError && (
            <p className="text-sm text-center my-3 font-semibold px-3 py-2 rounded-xl bg-red-100 text-red-900">
              {paymentError}
            </p>
          )}

          {/* Continue */}
          <button
            onClick={handleContinue}
            disabled={(!selectedAmount && !customAmount) || isProcessing}
            className="btn-primary text-lg mt-4"
          >
            {isProcessing ? (
              <span className="flex items-center justify-center gap-2">
                <span
                  className="inline-block w-5 h-5 rounded-full border-2 border-white/40 border-t-white"
                  style={{ animation: 'spin 1s linear infinite' }}
                ></span>
                Processing…
              </span>
            ) : (
              <>Continue with ${displayAmount} <span aria-hidden>→</span></>
            )}
          </button>
        </section>

        {/* What's included */}
        <section className="pt-12">
          <p className="kicker mb-5">What's Included</p>
          <div>
            {[
              `${tourConfig.stats.stops} GPS-triggered stops`,
              'Professional narration',
              'Interactive map',
              'Lifetime access',
            ].map((feature, index) => (
              <div key={feature} className={`flex items-center justify-between py-3.5 ${index > 0 ? 'hairline' : ''}`}>
                <span className="text-ink font-semibold text-[15px]">{feature}</span>
                <svg width="16" height="16" viewBox="0 0 20 20" fill="none" className="flex-shrink-0" aria-hidden>
                  <path d="M2 10L8 16L18 4" stroke="#d4967d" strokeWidth="3" strokeLinecap="square" strokeLinejoin="miter" />
                </svg>
              </div>
            ))}
          </div>
        </section>

        {/* Contribution note */}
        <section className="pt-12 text-center">
          <p className="font-serif italic text-sage text-[16px] leading-relaxed max-w-xs mx-auto">
            “{tourConfig.content.contributionMessage}.”
          </p>
        </section>

        {/* Promo code - applied on the Stripe checkout page */}
        <section className="pt-10 text-center">
          {!showPromoInfo ? (
            <button
              onClick={() => setShowPromoInfo(true)}
              className="text-sm font-medium text-terracotta-deep hover:underline underline-offset-4 bg-transparent border-none cursor-pointer"
            >
              Have a promo code?
            </button>
          ) : (
            <p className="text-sm text-sage max-w-xs mx-auto">
              Choose any amount above and continue. You can enter your promo
              code on the secure payment page and your discount will be
              applied there.
            </p>
          )}
        </section>
      </main>
    </div>
  );
}

export default PricingSelection;
