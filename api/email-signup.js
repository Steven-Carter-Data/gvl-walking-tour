// Vercel serverless function: capture a visitor email before purchase
//
// Stores the signup as a Stripe Customer (metadata.source = 'email_capture')
// so the list lives in the Stripe Dashboard next to real purchase data — no
// separate database needed. If the visitor later buys, checkout's
// customer_creation links the purchase to the same email for win-back lookup.
import Stripe from 'stripe';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    console.error('STRIPE_SECRET_KEY environment variable is not set');
    return res.status(500).json({ error: 'Signup service not configured' });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  try {
    const { email, source } = req.body || {};

    if (!email || typeof email !== 'string' || !EMAIL_RE.test(email.trim()) || email.length > 254) {
      return res.status(400).json({ success: false, error: 'Valid email required' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    // Only accept known UI surfaces so the metadata stays queryable
    const allowedSources = ['landing', 'win_back'];
    const signupSource = allowedSources.includes(source) ? source : 'landing';

    // Don't create duplicate customers for repeat signups
    const existing = await stripe.customers.list({ email: normalizedEmail, limit: 1 });
    if (existing.data.length > 0) {
      return res.status(200).json({ success: true, existing: true });
    }

    await stripe.customers.create({
      email: normalizedEmail,
      metadata: {
        source: 'email_capture',
        capture_surface: signupSource,
        tour_id: 'falls-park-greenville',
      },
    });

    console.log('EMAIL_SIGNUP', JSON.stringify({ email: normalizedEmail, source: signupSource }));

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Email signup error:', error);
    return res.status(500).json({ success: false, error: 'Signup failed' });
  }
}
