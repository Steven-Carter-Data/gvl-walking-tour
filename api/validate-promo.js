// Vercel serverless function for promo code validation
// Promo codes are validated server-side to prevent client-side exposure

const VALID_PROMO_CODES = {
  'ADMIN2024': { type: 'full_access', description: 'Admin access' },
  'REVIEW': { type: 'full_access', description: 'Reviewer access' },
  'TOUR_DEV': { type: 'full_access', description: 'Developer access' },
};

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { code } = req.body;

    if (!code || typeof code !== 'string') {
      return res.status(400).json({ valid: false, error: 'Promo code is required' });
    }

    const normalizedCode = code.trim().toUpperCase();
    const promoEntry = VALID_PROMO_CODES[normalizedCode];

    if (promoEntry) {
      return res.status(200).json({
        valid: true,
        type: promoEntry.type,
      });
    }

    return res.status(200).json({ valid: false, error: 'Invalid promo code' });
  } catch (error) {
    console.error('Promo validation error:', error);
    return res.status(500).json({ valid: false, error: 'Server error' });
  }
}
