// Vercel Edge Middleware: gate the paid tour audio behind a signed token.
//
// Runs before static file serving for every /audio/* request. Free files
// (preview sample, welcome message, and the free Stop 1 sample) pass through
// untouched; everything else needs the token+expires pair issued by
// /api/audio-token after a Stripe purchase check.
//
// Keep FREE_FILES in sync with FREE_AUDIO_FILES in src/utils/audioAccess.js.

/* global process */

export const config = {
  matcher: '/audio/:path*',
};

const FREE_FILES = new Set([
  'preview-sample.wav',
  '0_welcome.wav',
  'cradle-of-greenville.wav',
]);

async function hmacHex(message, secret) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(message));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

// Constant-time-ish comparison; avoids early-exit leaking prefix length
function safeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

export default async function middleware(request) {
  const url = new URL(request.url);
  const file = url.pathname.split('/').pop();

  if (FREE_FILES.has(file)) {
    return; // continue to the static asset
  }

  const secret = process.env.AUDIO_TOKEN_SECRET || process.env.STRIPE_SECRET_KEY;
  if (!secret) {
    // Misconfigured deployment — fail open so paying customers aren't blocked
    console.error('middleware: no AUDIO_TOKEN_SECRET/STRIPE_SECRET_KEY set; audio left unprotected');
    return;
  }

  const token = url.searchParams.get('token');
  const expires = url.searchParams.get('expires');

  if (token && expires && /^\d+$/.test(expires) && Number(expires) * 1000 > Date.now()) {
    const expected = await hmacHex(String(expires), secret);
    if (safeEqual(token, expected)) {
      return; // valid token — serve the file
    }
  }

  return new Response(
    JSON.stringify({ error: 'This audio is part of the full tour. Purchase at tours.basecampdataanalytics.com' }),
    { status: 403, headers: { 'Content-Type': 'application/json' } }
  );
}
