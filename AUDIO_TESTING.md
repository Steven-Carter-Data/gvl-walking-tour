# 🎧 Audio Integration Testing Guide

## ✅ What's Been Completed

1. **Audio File Integration**
   - Liberty Bridge sample audio (`Liberty_bridge_sample.m4a`) moved to `/public/audio/`
   - JSON data updated to use real audio URL: `/audio/Liberty_bridge_sample.m4a`
   - Build system configured to include audio files in production

2. **Testing Infrastructure**
   - Audio Test Panel component created for debugging
   - Preview server running at `http://localhost:4173/`
   - Build system working correctly

## 🧪 Testing Steps

### 1. Basic Audio Playback Test

**Access the app:**
- Open `http://localhost:4173/` in your browser
- Look for the "🎧 Audio Test Panel" in the bottom-right corner

**Test the audio:**
- Click "▶️ Play" button
- Listen for the Liberty Bridge narration
- Verify audio controls work (pause, volume)
- Check for any error messages

### 2. Preview Flow Test

**Test the preview experience:**
1. On the welcome screen, click "Play Preview"
2. Should display preview information for Liberty Bridge
3. Audio should be ready to play (though manual trigger needed due to browser autoplay restrictions)

### 3. Full Tour Flow Test

**Test complete user journey:**
1. Click "Demo Purchase (Skip Payment)" on payment screen
2. Navigate to tour map
3. Click on Liberty Bridge marker
4. Audio player should open with real audio content
5. Test play/pause/skip controls

### 4. Mobile Browser Test

**Test on mobile devices:**
- iOS Safari: Test autoplay restrictions and touch controls
- Android Chrome: Verify GPS accuracy and audio playback
- Check responsive design and touch interactions

## 🔍 What to Look For

### ✅ Success Indicators
- Audio loads without errors
- Clear narration about Liberty Bridge and Falls Park
- Audio controls respond correctly
- File size is reasonable (~1-3MB for 3-minute audio)
- No console errors in browser developer tools

### ⚠️ Potential Issues
- **Autoplay blocked**: Normal behavior - users must tap play first
- **Format compatibility**: M4A should work in most browsers
- **Loading delays**: Check network tab for file download
- **Console errors**: Check browser dev tools for JavaScript errors

## 🔧 Technical Details

### Audio File Location
```
/public/audio/Liberty_bridge_sample.m4a
```

### JSON Configuration
```json
{
  "audio_url": "/audio/Liberty_bridge_sample.m4a",
  "description": "Welcome to Greenville's Liberty Bridge..."
}
```

### Browser Support
- **M4A format**: Supported by Safari, Chrome, Firefox
- **Alternative formats**: Can convert to MP3 if needed
- **File size**: Current file should be optimized for mobile

## 🚀 Next Steps After Testing

### If Audio Works Well:
1. Remove the temporary AudioTestPanel component
2. Record remaining 9 stops using same format/quality
3. Update all audio URLs in JSON data
4. Test GPS-triggered playback flow

### If Audio Needs Optimization:
1. **Format conversion**: Convert M4A to MP3 if compatibility issues
2. **File size reduction**: Compress audio for faster loading
3. **Quality adjustment**: Balance file size vs. audio quality

### Production Readiness:
1. Upload audio files to Firebase Storage
2. Update JSON to use Firebase URLs
3. Enable offline caching for audio files
4. Test with real GPS locations at Falls Park

## 📱 Mobile Testing Checklist

- [ ] Audio loads on mobile networks
- [ ] Touch controls work properly
- [ ] Volume controls function
- [ ] Audio continues when screen locks
- [ ] No battery drain issues
- [ ] Works in landscape orientation

## 🐛 Common Issues & Solutions

**Audio won't play:**
- Check browser console for errors
- Verify file path is correct
- Test with different browser
- Ensure user gesture triggered playback

**Poor audio quality:**
- Check original file quality
- Consider different compression settings
- Test on various devices/speakers

**Slow loading:**
- Monitor file size (should be <3MB)
- Consider audio compression
- Test on slower networks

---

**Ready to test?** Open `http://localhost:4173/` and start with the Audio Test Panel!