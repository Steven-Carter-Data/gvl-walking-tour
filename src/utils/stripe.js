import stripePromise from '../config/stripe.js';

export const createPaymentSession = async (tourData) => {
  try {
    // In production, this would call your backend API to create a Stripe checkout session
    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tourId: tourData.tour_id,
        price: tourData.price,
        currency: tourData.currency,
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
    // In production, verify payment status with your backend
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