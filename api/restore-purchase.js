// Vercel serverless function: restore a purchase by email
//
// Lets a buyer regain tour access on a new device (or after the post-payment
// redirect failed) by entering the email they used at checkout. Looks up the
// Stripe Customer by email and returns their most recent paid checkout
// session id; the client then runs the normal verify-payment flow with it.
//
// Note: requires the checkout session to have created a Customer
// (customer_creation: 'always' in create-checkout-session.js). Guest
// purchases made before that change won't be found here — those go through
// support email.
import Stripe from 'stripe';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    console.error('STRIPE_SECRET_KEY environment variable is not set');
    return res.status(500).json({ error: 'Payment service not configured' });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  try {
    const { email } = req.body || {};

    if (!email || typeof email !== 'string' || !EMAIL_RE.test(email.trim()) || email.length > 254) {
      return res.status(400).json({ found: false, error: 'Valid email required' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const customers = await stripe.customers.list({ email: normalizedEmail, limit: 10 });

    let latestPaidSession = null;
    for (const customer of customers.data) {
      const sessions = await stripe.checkout.sessions.list({ customer: customer.id, limit: 20 });
      for (const session of sessions.data) {
        const isPaid = session.payment_status === 'paid' ||
                       session.payment_status === 'no_payment_required';
        if (isPaid && (!latestPaidSession || session.created > latestPaidSession.created)) {
          latestPaidSession = session;
        }
      }
    }

    if (!latestPaidSession) {
      return res.status(200).json({ found: false });
    }

    console.log('PURCHASE_RESTORED', JSON.stringify({
      session_id: latestPaidSession.id,
      email: normalizedEmail,
    }));

    return res.status(200).json({
      found: true,
      session_id: latestPaidSession.id,
    });
  } catch (error) {
    console.error('Restore purchase error:', error);
    return res.status(500).json({ found: false, error: 'Lookup failed' });
  }
}
