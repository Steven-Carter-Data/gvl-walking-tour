import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy 
} from 'firebase/firestore';
import { db } from '../config/firebase.js';

// Collection names
const COLLECTIONS = {
  TOURS: 'tours',
  TOUR_STOPS: 'tourStops',
  USER_SESSIONS: 'userSessions',
  ANALYTICS: 'analytics'
};

// Tour management
export const getTourData = async (tourId) => {
  try {
    const tourDoc = await getDoc(doc(db, COLLECTIONS.TOURS, tourId));
    if (tourDoc.exists()) {
      return { id: tourDoc.id, ...tourDoc.data() };
    }
    throw new Error('Tour not found');
  } catch (error) {
    console.error('Error fetching tour data:', error);
    throw error;
  }
};

export const getTourStops = async (tourId) => {
  try {
    const stopsQuery = query(
      collection(db, COLLECTIONS.TOUR_STOPS),
      where('tourId', '==', tourId),
      orderBy('order', 'asc')
    );
    
    const querySnapshot = await getDocs(stopsQuery);
    const stops = [];
    
    querySnapshot.forEach((doc) => {
      stops.push({ id: doc.id, ...doc.data() });
    });
    
    return stops;
  } catch (error) {
    console.error('Error fetching tour stops:', error);
    throw error;
  }
};

// User session management
export const createUserSession = async (sessionData) => {
  try {
    const docRef = await addDoc(collection(db, COLLECTIONS.USER_SESSIONS), {
      ...sessionData,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    return docRef.id;
  } catch (error) {
    console.error('Error creating user session:', error);
    throw error;
  }
};

export const updateUserSession = async (sessionId, updateData) => {
  try {
    const sessionRef = doc(db, COLLECTIONS.USER_SESSIONS, sessionId);
    await updateDoc(sessionRef, {
      ...updateData,
      updatedAt: new Date()
    });
    
    return true;
  } catch (error) {
    console.error('Error updating user session:', error);
    throw error;
  }
};

// Analytics
export const logAnalyticsEvent = async (eventData) => {
  try {
    await addDoc(collection(db, COLLECTIONS.ANALYTICS), {
      ...eventData,
      timestamp: new Date(),
      userAgent: navigator.userAgent,
      url: window.location.href
    });
    
    return true;
  } catch (error) {
    console.error('Error logging analytics event:', error);
    return false;
  }
};

// Admin functions (for content management)
export const uploadTourData = async (tourData) => {
  try {
    // Upload main tour document
    const tourRef = await addDoc(collection(db, COLLECTIONS.TOURS), {
      tour_id: tourData.tour_id,
      currency: tourData.currency,
      price: tourData.price,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    // Upload each stop as separate document
    const stopPromises = tourData.stops.map(stop => 
      addDoc(collection(db, COLLECTIONS.TOUR_STOPS), {
        ...stop,
        tourId: tourData.tour_id,
        createdAt: new Date()
      })
    );
    
    await Promise.all(stopPromises);
    
    return { tourId: tourRef.id, success: true };
  } catch (error) {
    console.error('Error uploading tour data:', error);
    throw error;
  }
};