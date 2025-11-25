import { useState, useEffect } from 'react';
import { ga4 } from '../services/analytics.js';

function GroupShareLink() {
  const [shareCode, setShareCode] = useState(null);
  const [copied, setCopied] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // Check if user has a group purchase
    const paymentSession = localStorage.getItem('payment_session');
    if (paymentSession) {
      try {
        const session = JSON.parse(paymentSession);
        // Generate a shareable code based on the session
        const code = generateShareCode(session);
        setShareCode(code);
      } catch (e) {
        console.error('Failed to parse payment session:', e);
      }
    }
  }, []);

  const generateShareCode = (session) => {
    // Create a simple share code from session ID
    const sessionId = session?.id || localStorage.getItem('payment_session_id') || '';
    if (!sessionId) return null;

    // Create a shortened code (last 8 characters of session ID)
    const shortCode = sessionId.slice(-8).toUpperCase();
    return shortCode;
  };

  const getShareUrl = () => {
    if (!shareCode) return 'https://tours.basecampdataanalytics.com';
    return `https://tours.basecampdataanalytics.com/?group=${shareCode}`;
  };

  const handleCopyLink = async () => {
    const url = getShareUrl();
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      ga4.shareClicked('group_link_copy');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join My Falls Park Tour',
          text: 'I got us access to this self-guided tour of Falls Park! Use this link to start:',
          url: getShareUrl()
        });
        ga4.shareClicked('group_native_share');
      } catch (err) {
        if (err.name !== 'AbortError') {
          handleCopyLink();
        }
      }
    } else {
      handleCopyLink();
    }
  };

  if (!shareCode) return null;

  return (
    <>
      {/* Floating Share Button */}
      <button
        onClick={() => setShowModal(true)}
        className="fixed bottom-24 right-4 z-40"
        style={{
          backgroundColor: '#d4967d',
          color: 'white',
          border: 'none',
          borderRadius: '50%',
          width: '56px',
          height: '56px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          cursor: 'pointer',
          fontSize: '24px'
        }}
        title="Share with your group"
      >
        👥
      </button>

      {/* Share Modal */}
      {showModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 50,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
          onClick={(e) => e.target === e.currentTarget && setShowModal(false)}
        >
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              padding: '24px',
              maxWidth: '400px',
              width: '100%',
              position: 'relative'
            }}
          >
            {/* Close Button */}
            <button
              onClick={() => setShowModal(false)}
              style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                background: 'none',
                border: 'none',
                fontSize: '20px',
                cursor: 'pointer',
                color: '#6B7280'
              }}
            >
              ✕
            </button>

            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>👥</div>
              <h2 style={{ color: '#303636', margin: '0 0 8px 0', fontSize: '20px' }}>
                Share with Your Group
              </h2>
              <p style={{ color: '#495a58', margin: 0, fontSize: '14px' }}>
                Everyone in your group can use this link to access the tour
              </p>
            </div>

            {/* Share Code Display */}
            <div
              style={{
                backgroundColor: '#e5e3dc',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '16px',
                textAlign: 'center'
              }}
            >
              <p style={{ color: '#495a58', fontSize: '12px', margin: '0 0 8px 0' }}>
                Your Group Code
              </p>
              <p
                style={{
                  color: '#d4967d',
                  fontSize: '24px',
                  fontWeight: 'bold',
                  fontFamily: 'monospace',
                  letterSpacing: '2px',
                  margin: 0
                }}
              >
                {shareCode}
              </p>
            </div>

            {/* Share Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {navigator.share && (
                <button
                  onClick={handleShareNative}
                  style={{
                    backgroundColor: '#d4967d',
                    color: 'white',
                    border: 'none',
                    padding: '14px 20px',
                    borderRadius: '12px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  📤 Share Link with Group
                </button>
              )}

              <button
                onClick={handleCopyLink}
                style={{
                  backgroundColor: copied ? '#10B981' : '#e5e3dc',
                  color: copied ? 'white' : '#495a58',
                  border: '1px solid #d4967d',
                  padding: '14px 20px',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'all 0.2s ease'
                }}
              >
                {copied ? '✓ Link Copied!' : '🔗 Copy Link'}
              </button>
            </div>

            {/* Instructions */}
            <div
              style={{
                marginTop: '20px',
                padding: '12px',
                backgroundColor: '#FEF3C7',
                borderRadius: '8px'
              }}
            >
              <p style={{ color: '#92400E', fontSize: '12px', margin: 0 }}>
                <strong>Tip:</strong> Share this link via text, WhatsApp, or email. Everyone can listen together on their own device!
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default GroupShareLink;
