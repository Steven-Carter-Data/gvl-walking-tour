// Vercel serverless function for payment verification
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check if Stripe secret key is configured
  if (!process.env.STRIPE_SECRET_KEY) {
    console.error('STRIPE_SECRET_KEY environment variable is not set');
    return res.status(500).json({ error: 'Payment verification not configured' });
  }

  const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

  try {
    const { session_id } = req.query;

    if (!session_id) {
      return res.status(400).json({ error: 'Missing session_id' });
    }

    // Retrieve the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(session_id);

    // Check payment status
    const isComplete = session.payment_status === 'paid';

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