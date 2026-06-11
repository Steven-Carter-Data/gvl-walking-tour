// Vercel serverless function for Stripe checkout session
import Stripe from 'stripe';

// Tour configurations - can be expanded for multi-tour support
const TOUR_CONFIGS = {
  'falls-park-greenville': {
    name: 'Falls Park Self-Guided Walking Tour',
    description: 'Self-guided audio tour with GPS triggers around Falls Park in Greenville, SC',
    location: 'Greenville, SC',
  },
  'falls-park-historical-tour': {
    name: 'Falls Park Historical Tour',
    description: 'Self-guided audio tour with GPS triggers around Falls Park in Greenville, SC',
    location: 'Greenville, SC',
  },
  // Add more tours here as needed
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    console.error('STRIPE_SECRET_KEY environment variable is not set');
    return res.status(500).json({ error: 'Payment processing not configured' });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  try {
    const { tourId, price, currency, groupType, groupSize } = req.body;

    if (!tourId || !price || !currency) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Reject unknown tours instead of silently falling back
    const tourConfig = TOUR_CONFIGS[tourId];
    if (!tourConfig) {
      return res.status(400).json({ error: 'Unknown tour' });
    }

    // Server-side price bounds: Stripe minimum is $0.50; cap pay-what-you-want
    // amounts to prevent tampered or accidental extreme charges
    const numericPrice = Number(price);
    if (!Number.isFinite(numericPrice) || numericPrice < 0.50 || numericPrice > 200) {
      return res.status(400).json({ error: 'Price must be between $0.50 and $200' });
    }

    if (currency.toLowerCase() !== 'usd') {
      return res.status(400).json({ error: 'Unsupported currency' });
    }

    // Get product name based on group type
    const getProductName = (groupType) => {
      const baseName = tourConfig.name;
      switch(groupType) {
        case 'individual':
          return `${baseName} - Individual`;
        case 'small-group':
          return `${baseName} - Small Group (2-4 people)`;
        case 'large-group':
          return `${baseName} - Large Group (5+ people)`;
        default:
          return baseName;
      }
    };

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: currency.toLowerCase(),
            product_data: {
              name: getProductName(groupType),
              description: tourConfig.description,
              images: [
                `${req.headers.origin}/images/stripe-checkout-image.jpg`
              ],
            },
            unit_amount: Math.round(numericPrice * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${req.headers.origin}/?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin}/?cancelled=true`,
      // Promo/discount codes are managed in the Stripe Dashboard (Products →
      // Coupons → Promotion codes) and entered by the customer on the Stripe
      // checkout page. 100%-off codes complete with payment_status
      // 'no_payment_required', which verify-payment accepts.
      allow_promotion_codes: true,
      metadata: {
        tourId,
        groupType: groupType || 'individual',
        groupSize: groupSize || '1',
        paymentAmount: numericPrice.toString(),
        isCustomAmount: req.body.isCustomAmount ? 'true' : 'false',
      },
      // Always create a Customer so purchases can be restored by email later
      customer_creation: 'always',
      billing_address_collection: 'auto',
    });

    res.status(200).json({ id: session.id });
  } catch (error) {
    console.error('Stripe session creation error:', error);

    if (error.type === 'StripeInvalidRequestError') {
      console.error('Stripe Invalid Request:', error.message);
      return res.status(400).json({
        error: 'Invalid payment request',
        details: error.message
      });
    }

    if (error.type === 'StripeAuthenticationError') {
      console.error('Stripe Authentication Error - Invalid API key');
      return res.status(500).json({
        error: 'Payment service configuration error',
        details: 'Invalid API key'
      });
    }

    return res.status(500).json({
      error: 'Payment processing failed',
      details: error.message,
      type: error.type || 'unknown'
    });
  }
}
