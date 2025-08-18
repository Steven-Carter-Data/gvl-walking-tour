import { ref, uploadBytes, getDownloadURL, listAll } from 'firebase/storage';
import { storage } from '../config/firebase.js';

// Storage paths
const STORAGE_PATHS = {
  AUDIO: 'audio',
  IMAGES: 'images',
  TOURS: 'tours'
};

// Audio file management
export const uploadAudioFile = async (file, tourId, stopId) => {
  try {
    const fileName = `${tourId}/${stopId}.mp3`;
    const storageRef = ref(storage, `${STORAGE_PATHS.AUDIO}/${fileName}`);
    
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return {
      success: true,
      url: downloadURL,
      path: snapshot.ref.fullPath
    };
  } catch (error) {
    console.error('Error uploading audio file:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

export const uploadImageFile = async (file, tourId, stopId, imageIndex) => {
  try {
    const fileExtension = file.name.split('.').pop();
    const fileName = `${tourId}/${stopId}_${imageIndex}.${fileExtension}`;
    const storageRef = ref(storage, `${STORAGE_PATHS.IMAGES}/${fileName}`);
    
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return {
      success: true,
      url: downloadURL,
      path: snapshot.ref.fullPath
    };
  } catch (error) {
    console.error('Error uploading image file:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Batch upload functions for tour creation
export const uploadTourAssets = async (tourId, assets) => {
  try {
    const results = {
      audio: {},
      images: {}
    };
    
    // Upload audio files
    for (const [stopId, audioFile] of Object.entries(assets.audio || {})) {
      const result = await uploadAudioFile(audioFile, tourId, stopId);
      results.audio[stopId] = result;
    }
    
    // Upload image files
    for (const [stopId, imageFiles] of Object.entries(assets.images || {})) {
      results.images[stopId] = [];
      
      for (let i = 0; i < imageFiles.length; i++) {
        const result = await uploadImageFile(imageFiles[i], tourId, stopId, i);
        results.images[stopId].push(result);
      }
    }
    
    return {
      success: true,
      results
    };
  } catch (error) {
    console.error('Error uploading tour assets:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// List existing files (for admin interface)
export const listTourAssets = async (tourId) => {
  try {
    const audioRef = ref(storage, `${STORAGE_PATHS.AUDIO}/${tourId}`);
    const imagesRef = ref(storage, `${STORAGE_PATHS.IMAGES}/${tourId}`);
    
    const [audioList, imagesList] = await Promise.all([
      listAll(audioRef).catch(() => ({ items: [] })),
      listAll(imagesRef).catch(() => ({ items: [] }))
    ]);
    
    const audioFiles = await Promise.all(
      audioList.items.map(async (item) => ({
        name: item.name,
        path: item.fullPath,
        url: await getDownloadURL(item)
      }))
    );
    
    const imageFiles = await Promise.all(
      imagesList.items.map(async (item) => ({
        name: item.name,
        path: item.fullPath,
        url: await getDownloadURL(item)
      }))
    );
    
    return {
      success: true,
      audio: audioFiles,
      images: imageFiles
    };
  } catch (error) {
    console.error('Error listing tour assets:', error);
    return {
      success: false,
      error: error.message
    };
  }
};