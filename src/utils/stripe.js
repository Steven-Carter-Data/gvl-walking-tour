import stripePromise from '../config/stripe.js';

export const createPaymentSession = async (paymentData) => {
  try {
    // For development, create a mock Stripe session or direct integration
    const isDevelopment = import.meta.env.DEV;
    
    if (isDevelopment) {
      // In development, create Stripe session directly on client side for testing
      const stripe = await stripePromise;
      
      // Mock checkout session creation (you would replace this with actual Stripe test mode)
      console.log('Development mode: Mock payment session created', paymentData);
      
      // For now, simulate successful payment redirect
      // In real development, you'd set up a local server or use Stripe's test mode
      alert(`Development Mode: Would process payment of $${paymentData.amount} for ${paymentData.type} tour. 

For testing with real Stripe:
1. Set up a local server to handle /api/create-checkout-session
2. Or deploy to Vercel for testing
3. Use test card: 4242 4242 4242 4242`);
      
      return { success: false, error: 'Development mode - deploy to test Stripe integration' };
    }
    
    // Production: Call backend API to create a Stripe checkout session
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