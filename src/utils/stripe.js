import stripePromise from '../config/stripe.js';

export const createPaymentSession = async (paymentData) => {
  try {
    const isDevelopment = import.meta.env.DEV;

    // In development, allow testing with Stripe test mode
    // Set VITE_ENABLE_STRIPE_DEV=true in .env.local to enable
    const enableStripeInDev = import.meta.env.VITE_ENABLE_STRIPE_DEV === 'true';

    if (isDevelopment && !enableStripeInDev) {
      // Development mode without Stripe - offer demo mode
      console.log('Development mode: Payment data', paymentData);

      const useDemoMode = window.confirm(
        `Development Mode\n\nAmount: $${paymentData.amount}\n\nClick OK to simulate successful payment and access the tour.\nClick Cancel to test the full Stripe flow (requires deployment).`
      );

      if (useDemoMode) {
        // Grant access in demo mode
        localStorage.setItem('tour_access', 'granted');
        localStorage.setItem('payment_session', JSON.stringify({
          amount_total: paymentData.amount * 100,
          payment_status: 'demo_mode',
          metadata: { demo: true, amount: paymentData.amount }
        }));
        window.location.href = '/?tour=true';
        return { success: true };
      }

      return { success: false, error: 'Demo mode cancelled - deploy to Vercel to test Stripe' };
    }

    // Production or dev with Stripe enabled: Call backend API
    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tourId: paymentData.tourId || 'falls-park-historical-tour',
        price: paymentData.amount,
        currency: paymentData.currency || 'usd',
        groupType: paymentData.type,
        groupSize: paymentData.groupSize,
        isCustomAmount: paymentData.isCustom || false,
      }),
    });

    const session = await response.json();

    if (session.error) {
      throw new Error(session.error);
    }

    const stripe = await stripePromise;

    // Redirect to Stripe checkout
    const result = await stripe.redirectToCheckout({
      sessionId: session.id,
    });

    if (result.error) {
      throw new Error(result.error.message);
    }

    return { success: true };
  } catch (error) {
    console.error('Payment session error:', error);
    return { success: false, error: error.message };
  }
};

export const verifyPayment = async (sessionId) => {
  try {
    // Check for demo mode payment
    const storedSession = localStorage.getItem('payment_session');
    if (storedSession) {
      const parsed = JSON.parse(storedSession);
      if (parsed.payment_status === 'demo_mode' || parsed.payment_status === 'promo_code') {
        return {
          success: true,
          session: parsed
        };
      }
    }

    // In production, verify payment status with backend
    const response = await fetch(`/api/verify-payment?session_id=${sessionId}`);
    const data = await response.json();

    return {
      success: data.status === 'complete',
      session: data
    };
  } catch (error) {
    console.error('Payment verification error:', error);
    return { success: false, error: error.message };
  }
};
