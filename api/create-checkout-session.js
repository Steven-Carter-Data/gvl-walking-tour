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

    // Validate minimum price (Stripe enforces $0.50 minimum for USD)
    if (price < 0.50) {
      return res.status(400).json({ error: 'Minimum price is $0.50 (Stripe requirement)' });
    }

    // Get tour config or use default
    const tourConfig = TOUR_CONFIGS[tourId] || TOUR_CONFIGS['falls-park-greenville'];

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
            unit_amount: Math.round(price * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${req.headers.origin}/?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin}/?cancelled=true`,
      metadata: {
        tourId,
        groupType: groupType || 'individual',
        groupSize: groupSize || '1',
        paymentAmount: price.toString(),
        isCustomAmount: req.body.isCustomAmount ? 'true' : 'false',
      },
      customer_creation: 'if_required',
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
