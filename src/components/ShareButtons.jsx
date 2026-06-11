import { ga4 } from '../services/analytics.js';
import tourConfig from '../config/tourConfig.js';

function ShareButtons({ title, text, url }) {
  const shareUrl = url || tourConfig.share.url;
  const shareTitle = title || tourConfig.share.title;
  const shareText = text || tourConfig.share.text;

  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedText = encodeURIComponent(shareText);
  const encodedTitle = encodeURIComponent(shareTitle);

  const handleShare = async (platform) => {
    ga4.shareClicked(platform);

    // Try native share first on mobile
    if (platform === 'native' && navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl
        });
        return;
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.log('Native share failed, falling back to copy');
        }
      }
    }

    const shareLinks = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      whatsapp: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
      email: `mailto:?subject=${encodedTitle}&body=${encodedText}%20${encodedUrl}`,
      sms: `sms:?body=${encodedText}%20${encodedUrl}`
    };

    if (platform === 'copy') {
      try {
        await navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
        alert('Link copied to clipboard!');
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    } else if (shareLinks[platform]) {
      window.open(shareLinks[platform], '_blank', 'width=600,height=400');
    }
  };

  const ShareButton = ({ platform, icon, label, bgColor }) => (
    <button
      onClick={() => handleShare(platform)}
      className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium transition-all hover:transform hover:scale-105 hover:shadow-lg"
      style={{
        backgroundColor: bgColor,
        color: 'white',
        minWidth: '140px'
      }}
      title={`Share via ${label}`}
    >
      <span className="text-lg">{icon}</span>
      <span className="text-sm">{label}</span>
    </button>
  );

  return (
    <div className="w-full">
      <h3 className="text-lg font-bold mb-4 text-center" style={{ color: '#303636' }}>
        Share with Friends & Family
      </h3>

      {/* Native Share Button (mobile-first) */}
      {navigator.share && (
        <button
          onClick={() => handleShare('native')}
          className="w-full py-4 px-6 rounded-xl font-bold text-lg mb-4 transition-all hover:transform hover:scale-105"
          style={{
            backgroundColor: '#d4967d',
            color: 'white'
          }}
        >
          📤 Share Tour Link
        </button>
      )}

      {/* Social Media Grid */}
      <div className="grid grid-cols-2 gap-3">
        <ShareButton
          platform="whatsapp"
          icon="💬"
          label="WhatsApp"
          bgColor="#25D366"
        />
        <ShareButton
          platform="sms"
          icon="💌"
          label="Text"
          bgColor="#5856D6"
        />
        <ShareButton
          platform="facebook"
          icon="📘"
          label="Facebook"
          bgColor="#1877F2"
        />
        <ShareButton
          platform="twitter"
          icon="🐦"
          label="X/Twitter"
          bgColor="#1DA1F2"
        />
        <ShareButton
          platform="email"
          icon="📧"
          label="Email"
          bgColor="#495a58"
        />
        <ShareButton
          platform="copy"
          icon="🔗"
          label="Copy Link"
          bgColor="#6B7280"
        />
      </div>

      <p className="text-center text-xs mt-4" style={{ color: '#9CA3AF' }}>
        Share the experience! Your friends can explore at their own pace.
      </p>
    </div>
  );
}

export default ShareButtons;
