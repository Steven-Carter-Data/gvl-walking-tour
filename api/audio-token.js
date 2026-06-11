// Vercel serverless function: issue a signed audio-access token
//
// The audio files under /audio/ are otherwise publicly guessable static
// assets. middleware.js requires a valid token+expires query pair on every
// non-free file; this endpoint hands that pair out only after re-verifying
// the caller's checkout session against Stripe.
//
// Token = HMAC-SHA256(expires, secret) hex. The 7-day lifetime keeps the
// signed URL stable across visits so the browser's HTTP cache still works
// offline in the park; the client refreshes it when <24h remain.
import Stripe from 'stripe';
import crypto from 'crypto';

const TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60;

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    console.error('STRIPE_SECRET_KEY environment variable is not set');
    return res.status(500).json({ error: 'Audio token service not configured' });
  }

  const secret = process.env.AUDIO_TOKEN_SECRET || process.env.STRIPE_SECRET_KEY;
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  try {
    const { session_id } = req.query;

    if (!session_id || !/^cs_\w+$/.test(session_id) || session_id.length > 200) {
      return res.status(400).json({ error: 'Invalid session_id' });
    }

    const session = await stripe.checkout.sessions.retrieve(session_id);
    const isPaid = session.payment_status === 'paid' ||
                   session.payment_status === 'no_payment_required';

    if (!isPaid) {
      return res.status(403).json({ error: 'No completed purchase for this session' });
    }

    const expires = Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS;
    const token = crypto.createHmac('sha256', secret).update(String(expires)).digest('hex');

    return res.status(200).json({ token, expires });
  } catch (error) {
    if (error.code === 'resource_missing' || error.statusCode === 404) {
      return res.status(404).json({ error: 'Session not found' });
    }
    console.error('Audio token error:', error);
    return res.status(500).json({ error: 'Token issue failed' });
  }
}
