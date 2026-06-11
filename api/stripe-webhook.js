// Vercel serverless function: Stripe webhook handler
//
// Server-side record of payment events, independent of the client redirect.
// If a customer pays but never lands back on the success page, this is the
// proof of purchase (visible in Vercel function logs and Stripe Dashboard),
// and support can restore their access via /api/restore-purchase.
//
// Setup (one time):
// 1. Stripe Dashboard → Developers → Webhooks → Add endpoint
//    URL: https://<your-domain>/api/stripe-webhook
//    Events: checkout.session.completed, charge.refunded, charge.dispute.created
// 2. Copy the signing secret (whsec_...) and set it in Vercel:
//    vercel env add STRIPE_WEBHOOK_SECRET production
import Stripe from 'stripe';

// Signature verification requires the raw request body
export const config = {
  api: {
    bodyParser: false,
  },
};

async function readRawBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    console.error('Stripe webhook env vars not configured');
    return res.status(500).json({ error: 'Webhook not configured' });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  let event;
  try {
    const rawBody = await readRawBody(req);
    event = stripe.webhooks.constructEvent(
      rawBody,
      req.headers['stripe-signature'],
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    console.error('Webhook signature verification failed:', error.message);
    return res.status(400).json({ error: 'Invalid signature' });
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      // Structured audit log — searchable in Vercel logs
      console.log('PURCHASE_COMPLETED', JSON.stringify({
        session_id: session.id,
        payment_status: session.payment_status,
        amount_total: session.amount_total,
        currency: session.currency,
        customer: session.customer,
        customer_email: session.customer_details?.email,
        metadata: session.metadata,
      }));
      break;
    }
    case 'charge.refunded': {
      const charge = event.data.object;
      console.log('CHARGE_REFUNDED', JSON.stringify({
        charge_id: charge.id,
        payment_intent: charge.payment_intent,
        amount_refunded: charge.amount_refunded,
        customer_email: charge.billing_details?.email,
      }));
      break;
    }
    case 'charge.dispute.created': {
      const dispute = event.data.object;
      console.log('DISPUTE_CREATED', JSON.stringify({
        dispute_id: dispute.id,
        charge_id: dispute.charge,
        amount: dispute.amount,
        reason: dispute.reason,
      }));
      break;
    }
    default:
      console.log('Unhandled webhook event:', event.type);
  }

  return res.status(200).json({ received: true });
}
