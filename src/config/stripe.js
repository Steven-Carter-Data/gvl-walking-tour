import { loadStripe } from '@stripe/stripe-js';

// Handle missing Stripe key gracefully in production
const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

const stripePromise = stripeKey ? loadStripe(stripeKey) : Promise.resolve(null);

export default stripePromise;