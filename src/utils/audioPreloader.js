// Simple audio preloader for offline tour experience
export class AudioPreloader {
  constructor() {
    this.audioElements = new Map();
    this.loadingProgress = 0;
    this.totalFiles = 0;
    this.loadedFiles = 0;
  }

  async preloadAudioFiles(audioUrls, onProgress = null) {
    this.totalFiles = audioUrls.length;
    this.loadedFiles = 0;
    this.loadingProgress = 0;

    const loadPromises = audioUrls.map((url, index) =>
      this.preloadSingleFile(url, index, onProgress)
    );

    try {
      await Promise.all(loadPromises);
      return { success: true, message: 'All audio files loaded successfully!' };
    } catch (error) {
      console.error('Failed to preload some audio files:', error);
      return { success: false, message: 'Some audio files failed to load. Tour will still work but may buffer.' };
    }
  }

  preloadSingleFile(url, index, onProgress) {
    return new Promise((resolve, reject) => {
      const audio = new Audio();

      audio.addEventListener('canplaythrough', () => {
        this.audioElements.set(url, audio);
        this.loadedFiles++;
        this.loadingProgress = Math.round((this.loadedFiles / this.totalFiles) * 100);

        if (onProgress) {
          onProgress(this.loadingProgress, this.loadedFiles, this.totalFiles);
        }

        resolve(audio);
      });

      audio.addEventListener('error', () => {
        console.warn(`Failed to preload audio: ${url}`);
        // Don't reject - allow tour to continue with streaming
        this.loadedFiles++;
        this.loadingProgress = Math.round((this.loadedFiles / this.totalFiles) * 100);

        if (onProgress) {
          onProgress(this.loadingProgress, this.loadedFiles, this.totalFiles);
        }

        resolve(null);
      });

      // Preload the audio
      audio.preload = 'auto';
      audio.src = url;
      audio.load();
    });
  }

  // Check if an audio file is preloaded
  isPreloaded(url) {
    return this.audioElements.has(url);
  }

  // Get preloaded audio element (for faster playback)
  getPreloadedAudio(url) {
    return this.audioElements.get(url);
  }

  // Get current loading progress
  getProgress() {
    return {
      percentage: this.loadingProgress,
      loaded: this.loadedFiles,
      total: this.totalFiles
    };
  }
}

// Export a singleton instance
export const audioPreloader = new AudioPreloader();