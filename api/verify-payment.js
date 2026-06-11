// Vercel serverless function for payment verification
import Stripe from 'stripe';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check if Stripe secret key is configured
  if (!process.env.STRIPE_SECRET_KEY) {
    console.error('STRIPE_SECRET_KEY environment variable is not set');
    return res.status(500).json({ error: 'Payment verification not configured' });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  try {
    const { session_id } = req.query;

    if (!session_id || !/^cs_\w+$/.test(session_id) || session_id.length > 200) {
      return res.status(400).json({ status: 'invalid', error: 'Invalid session_id' });
    }

    // Retrieve the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(session_id);

    // 'paid' for normal purchases; 'no_payment_required' when a 100%-off
    // promotion code was applied at checkout
    const isComplete = session.payment_status === 'paid' ||
                       session.payment_status === 'no_payment_required';

    res.status(200).json({
      status: isComplete ? 'complete' : 'incomplete',
      session: {
        id: session.id,
        payment_status: session.payment_status,
        amount_total: session.amount_total,
        currency: session.currency,
        customer_email: session.customer_details?.email,
        metadata: session.metadata
      }
    });

  } catch (error) {
    console.error('Payment verification error:', error);

    // Session id doesn't exist in Stripe — a definitive "no", not a server error
    if (error.code === 'resource_missing' || error.statusCode === 404) {
      return res.status(404).json({ status: 'invalid', error: 'Session not found' });
    }

    if (error.type === 'StripeAuthenticationError') {
      console.error('Stripe Authentication Error - Invalid API key');
      return res.status(500).json({ 
        error: 'Payment verification service error',
        details: 'Invalid API key'
      });
    }
    
    return res.status(500).json({ 
      error: 'Payment verification failed', 
      details: error.message,
      type: error.type || 'unknown'
    });
  }
}