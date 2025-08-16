'use client';

import { useEffect, useState } from 'react';
import { getGuestAvatarDataURL, getGuestAvatarConfig } from '@/lib/guest-avatars';

export default function TestAvatarPage() {
  const [avatars, setAvatars] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      // Test generating avatars for different IDs
      const testIds = ['guest_1', 'guest_2', 'guest_abc', 'guest_active_rabbit'];
      const generatedAvatars = testIds.map(id => {
        try {
          const config = getGuestAvatarConfig(id);
          const dataUrl = getGuestAvatarDataURL(id);
          console.log(`Generated avatar for ${id}:`, { config, dataUrl: dataUrl?.substring(0, 100) });
          return {
            id,
            config,
            dataUrl,
            error: null
          };
        } catch (err) {
          console.error(`Error generating avatar for ${id}:`, err);
          return {
            id,
            config: null,
            dataUrl: null,
            error: err.message
          };
        }
      });
      setAvatars(generatedAvatars);
    } catch (err) {
      console.error('Error in avatar generation:', err);
      setError(err.message);
    }
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Guest Avatar Test Page</h1>
      
      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded mb-4">
          Error: {error}
        </div>
      )}
      
      <div className="grid grid-cols-4 gap-4">
        {avatars.map(({ id, config, dataUrl, error }) => (
          <div key={id} className="border rounded p-4">
            <h3 className="font-semibold mb-2">{id}</h3>
            {error ? (
              <div className="text-red-500 text-sm">Error: {error}</div>
            ) : (
              <>
                {dataUrl ? (
                  <img 
                    src={dataUrl} 
                    alt={`Avatar for ${id}`}
                    className="w-24 h-24 rounded-full mb-2"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gray-200 mb-2 flex items-center justify-center">
                    No image
                  </div>
                )}
                {config && (
                  <div className="text-xs">
                    <div>Shape: {config.shape}</div>
                    <div>Eyes: {config.eyeStyle}</div>
                    <div>Mouth: {config.mouthStyle}</div>
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </div>
      
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Test Provisioned Guest Creation</h2>
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded"
          onClick={() => {
            // Test creating a guest user
            import('@/lib/auth/guest-session').then(({ createGuestUser }) => {
              const guest = createGuestUser([], 'Test Monster');
              console.log('Created guest:', guest);
              console.log('Has profilePicture?', !!guest.profilePicture);
              if (guest.profilePicture) {
                console.log('Avatar URL preview:', guest.profilePicture.substring(0, 150));
              }
            });
          }}
        >
          Test Create Guest User
        </button>
      </div>
    </div>
  );
}