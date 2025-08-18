import { useState } from 'react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../config/firebase';

// Simple admin component for uploading audio files
// Access via: your-domain.com/?admin=true
function AdminPanel() {
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');

  const handleFileUpload = async (event, stopId, stopOrder) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploading(true);
    setUploadStatus(`Uploading audio for Stop ${stopOrder}...`);

    try {
      // Upload file to Firebase Storage
      const fileName = `stop-${stopOrder.toString().padStart(2, '0')}-${stopId}.${file.name.split('.').pop()}`;
      const storageRef = ref(storage, `audio/${fileName}`);
      
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      setUploadStatus(`✅ Success! URL: ${downloadURL}`);
      
      // You would then update your tour data JSON with this URL
      console.log(`Update JSON for ${stopId}: ${downloadURL}`);
      
    } catch (error) {
      setUploadStatus(`❌ Error: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  // Only show if ?admin=true in URL
  const isAdmin = new URLSearchParams(window.location.search).get('admin') === 'true';
  
  if (!isAdmin) return null;

  return (
    <div className="fixed top-4 right-4 bg-white border-2 border-red-500 rounded-lg p-4 max-w-sm z-50">
      <h3 className="font-bold text-red-600 mb-3">🔧 Admin Panel</h3>
      
      <div className="space-y-3 text-sm">
        <div>
          <label className="block font-medium mb-1">Upload Audio Files:</label>
          
          {/* Liberty Bridge - already has audio */}
          <div className="mb-2 p-2 bg-green-50 rounded">
            <div className="font-medium">Stop 1: Liberty Bridge</div>
            <div className="text-green-600 text-xs">✅ Audio uploaded</div>
          </div>

          {/* Remaining stops */}
          {[
            { id: 'reedy-river-falls-viewpoint', order: 2, title: 'Reedy River Falls' },
            { id: 'old-mill-ruins', order: 3, title: 'Old Mill Ruins' },
            { id: 'west-end-historic-gateway', order: 4, title: 'West End Gateway' },
            { id: 'peace-center-plaza', order: 5, title: 'Peace Center Plaza' },
            { id: 'historic-main-street-one-city-plaza', order: 6, title: 'Main Street' },
            { id: 'old-county-courthouse-poinsett-view', order: 7, title: 'Courthouse/Poinsett' },
            { id: 'shoeless-joe-jackson-statue', order: 8, title: 'Shoeless Joe' },
            { id: 'wyche-pavilion', order: 9, title: 'Wyche Pavilion' },
            { id: 'falls-park-gardens-closing', order: 10, title: 'Falls Park Gardens' }
          ].map(stop => (
            <div key={stop.id} className="mb-2 p-2 bg-gray-50 rounded">
              <div className="font-medium">Stop {stop.order}: {stop.title}</div>
              <input
                type="file"
                accept="audio/*"
                onChange={(e) => handleFileUpload(e, stop.id, stop.order)}
                disabled={uploading}
                className="text-xs mt-1"
              />
            </div>
          ))}
        </div>

        {uploadStatus && (
          <div className="mt-3 p-2 bg-blue-50 rounded">
            <div className="text-xs">{uploadStatus}</div>
          </div>
        )}

        <div className="text-xs text-gray-500 mt-3">
          After upload, update the JSON file with the new Firebase URL.
        </div>
      </div>
    </div>
  );
}

export default AdminPanel;