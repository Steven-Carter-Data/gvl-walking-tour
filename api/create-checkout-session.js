// Vercel serverless function for Stripe checkout session
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { tourId, price, currency } = req.body;

    // Validate input
    if (!tourId || !price || !currency) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: currency.toLowerCase(),
            product_data: {
              name: 'Falls Park Historical Tour',
              description: 'Self-guided audio tour with GPS triggers',
              images: [
                'https://example.com/tour-image.jpg' // Replace with actual image
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
      },
      customer_creation: 'if_required',
      billing_address_collection: 'auto',
    });

    res.status(200).json({ id: session.id });
  } catch (error) {
    console.error('Stripe session creation error:', error);
    res.status(500).json({ error: error.message });
  }
}