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
      <div className="bc-card-bg rounded-2xl p-5 shadow-xl border text-center" style={{borderColor: '#495a58'}}>
        <div className="text-2xl mb-1">✉️</div>
        <p className="text-base font-bold" style={{color: '#303636'}}>
          You're on the list!
        </p>
        <p className="text-sm" style={{color: '#495a58'}}>
          We'll keep your tour link handy for when you're ready.
        </p>
      </div>
    );
  }

  return (
    <div className="bc-card-bg rounded-2xl p-6 shadow-xl border" style={{borderColor: '#495a58'}}>
      <h2 className="text-xl font-bold mb-1 text-center" style={{color: '#303636'}}>
        {title || 'Not Touring Today?'}
      </h2>
      <p className="text-sm text-center mb-4" style={{color: '#495a58'}}>
        {subtitle || "Leave your email and we'll keep your tour link ready for your visit — no spam, just the link."}
      </p>
      <div className="flex gap-2">
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
          className="flex-1 min-w-0 p-3 rounded-xl border-2 text-base"
          style={{borderColor: '#d4967d', color: '#303636', backgroundColor: 'white'}}
        />
        <button
          onClick={handleSubmit}
          disabled={status === 'sending' || !email.trim()}
          className="px-5 py-3 rounded-xl text-white font-bold disabled:opacity-50 flex-shrink-0"
          style={{backgroundColor: '#d4967d'}}
        >
          {status === 'sending' ? '…' : 'Send'}
        </button>
      </div>
      {error && (
        <p className="text-sm mt-2 px-3 py-2 rounded-lg" style={{backgroundColor: '#fee2e2', color: '#991b1b'}}>
          {error}
        </p>
      )}
    </div>
  );
}

export default EmailCapture;
