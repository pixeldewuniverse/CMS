// components/analytics/AnalyticsDashboard.tsx
'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

interface AnalyticsData {
  briefId: string;
  posts: any[];
  summary: {
    totalPosts: number;
    totalEngagement: number;
    totalReach: number;
    avgEngagementRate: number;
    bestPost?: {
      caption: string;
      engagement: number;
    };
    bestPerformingPlatform?: {
      platform: string;
      engagement: number;
    };
  };
  insights?: {
    bestPostingTime: string;
    bestDayOfWeek: string;
    engagementTrend: 'up' | 'down' | 'stable';
    recommendations: string[];
  };
}

interface AnalyticsDashboardProps {
  briefId: string;
  contentPieces?: any[];
}

export default function AnalyticsDashboard({
  briefId,
  contentPieces,
}: AnalyticsDashboardProps) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAccessForm, setShowAccessForm] = useState(false);
  const [accessToken, setAccessToken] = useState('');
  const [service, setService] = useState<'buffer' | 'later'>('buffer');

  useEffect(() => {
    fetchAnalytics();
  }, [briefId]);

  const fetchAnalytics = async (token?: string, svc?: 'buffer' | 'later') => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ briefId });
      if (token && svc) {
        params.append('accessToken', token);
        params.append('service', svc);
      }

      const response = await fetch(`/api/analytics?${params}`);
      if (!response.ok) throw new Error('Failed to fetch analytics');

      const data = await response.json();
      setAnalytics(data);
      setShowAccessForm(false);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const handleFetchWithToken = () => {
    if (!accessToken) {
      toast.error('Enter access token');
      return;
    }
    fetchAnalytics(accessToken, service);
  };

  if (loading) {
    return (
      <div className="card p-8 text-center">
        <p className="text-slate-600">Loading analytics...</p>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="card p-8 text-center">
        <p className="text-slate-600">No analytics data</p>
      </div>
    );
  }

  const trendEmoji = {
    up: '📈',
    down: '📉',
    stable: '➡️',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card p-6 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
            <span>📊</span> Performance Analytics
          </h2>
          <button
            onClick={() => setShowAccessForm(!showAccessForm)}
            className="btn-secondary text-sm"
          >
            {showAccessForm ? 'Close' : '🔄 Refresh with Token'}
          </button>
        </div>

        {showAccessForm && (
          <div className="bg-white p-4 rounded border border-blue-200 space-y-3">
            <div className="flex gap-2">
              <button
                onClick={() => setService('buffer')}
                className={`flex-1 px-3 py-2 rounded text-sm font-medium ${
                  service === 'buffer'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100'
                }`}
              >
                Buffer
              </button>
              <button
                onClick={() => setService('later')}
                className={`flex-1 px-3 py-2 rounded text-sm font-medium ${
                  service === 'later'
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-100'
                }`}
              >
                Later
              </button>
            </div>

            <input
              type="password"
              placeholder="Paste API token"
              value={accessToken}
              onChange={(e) => setAccessToken(e.target.value)}
              className="input-base"
            />

            <button
              onClick={handleFetchWithToken}
              className="btn-primary w-full"
            >
              ✓ Fetch Live Analytics
            </button>
          </div>
        )}
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-6 bg-gradient-to-br from-blue-50 to-blue-100">
          <p className="text-xs font-medium text-slate-600 mb-1">
            TOTAL POSTS
          </p>
          <p className="text-3xl font-bold text-blue-700">
            {analytics.summary.totalPosts}
          </p>
          <p className="text-xs text-slate-600 mt-2">Published</p>
        </div>

        <div className="card p-6 bg-gradient-to-br from-green-50 to-green-100">
          <p className="text-xs font-medium text-slate-600 mb-1">
            TOTAL ENGAGEMENT
          </p>
          <p className="text-3xl font-bold text-green-700">
            {analytics.summary.totalEngagement.toLocaleString()}
          </p>
          <p className="text-xs text-slate-600 mt-2">
            Likes + Comments + Shares
          </p>
        </div>

        <div className="card p-6 bg-gradient-to-br from-purple-50 to-purple-100">
          <p className="text-xs font-medium text-slate-600 mb-1">TOTAL REACH</p>
          <p className="text-3xl font-bold text-purple-700">
            {((analytics.summary.totalReach ?? 0) / 1000).toFixed(1)}K
          </p>
          <p className="text-xs text-slate-600 mt-2">People reached</p>
        </div>

        <div className="card p-6 bg-gradient-to-br from-orange-50 to-orange-100">
          <p className="text-xs font-medium text-slate-600 mb-1">
            AVG ENGAGEMENT RATE
          </p>
          <p className="text-3xl font-bold text-orange-700">
            {(analytics.summary.avgEngagementRate ?? 0).toFixed(2)}%
          </p>
          <p className="text-xs text-slate-600 mt-2">Per post</p>
        </div>
      </div>

      {/* Insights */}
      {analytics.insights && (
        <div className="card p-6 space-y-4">
          <h3 className="text-lg font-semibold text-slate-900">
            💡 Key Insights
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-50 p-4 rounded border-l-4 border-blue-500">
              <p className="text-xs font-medium text-slate-600 mb-1">
                Best Posting Time
              </p>
              <p className="font-medium text-slate-900">
                {analytics.insights.bestPostingTime}
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded border-l-4 border-green-500">
              <p className="text-xs font-medium text-slate-600 mb-1">
                Best Day
              </p>
              <p className="font-medium text-slate-900">
                {analytics.insights.bestDayOfWeek}
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded border-l-4 border-purple-500">
              <p className="text-xs font-medium text-slate-600 mb-1">Trend</p>
              <p className="font-medium text-slate-900 flex items-center gap-1">
                <span>
                  {trendEmoji[analytics.insights.engagementTrend]}
                </span>
                {analytics.insights.engagementTrend === 'up'
                  ? 'Increasing'
                  : analytics.insights.engagementTrend === 'down'
                    ? 'Decreasing'
                    : 'Stable'}
              </p>
            </div>
          </div>

          {/* Recommendations */}
          {analytics.insights.recommendations.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded p-4">
              <p className="font-semibold text-amber-900 mb-3">
                📌 Recommendations
              </p>
              <ul className="space-y-2">
                {analytics.insights.recommendations.map((rec, idx) => (
                  <li
                    key={idx}
                    className="text-sm text-amber-800 flex gap-2"
                  >
                    <span className="font-bold">→</span> {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Best Post */}
      {analytics.summary.bestPost && (
        <div className="card p-6 bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300">
          <h3 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
            ⭐ Best Performing Post
          </h3>
          <p className="text-sm text-slate-700 mb-2 line-clamp-2">
            {analytics.summary.bestPost.caption}
          </p>
          <p className="text-sm font-medium text-orange-700">
            {analytics.summary.bestPost.engagement} total engagement
          </p>
        </div>
      )}

      {/* Platform Stats */}
      {analytics.summary.bestPerformingPlatform && (
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-3">
            📱 Best Performing Platform
          </h3>
          <div className="bg-slate-50 p-4 rounded flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">
                {analytics.summary.bestPerformingPlatform.platform.toUpperCase()}
              </p>
              <p className="text-lg font-bold text-slate-900 mt-1">
                {analytics.summary.bestPerformingPlatform.engagement} engagement
              </p>
            </div>
            <div className="text-4xl">
              {analytics.summary.bestPerformingPlatform.platform ===
              'instagram'
                ? '📸'
                : analytics.summary.bestPerformingPlatform.platform ===
                    'linkedin'
                  ? '💼'
                  : '🐦'}
            </div>
          </div>
        </div>
      )}

      {/* Post Details */}
      {analytics.posts.length > 0 && (
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            📝 Individual Post Performance
          </h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {analytics.posts.map((post, idx) => (
              <div
                key={idx}
                className="bg-slate-50 p-4 rounded border-l-4 border-blue-500"
              >
                <div className="flex items-start justify-between mb-2">
                  <span className="font-medium text-slate-900 capitalize">
                    {post.platform}
                  </span>
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                    {post.metrics?.engagementRate || 0}% ER
                  </span>
                </div>
                <p className="text-sm text-slate-600 line-clamp-1 mb-2">
                  {post.caption}
                </p>
                <div className="flex gap-4 text-xs text-slate-600">
                  <span>👍 {post.metrics?.likes || 0}</span>
                  <span>💬 {post.metrics?.comments || 0}</span>
                  <span>🔄 {post.metrics?.shares || 0}</span>
                  <span>📊 {post.metrics?.reach || 0} reach</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Call to Action */}
      <div className="card p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300">
        <h3 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
          🚀 Next Steps
        </h3>
        <ul className="space-y-1 text-sm text-slate-700">
          <li>✓ Review best performing posts and understand why</li>
          <li>✓ Replicate successful content strategies</li>
          <li>✓ Post at optimal times based on insights</li>
          <li>✓ Create new brief based on recommendations</li>
          <li>✓ Iterate and improve your content calendar</li>
        </ul>
      </div>
    </div>
  );
}
