// Vercel serverless function for Stripe checkout session
import Stripe from 'stripe';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check if Stripe secret key is configured
  if (!process.env.STRIPE_SECRET_KEY) {
    console.error('STRIPE_SECRET_KEY environment variable is not set');
    return res.status(500).json({ error: 'Payment processing not configured' });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  try {
    const { tourId, price, currency, groupType, groupSize } = req.body;

    // Validate input
    if (!tourId || !price || !currency) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate minimum price (Stripe requires minimum $0.50 for USD)
    if (price < 0.50) {
      return res.status(400).json({ error: 'Minimum price is $0.50' });
    }

    // Get product name based on group type
    const getProductName = (groupType) => {
      switch(groupType) {
        case 'individual':
          return 'Falls Park Historical Tour - Individual';
        case 'small-group':
          return 'Falls Park Historical Tour - Small Group (2-4 people)';
        case 'large-group':
          return 'Falls Park Historical Tour - Large Group (5+ people)';
        default:
          return 'Falls Park Historical Tour';
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
              description: 'Self-guided audio tour with GPS triggers around Falls Park in Greenville, SC',
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
      success_url: `${req.headers.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin}/payment?cancelled=true`,
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
    
    // More detailed error logging
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