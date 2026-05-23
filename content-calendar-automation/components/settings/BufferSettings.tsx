// components/settings/BufferSettings.tsx
'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';

interface BufferProfile {
  id: string;
  formatted_username: string;
  service: string;
}

interface BufferSettingsProps {
  onTokenSaved?: (token: string, platform: string) => void;
}

export default function BufferSettings({
  onTokenSaved,
}: BufferSettingsProps) {
  const [platform, setPlatform] = useState<'buffer' | 'later'>('buffer');
  const [accessToken, setAccessToken] = useState('');
  const [profiles, setProfiles] = useState<BufferProfile[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);

  const handleConnectBuffer = async () => {
    if (!accessToken.trim()) {
      toast.error('Enter access token');
      return;
    }

    setLoading(true);
    try {
      // Verify token by fetching profiles
      const response = await fetch('/api/posting/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform,
          accessToken,
        }),
      });

      if (!response.ok) {
        throw new Error('Invalid token or connection failed');
      }

      const result = await response.json();
      setProfiles(result.profiles || []);
      setConnected(true);
      onTokenSaved?.(accessToken, platform);
      toast.success(`Connected to ${platform}! 🎉`);
    } catch (error) {
      console.error(error);
      toast.error('Failed to connect. Check your token.');
      setConnected(false);
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = () => {
    setAccessToken('');
    setProfiles([]);
    setSelectedProfile('');
    setConnected(false);
    toast.success('Disconnected');
  };

  return (
    <div className="card p-6 max-w-2xl">
      <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
        <span>📤</span> Auto-Posting Configuration
      </h3>

      {/* Platform Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-3">Platform</label>
        <div className="flex gap-3">
          <button
            onClick={() => setPlatform('buffer')}
            className={`px-4 py-2 rounded font-medium transition ${
              platform === 'buffer'
                ? 'bg-blue-500 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Buffer
          </button>
          <button
            onClick={() => setPlatform('later')}
            className={`px-4 py-2 rounded font-medium transition ${
              platform === 'later'
                ? 'bg-purple-500 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Later
          </button>
        </div>
      </div>

      {/* Token Input */}
      {!connected ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              {platform === 'buffer' ? 'Buffer' : 'Later'} Access Token
            </label>
            <textarea
              value={accessToken}
              onChange={(e) => setAccessToken(e.target.value)}
              placeholder={
                platform === 'buffer'
                  ? 'Paste Buffer access token here'
                  : 'Paste Later API key here'
              }
              className="input-base h-20"
            />
            <p className="text-xs text-slate-600 mt-2">
              {platform === 'buffer' ? (
                <>
                  Get your token from{' '}
                  <a
                    href="https://buffer.com/app/settings/integrations"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Buffer Settings
                  </a>
                </>
              ) : (
                <>
                  Get your API key from{' '}
                  <a
                    href="https://later.com/app/account/api"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Later API
                  </a>
                </>
              )}
            </p>
          </div>

          <button
            onClick={handleConnectBuffer}
            disabled={loading}
            className="btn-primary disabled:opacity-50"
          >
            {loading ? 'Connecting...' : `Connect ${platform}`}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Connected Status */}
          <div className="bg-green-50 border border-green-200 rounded p-4">
            <p className="font-medium text-green-900 mb-2">
              ✓ Connected to {platform}
            </p>
            <p className="text-sm text-green-700">
              Ready to schedule posts!
            </p>
          </div>

          {/* Profile Selection */}
          {profiles.length > 0 && (
            <div>
              <label className="block text-sm font-medium mb-2">
                Select Profile
              </label>
              <select
                value={selectedProfile}
                onChange={(e) => setSelectedProfile(e.target.value)}
                className="input-base"
              >
                <option value="">-- Choose a profile --</option>
                {profiles.map((profile) => (
                  <option key={profile.id} value={profile.id}>
                    {profile.formatted_username} ({profile.service})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Disconnect Button */}
          <button
            onClick={handleDisconnect}
            className="btn-ghost w-full"
          >
            Disconnect
          </button>

          {/* Info */}
          <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm">
            <p className="font-medium text-blue-900 mb-2">💡 How it works:</p>
            <ol className="space-y-1 text-blue-800 ml-4">
              <li>1. Connect your {platform} account here</li>
              <li>2. Schedule posts in calendar (Step 7)</li>
              <li>3. Click "Post to Buffer" on scheduled posts</li>
              <li>4. {platform} handles auto-publishing</li>
            </ol>
          </div>
        </div>
      )}
    </div>
  );
}
