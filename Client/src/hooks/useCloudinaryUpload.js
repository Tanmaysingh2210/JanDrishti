// useCloudinaryUpload.js
// Uploads images directly from the browser to Cloudinary using an unsigned preset.
// No backend needed — uses Cloudinary's public upload API.
//
// Setup:
//   1. Go to https://console.cloudinary.com → Settings → Upload Presets
//   2. Click "Add upload preset" → Mode: Unsigned → Save
//   3. Add to Client/.env:
//      VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
//      VITE_CLOUDINARY_UPLOAD_PRESET=your_preset_name

import { useState, useCallback } from 'react';

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
const UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

/**
 * Hook for uploading images directly to Cloudinary from the browser.
 *
 * Returns:
 *   uploading   — boolean, true while any upload is in progress
 *   photos      — array of { url, publicId, preview } objects
 *   uploadFile  — async (File) → void
 *   removePhoto — (index) → void
 *   reset       — () → void
 *   error       — string | null
 */
export function useCloudinaryUpload() {
  const [uploading, setUploading] = useState(false);
  const [photos, setPhotos] = useState([]);
  const [error, setError] = useState(null);

  const uploadFile = useCallback(async (file) => {
    if (!file) return;

    if (!CLOUD_NAME || CLOUD_NAME === 'your_cloud_name_here') {
      setError('Cloudinary is not configured. Add VITE_CLOUDINARY_CLOUD_NAME to Client/.env');
      return;
    }
    if (!UPLOAD_PRESET || UPLOAD_PRESET === 'your_unsigned_preset_here') {
      setError('Cloudinary upload preset is not configured. Add VITE_CLOUDINARY_UPLOAD_PRESET to Client/.env');
      return;
    }

    // Show local preview immediately
    const preview = URL.createObjectURL(file);

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', UPLOAD_PRESET);
      formData.append('folder', 'jandrishti/citizen/photos');

      const res = await fetch(UPLOAD_URL, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error?.message || 'Upload failed');
      }

      const data = await res.json();

      setPhotos((prev) => [
        ...prev,
        {
          url: data.secure_url,
          publicId: data.public_id,
          preview,
        },
      ]);
    } catch (err) {
      setError(err.message || 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  }, []);

  const removePhoto = useCallback((index) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const reset = useCallback(() => {
    setPhotos([]);
    setError(null);
  }, []);

  return { uploading, photos, uploadFile, removePhoto, reset, error };
}
