// components/content/DesignUpload.tsx
'use client';

import { useState, useRef } from 'react';
import toast from 'react-hot-toast';

interface DesignUploadProps {
  contentPieceId: string;
  platform: string;
  onUploadSuccess?: (imageUrl: string) => void;
}

export default function DesignUpload({
  contentPieceId,
  platform,
  onUploadSuccess,
}: DesignUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toast.error('Only JPEG, PNG, WebP allowed');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size max 5MB');
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onload = (event) => {
      setPreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('contentPieceId', contentPieceId);
      formData.append('platform', platform);

      const response = await fetch('/api/content/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      toast.success('Design uploaded! 🎉');
      onUploadSuccess?.(result.imageUrl);
    } catch (error) {
      console.error(error);
      toast.error('Failed to upload design');
      setPreview(null);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-orange-50 to-yellow-50 border border-orange-200 rounded-lg p-6">
      <h4 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
        <span>🖼️</span> Design Image
      </h4>

      {preview ? (
        <div className="space-y-4">
          {/* Preview */}
          <div className="relative bg-white p-2 rounded border border-orange-200">
            <img
              src={preview}
              alt="Design preview"
              className="w-full rounded max-h-96 object-cover"
            />
          </div>

          {/* File info */}
          <div className="text-sm text-slate-600">
            <p>✓ Ready for upload</p>
            <p className="text-xs mt-1">
              Format: {fileInputRef.current?.files?.[0]?.name?.split('.').pop()?.toUpperCase()}
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="btn-secondary text-sm flex-1 disabled:opacity-50"
            >
              {uploading ? 'Uploading...' : '📁 Choose Different File'}
            </button>
            <button
              onClick={() => {
                setPreview(null);
                if (fileInputRef.current) {
                  fileInputRef.current.value = '';
                }
              }}
              className="btn-ghost text-sm"
            >
              ✕ Clear
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-orange-300 rounded-lg p-8 text-center cursor-pointer hover:bg-orange-100 transition"
        >
          <p className="text-3xl mb-2">📤</p>
          <p className="font-medium text-slate-900 mb-1">
            Drag & drop your design here
          </p>
          <p className="text-sm text-slate-600">
            or click to browse
          </p>
          <p className="text-xs text-slate-500 mt-2">
            Supports JPEG, PNG, WebP (max 5MB)
          </p>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        className="hidden"
        disabled={uploading}
      />

      {/* Note */}
      <div className="mt-4 text-xs text-slate-600 bg-white p-3 rounded border border-slate-200">
        <p className="font-medium mb-1">💡 Tips:</p>
        <ul className="space-y-1 ml-4">
          <li>• Use the visual brief as guide</li>
          <li>• Match platform dimensions (1080x1080 for Instagram, etc)</li>
          <li>• High quality images recommended</li>
          <li>• Can edit caption before scheduling</li>
        </ul>
      </div>
    </div>
  );
}
