// components/content/PublishButton.tsx
'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';

interface PublishButtonProps {
  contentPieceId: string;
  platform: string;
  isScheduled?: boolean;
  hasDesign?: boolean;
  onPublishSuccess?: () => void;
}

export default function PublishButton({
  contentPieceId,
  platform,
  isScheduled = false,
  hasDesign = false,
  onPublishSuccess,
}: PublishButtonProps) {
  const [showOptions, setShowOptions] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [service, setService] = useState<'buffer' | 'later'>('buffer');
  const [accessToken, setAccessToken] = useState('');
  const [profiles, setProfiles] = useState<any[]>([]);
  const [selectedProfile, setSelectedProfile] = useState('');
  const [loadingProfiles, setLoadingProfiles] = useState(false);

  const handleSelectService = async (selectedService: 'buffer' | 'later') => {
    setService(selectedService);
    setLoadingProfiles(true);

    try {
      // Fetch profiles dari service
      const response = await fetch(
        `/api/publish?service=${selectedService}&accessToken=${accessToken}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch profiles');
      }

      const data = await response.json();
      setProfiles(data.profiles || []);

      if (data.profiles?.length > 0) {
        setSelectedProfile(data.profiles[0].id);
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to load profiles');
    } finally {
      setLoadingProfiles(false);
    }
  };

  const handlePublish = async () => {
    if (!accessToken) {
      toast.error('Enter access token');
      return;
    }

    if (!selectedProfile && service === 'buffer') {
      toast.error('Select a profile');
      return;
    }

    setPublishing(true);
    try {
      const response = await fetch('/api/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentPieceId,
          publishService: service,
          accessToken,
          profileId: selectedProfile,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to publish');
      }

      const result = await response.json();
      toast.success(`Post sent to ${service}! 🚀`);
      setShowOptions(false);
      onPublishSuccess?.();
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : 'Failed to publish');
    } finally {
      setPublishing(false);
    }
  };

  if (!isScheduled) {
    return (
      <div className="text-xs text-slate-500 bg-slate-50 p-2 rounded">
        Schedule post first (set date & time)
      </div>
    );
  }

  if (!hasDesign) {
    return (
      <div className="text-xs text-slate-500 bg-slate-50 p-2 rounded">
        Upload design first
      </div>
    );
  }

  if (!showOptions) {
    return (
      <button
        onClick={() => setShowOptions(true)}
        className="btn-primary text-sm w-full"
      >
        🚀 Publish to Buffer/Later
      </button>
    );
  }

  return (
    <div className="bg-purple-50 border-2 border-purple-300 rounded p-4 space-y-4">
      <h4 className="font-semibold text-slate-900">Publish to Social Media</h4>

      {/* Access Token Input */}
      <div>
        <label className="block text-sm font-medium mb-2">
          {service === 'buffer' ? 'Buffer API Token' : 'Later API Key'}
        </label>
        <input
          type="password"
          placeholder={
            service === 'buffer'
              ? 'Paste Buffer access token'
              : 'Paste Later API key'
          }
          value={accessToken}
          onChange={(e) => setAccessToken(e.target.value)}
          className="input-base"
        />
        <p className="text-xs text-slate-500 mt-1">
          {service === 'buffer'
            ? 'Get from: bufferapp.com/settings/apps'
            : 'Get from: later.com/api'}
        </p>
      </div>

      {/* Service Selection */}
      <div>
        <label className="block text-sm font-medium mb-2">Service</label>
        <div className="flex gap-2">
          <button
            onClick={() => handleSelectService('buffer')}
            className={`flex-1 px-3 py-2 rounded text-sm font-medium transition ${
              service === 'buffer'
                ? 'bg-purple-600 text-white'
                : 'bg-white border border-slate-200'
            }`}
          >
            Buffer
          </button>
          <button
            onClick={() => handleSelectService('later')}
            className={`flex-1 px-3 py-2 rounded text-sm font-medium transition ${
              service === 'later'
                ? 'bg-purple-600 text-white'
                : 'bg-white border border-slate-200'
            }`}
          >
            Later
          </button>
        </div>
      </div>

      {/* Profiles Selection (Buffer only) */}
      {service === 'buffer' && accessToken && (
        <div>
          <label className="block text-sm font-medium mb-2">
            Profile
            {loadingProfiles && ' (loading...)'}
          </label>
          {loadingProfiles ? (
            <div className="text-sm text-slate-600">
              Fetching your Buffer profiles...
            </div>
          ) : profiles.length > 0 ? (
            <select
              value={selectedProfile}
              onChange={(e) => setSelectedProfile(e.target.value)}
              className="input-base"
            >
              {profiles.map((profile: any) => (
                <option key={profile.id} value={profile.id}>
                  {profile.service || profile.name} ({profile.service_type})
                </option>
              ))}
            </select>
          ) : (
            <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
              No profiles found. Check your token.
            </div>
          )}
        </div>
      )}

      {/* Info */}
      <div className="bg-white p-3 rounded border border-slate-200 text-xs text-slate-600 space-y-1">
        <p>
          <strong>Post will be scheduled at:</strong>{' '}
          {new Date(contentPieceId).toLocaleDateString()}
        </p>
        <p>
          <strong>Platform:</strong> {platform}
        </p>
        <p>
          <strong>Service:</strong> {service.toUpperCase()}
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={handlePublish}
          disabled={publishing || !accessToken || (!selectedProfile && service === 'buffer')}
          className="btn-primary flex-1 text-sm disabled:opacity-50"
        >
          {publishing ? 'Publishing...' : '✓ Publish Now'}
        </button>
        <button
          onClick={() => setShowOptions(false)}
          className="btn-ghost text-sm"
        >
          Cancel
        </button>
      </div>

      {/* Warning */}
      <div className="text-xs text-amber-700 bg-amber-50 p-2 rounded">
        ⚠️ Keep API tokens private. They are stored temporarily.
      </div>
    </div>
  );
}
