import { useState } from 'react';
import { ga4 } from '../services/analytics.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Pre-purchase email capture - the only way to reach visitors who leave
// without buying. Signups are stored as Stripe customers via /api/email-signup.
function EmailCapture({ source = 'landing', title, subtitle }) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState(() =>
    localStorage.getItem('email_captured') ? 'done' : 'idle'
  );
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    const trimmed = email.trim();
    if (!EMAIL_RE.test(trimmed)) {
      setError('Please enter a valid email address');
      return;
    }

    setStatus('sending');
    setError(null);
    try {
      const response = await fetch('/api/email-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmed, source }),
      });
      const data = await response.json();

      if (data.success) {
        localStorage.setItem('email_captured', 'true');
        setStatus('done');
        ga4.event('email_signup', { source });
      } else {
        setStatus('idle');
        setError(data.error || 'Something went wrong. Please try again.');
      }
    } catch (err) {
      console.error('Email signup error:', err);
      setStatus('idle');
      setError('Could not save your email right now. Please try again.');
    }
  };

  if (status === 'done') {
    return (
      <div>
        <p className="kicker mb-3">For Later</p>
        <p className="font-bold text-ink text-lg">You're on the list ✓</p>
        <p className="text-sage text-sm mt-1">
          We'll keep your tour link handy for when you're ready.
        </p>
      </div>
    );
  }

  return (
    <div>
      <p className="kicker mb-3">For Later</p>
      <h2 className="display-h text-3xl mb-2">{title || 'Not touring today?'}</h2>
      <p className="text-sage text-[15px] mb-6">
        {subtitle || "Leave your email and we'll keep your tour link ready for your visit — no spam, just the link."}
      </p>
      <div className="flex items-end gap-3">
        <input
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setError(null);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && status !== 'sending') handleSubmit();
          }}
          placeholder="you@example.com"
          className="input-line flex-1 min-w-0"
        />
        <button
          onClick={handleSubmit}
          disabled={status === 'sending' || !email.trim()}
          aria-label="Send"
          className="btn-primary flex-shrink-0"
          style={{ width: 'auto', padding: '0.7rem 1.5rem', fontSize: '0.95rem' }}
        >
          {status === 'sending' ? '…' : 'Send →'}
        </button>
      </div>
      {error && (
        <p className="text-sm mt-3 px-3 py-2 rounded-xl bg-red-100 text-red-900">
          {error}
        </p>
      )}
    </div>
  );
}

export default EmailCapture;
