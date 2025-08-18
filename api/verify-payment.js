// Vercel serverless function for payment verification
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

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
    res.status(500).json({ error: error.message });
  }
}