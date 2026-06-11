import stripePromise from '../config/stripe.js';

// localStorage key holding the Stripe checkout session id that granted
// access. This id is re-validated against Stripe on app load — a forged
// value fails server verification and access is revoked.
export const ACCESS_SESSION_KEY = 'tour_access_session';

// Demo mode only ever runs in a local dev build, never on the deployed site
const isDemoEnvironment = () =>
  import.meta.env.DEV &&
  ['localhost', '127.0.0.1'].includes(window.location.hostname);

export const createPaymentSession = async (paymentData) => {
  try {
    // In development, allow testing with Stripe test mode
    // Set VITE_ENABLE_STRIPE_DEV=true in .env.local to enable
    const enableStripeInDev = import.meta.env.VITE_ENABLE_STRIPE_DEV === 'true';

    if (isDemoEnvironment() && !enableStripeInDev) {
      // Development mode without Stripe - offer demo mode
      console.log('Development mode: Payment data', paymentData);

      const useDemoMode = window.confirm(
        `Development Mode\n\nAmount: $${paymentData.amount}\n\nClick OK to simulate successful payment and access the tour.\nClick Cancel to test the full Stripe flow (requires deployment).`
      );

      if (useDemoMode) {
        localStorage.setItem(ACCESS_SESSION_KEY, 'demo');
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
    const response = await fetch(`/api/verify-payment?session_id=${encodeURIComponent(sessionId)}`);
    const data = await response.json();

    return {
      success: data.status === 'complete',
      session: data.session
    };
  } catch (error) {
    console.error('Payment verification error:', error);
    return { success: false, error: error.message };
  }
};

// Returns the session id behind the current access claim, migrating older
// storage formats ('payment_session' JSON) when found. Returns 'demo' for a
// dev demo grant, or null when there is no usable claim.
export const getStoredAccessSessionId = () => {
  const direct = localStorage.getItem(ACCESS_SESSION_KEY);
  if (direct) return direct;

  const stored = localStorage.getItem('payment_session');
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      // Older builds stored either the session object directly or the whole
      // verify-payment response ({status, session: {...}})
      const id = parsed.id || parsed.session?.id;
      if (typeof id === 'string' && id.startsWith('cs_')) {
        localStorage.setItem(ACCESS_SESSION_KEY, id);
        return id;
      }
      const status = parsed.payment_status || parsed.session?.payment_status;
      if (status === 'demo_mode' || status === 'promo_code') {
        return 'demo';
      }
    } catch {
      // unparseable legacy value — treat as no claim
    }
  }
  return null;
};

export const hasStoredAccess = () => {
  return Boolean(getStoredAccessSessionId()) ||
         localStorage.getItem('tour_access') === 'granted';
};

export const revokeAccess = () => {
  localStorage.removeItem(ACCESS_SESSION_KEY);
  localStorage.removeItem('tour_access');
  localStorage.removeItem('tourPurchased');
  localStorage.removeItem('payment_session');
  localStorage.removeItem('promo_used');
};

// Confirms the stored access claim against Stripe.
// 'valid'   — Stripe confirms a completed payment
// 'invalid' — Stripe definitively rejects the claim (revoke access)
// 'unknown' — network/server problem; keep access so offline users in the
//             park aren't locked out
export const revalidateAccess = async () => {
  const sessionId = getStoredAccessSessionId();

  if (sessionId === 'demo') {
    return isDemoEnvironment() ? 'valid' : 'invalid';
  }

  if (!sessionId) return 'invalid';

  try {
    const response = await fetch(`/api/verify-payment?session_id=${encodeURIComponent(sessionId)}`);

    if (response.status === 400 || response.status === 404) return 'invalid';
    if (!response.ok) return 'unknown';

    const data = await response.json();
    return data.status === 'complete' ? 'valid' : 'invalid';
  } catch {
    return 'unknown';
  }
};
