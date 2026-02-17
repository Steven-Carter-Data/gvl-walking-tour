import { useState, useEffect } from 'react';
import { ga4 } from '../services/analytics.js';

function ReviewPrompt({ stopsCompleted, totalStops, onDismiss }) {
  const [isVisible, setIsVisible] = useState(false);
  const [hasBeenShown, setHasBeenShown] = useState(false);

  // Show prompt when user has completed at least 5 stops or finished the tour
  useEffect(() => {
    const alreadyReviewed = localStorage.getItem('review_prompt_shown');
    const completionThreshold = Math.min(5, totalStops);

    if (!alreadyReviewed && stopsCompleted >= completionThreshold && !hasBeenShown) {
      // Delay showing the prompt to not interrupt the experience
      const timer = setTimeout(() => {
        setIsVisible(true);
        setHasBeenShown(true);
        ga4.reviewPromptShown();
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [stopsCompleted, totalStops, hasBeenShown]);

  const handleReviewClick = () => {
    ga4.reviewClicked();
    localStorage.setItem('review_prompt_shown', 'true');
    localStorage.setItem('review_prompt_clicked', 'true');
    window.open('https://g.page/r/ChIJcTkL5TIwWIgRZHZrqV-BIDA/review', '_blank');
    setIsVisible(false);
    onDismiss?.();
  };

  const handleDismiss = () => {
    localStorage.setItem('review_prompt_shown', 'true');
    setIsVisible(false);
    onDismiss?.();
  };

  const handleLater = () => {
    // Don't set localStorage so it can show again next time
    setIsVisible(false);
    onDismiss?.();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
        style={{ animation: 'slideUp 0.3s ease-out' }}
      >
        {/* Header */}
        <div className="p-6 text-center" style={{ backgroundColor: '#d4967d' }}>
          <div className="text-5xl mb-3">🎉</div>
          <h2 className="text-2xl font-bold text-white mb-1">
            You're Exploring Like a Pro!
          </h2>
          <p className="text-white opacity-90">
            {stopsCompleted} of {totalStops} stops completed
          </p>
        </div>

        {/* Body */}
        <div className="p-6">
          <p className="text-center mb-6" style={{ color: '#495a58' }}>
            Enjoying the Falls Park tour? A quick review helps other visitors discover Greenville's history!
          </p>

          {/* Star Rating Visual */}
          <div className="flex justify-center mb-6">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                className="text-3xl mx-1"
                style={{
                  color: '#FFD700',
                  textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
              >
                ★
              </span>
            ))}
          </div>

          {/* Primary CTA */}
          <button
            onClick={handleReviewClick}
            className="w-full py-4 px-6 rounded-xl text-white font-bold text-lg mb-3 transition-all hover:transform hover:scale-105"
            style={{ backgroundColor: '#d4967d' }}
          >
            ⭐ Leave a Quick Review
          </button>

          {/* Secondary Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleLater}
              className="flex-1 py-3 px-4 rounded-xl font-medium transition-all"
              style={{
                backgroundColor: '#e5e3dc',
                color: '#495a58',
                border: '1px solid #d4967d'
              }}
            >
              Maybe Later
            </button>
            <button
              onClick={handleDismiss}
              className="flex-1 py-3 px-4 rounded-xl font-medium transition-all"
              style={{
                backgroundColor: 'transparent',
                color: '#495a58'
              }}
            >
              No Thanks
            </button>
          </div>
        </div>

        {/* Footer note */}
        <div className="px-6 pb-4">
          <p className="text-center text-xs" style={{ color: '#9CA3AF' }}>
            Your feedback helps us improve and helps others find great experiences in Greenville
          </p>
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

export default ReviewPrompt;
