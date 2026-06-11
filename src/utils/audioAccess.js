// Client side of the signed-audio scheme (see middleware.js + api/audio-token.js).
//
// Paid audio URLs need ?token=&expires= appended or the edge middleware
// returns 403. The token lives 7 days and is cached in localStorage so the
// signed URL stays byte-identical across visits — that keeps the browser's
// HTTP cache valid for offline playback in the park.
import { getStoredAccessSessionId } from './stripe.js';

const TOKEN_STORAGE_KEY = 'audio_access_token';
// Refresh when less than a day remains so an offline park visit never
// starts with a nearly-expired token
const REFRESH_THRESHOLD_SECONDS = 24 * 60 * 60;

// Keep in sync with FREE_FILES in middleware.js
const FREE_AUDIO_FILES = [
  'preview-sample.wav',
  '0_welcome.wav',
  'cradle-of-greenville.wav',
];

export const isFreeAudio = (url) =>
  FREE_AUDIO_FILES.some((file) => url.split('?')[0].endsWith(file));

const readCachedToken = () => {
  try {
    const cached = JSON.parse(localStorage.getItem(TOKEN_STORAGE_KEY) || 'null');
    if (cached && cached.token && Number(cached.expires) * 1000 > Date.now()) {
      return cached;
    }
  } catch {
    // corrupt cache — treat as missing
  }
  return null;
};

export const getAudioToken = async () => {
  const cached = readCachedToken();
  const now = Math.floor(Date.now() / 1000);
  if (cached && cached.expires - now > REFRESH_THRESHOLD_SECONDS) {
    return cached;
  }

  const sessionId = getStoredAccessSessionId();
  // Demo grants only exist in local dev where the middleware doesn't run
  if (!sessionId || sessionId === 'demo') {
    return cached;
  }

  try {
    const response = await fetch(`/api/audio-token?session_id=${encodeURIComponent(sessionId)}`);
    if (!response.ok) return cached;
    const data = await response.json();
    if (data.token && data.expires) {
      localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(data));
      return data;
    }
  } catch {
    // offline — fall back to whatever cached token remains
  }
  return cached;
};

// Resolve the playable URL for a stop's audio: free files pass through,
// paid files get the signed query pair appended.
export const getSignedAudioUrl = async (url) => {
  if (!url || isFreeAudio(url)) return url;
  const tokenData = await getAudioToken();
  if (!tokenData) return url;
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}token=${tokenData.token}&expires=${tokenData.expires}`;
};
