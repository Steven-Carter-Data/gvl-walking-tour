# 🎙️ Studio Recording Guide - Downtown Greenville Self-Guided Walking Tour

## 📋 Recording Session Preparation

### 🎯 **Recording Overview**
- **Total tracks**: 8 audio files (one per stop)
- **Duration per track**: 3-5 minutes each
- **Total recording time**: ~24-40 minutes of content
- **Estimated studio time**: 2-3 hours (including retakes and editing)

---

## 📁 **Audio File Naming Convention**

```
/public/audio/
├── stop-01-liberty-bridge.mp3
├── stop-02-reedy-falls.mp3
├── stop-03-west-end.mp3
├── stop-04-shoeless-joe.mp3
├── stop-05-peace-center.mp3
├── stop-06-old-courthouse.mp3
├── stop-07-one-city-plaza.mp3
└── stop-08-falls-park-gardens.mp3
```

---

## 🎧 **Technical Specifications for Studio**

### **Audio Format Requirements:**
- **Format**: MP3
- **Sample Rate**: 44.1 kHz or 48 kHz
- **Bit Rate**: 128 kbps (mono) or 192 kbps (stereo)
- **Channels**: Mono preferred (smaller file size, same quality for voice)
- **Levels**: Normalize to -16 to -20 LUFS

### **File Requirements:**
- **Silence**: 1-2 seconds at start and end
- **Noise Floor**: Remove background noise/room tone
- **Consistency**: Match volume levels across all 8 tracks
- **Length**: Keep each file under 5MB for mobile loading

---

## 🎬 **Recording Session Checklist**

### **Before the Session:**
- [ ] Bring scripts for all 8 stops (from all_stops_scripts.docx)
- [ ] Bring this technical specification document
- [ ] Test your voice with warm-up exercises
- [ ] Stay hydrated (room temperature water)

### **During Recording:**
- [ ] Record 2-3 takes of each stop for options
- [ ] Record stops in sequence (1-8) for consistency
- [ ] Monitor for consistent energy/enthusiasm throughout
- [ ] Leave 2-3 seconds between paragraphs for editing flexibility
- [ ] Record pickup lines for any mistakes

### **Audio Content Structure Per Stop:**
```
[2 seconds silence]

**Intro** (15-20 seconds)
"Welcome to [Location Name], stop [X] of your Downtown Greenville Self-Guided Walking Tour."

**Main Content** (2.5-4 minutes)
[Your scripted historical content]

**Transition** (15-20 seconds)  
"When you're ready to continue, the app will guide you to your next stop: [Next Location]."

[2 seconds silence]
```

### **Studio Session Order:**
1. **Stop 1**: Liberty Bridge intro + tour overview
2. **Stop 2**: Reedy River Falls history 
3. **Stop 3**: West End transformation
4. **Stop 4**: Shoeless Joe Jackson legacy
5. **Stop 5**: Peace Center cultural impact
6. **Stop 6**: Old Courthouse civic history
7. **Stop 7**: One City Plaza modern Greenville
8. **Stop 8**: Falls Park conclusion + call-to-action

---

## 🔧 **Post-Recording Integration**

### **File Processing:**
1. **Normalize audio levels** across all 8 tracks
2. **Export as MP3** with specifications above  
3. **Name files** using the convention above
4. **Place in** `/public/audio/` directory

### **Update Tour Data:**
Replace placeholder URLs in production JSON:
```javascript
// Current placeholder:
"audio_url": "https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3"

// Update to:
"audio_url": "/audio/stop-01-liberty-bridge.mp3"
```

### **Testing Workflow:**
1. Upload files to `/public/audio/`
2. Update JSON with new file paths
3. Test each stop's audio loading and playback
4. Verify autoplay functionality works
5. Test complete tour flow on mobile device

---

## 💡 **Studio Recording Tips**

### **Voice Performance:**
- **Pace**: Slightly slower than normal conversation (elderly-friendly)
- **Tone**: Warm, engaging storyteller (not robotic tour guide)
- **Energy**: Maintain enthusiasm throughout all 8 recordings
- **Pronunciation**: Clear enunciation for outdoor mobile listening

### **Technical Considerations:**
- **Microphone distance**: 6-8 inches from mouth
- **Room acoustics**: Minimize echo/reverb for outdoor listening
- **Background noise**: Critical - will compete with street sounds
- **EQ**: Boost midrange frequencies for clarity on phone speakers

### **Content Flow:**
- **Natural transitions**: Each stop should feel connected to the next
- **Consistent branding**: Reference "Downtown Greenville Self-Guided Walking Tour" in intro/conclusion
- **Call-to-action**: Encourage exploration and sharing in final stop

---

## 📊 **Expected File Sizes**

| Stop | Duration | File Size (MP3 128kbps) |
|------|----------|------------------------|
| Stop 1 | 3 min | ~3MB |
| Stop 2 | 4 min | ~4MB |
| Stop 3 | 3 min | ~3MB |
| Stop 4 | 4 min | ~4MB |
| Stop 5 | 3.5 min | ~3.5MB |
| Stop 6 | 3 min | ~3MB |
| Stop 7 | 3 min | ~3MB |
| Stop 8 | 3.5 min | ~3.5MB |
| **Total** | **~27 min** | **~27MB** |

**Mobile Performance**: 27MB total is excellent for mobile - fast loading, reasonable data usage.

---

## 🚀 **Ready for Production After Recording**

Once you have the 8 professional audio files:

1. **Upload to project** → Place in `/public/audio/`
2. **Update URLs** → Replace placeholder URLs in JSON  
3. **Deploy to Vercel** → `vercel --prod`
4. **Launch** → Add QR codes and Squarespace integration

**Your tour app is 100% ready - it just needs your professional audio content!**

---

*Good luck with the recording session! The technical foundation is solid and ready for your professional narration.*