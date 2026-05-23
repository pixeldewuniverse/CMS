// components/content/PostToBufferButton.tsx
'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';

interface PostToBufferButtonProps {
  contentPieceId: string;
  platform: string;
  caption: string;
  hashtags: string[];
  imageUrl?: string;
  scheduledDate: Date;
  disabled?: boolean;
  bufferId?: string;
  onSuccess?: () => void;
}

export default function PostToBufferButton({
  contentPieceId,
  platform,
  caption,
  hashtags,
  imageUrl,
  scheduledDate,
  disabled = false,
  bufferId,
  onSuccess,
}: PostToBufferButtonProps) {
  const [loading, setLoading] = useState(false);
  const [showTokenForm, setShowTokenForm] = useState(false);
  const [bufferToken, setBufferToken] = useState('');
  const [profileId, setProfileId] = useState('');
  const [profiles, setProfiles] = useState<any[]>([]);

  const handleConnectAndPost = async () => {
    if (!bufferToken.trim()) {
      toast.error('Enter Buffer token');
      return;
    }

    setLoading(true);
    try {
      // First verify connection
      const connectRes = await fetch('/api/posting/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform: 'buffer',
          accessToken: bufferToken,
        }),
      });

      if (!connectRes.ok) {
        throw new Error('Invalid token');
      }

      const connectData = await connectRes.json();
      setProfiles(connectData.profiles || []);
      setShowTokenForm(false);
      toast.success('Token verified! Select a profile to post.');
    } catch (error) {
      console.error(error);
      toast.error('Failed to verify token');
    } finally {
      setLoading(false);
    }
  };

  const handlePostToBuffer = async () => {
    if (!bufferToken.trim() || !profileId) {
      toast.error('Select a profile');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/posting/schedule-buffer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentPieceId,
          bufferAccessToken: bufferToken,
          platform: 'buffer',
          profileId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to post');
      }

      const result = await response.json();
      toast.success('Posted to Buffer! 🚀');
      setShowTokenForm(false);
      setBufferToken('');
      setProfileId('');
      setProfiles([]);
      onSuccess?.();
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : 'Failed to post');
    } finally {
      setLoading(false);
    }
  };

  if (bufferId) {
    return (
      <div className="bg-green-50 border border-green-200 rounded px-3 py-2 text-sm text-green-700">
        ✓ Posted to Buffer
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {!showTokenForm && (
        <button
          onClick={() => setShowTokenForm(true)}
          disabled={disabled || loading}
          className="btn-primary text-sm w-full disabled:opacity-50"
        >
          📤 Post to Buffer
        </button>
      )}

      {showTokenForm && (
        <div className="bg-orange-50 border border-orange-200 rounded p-4 space-y-3">
          {/* Token Input */}
          <div>
            <label className="text-xs font-medium text-slate-600 block mb-1">
              Buffer Access Token
            </label>
            <textarea
              value={bufferToken}
              onChange={(e) => setBufferToken(e.target.value)}
              placeholder="Paste your Buffer token"
              className="input-base text-xs h-12"
            />
          </div>

          {/* Profile Selection */}
          {profiles.length > 0 && (
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">
                Select Profile
              </label>
              <select
                value={profileId}
                onChange={(e) => setProfileId(e.target.value)}
                className="input-base text-sm"
              >
                <option value="">Choose profile...</option>
                {profiles.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.formatted_username} ({p.service})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            {profiles.length === 0 ? (
              <button
                onClick={handleConnectAndPost}
                disabled={loading}
                className="btn-secondary text-xs flex-1 disabled:opacity-50"
              >
                {loading ? 'Verifying...' : 'Verify Token'}
              </button>
            ) : (
              <button
                onClick={handlePostToBuffer}
                disabled={loading || !profileId}
                className="btn-primary text-xs flex-1 disabled:opacity-50"
              >
                {loading ? 'Posting...' : 'Post Now'}
              </button>
            )}

            <button
              onClick={() => {
                setShowTokenForm(false);
                setBufferToken('');
                setProfileId('');
                setProfiles([]);
              }}
              className="btn-ghost text-xs"
            >
              Cancel
            </button>
          </div>

          {/* Help Text */}
          <p className="text-xs text-slate-600">
            Get your token from{' '}
            <a
              href="https://buffer.com/app/settings/integrations"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Buffer Settings
            </a>
          </p>
        </div>
      )}
    </div>
  );
}
