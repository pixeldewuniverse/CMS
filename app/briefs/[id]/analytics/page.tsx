// app/briefs/[id]/analytics/page.tsx
'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import AnalyticsDashboard from '@/components/analytics/AnalyticsDashboard';

export default function AnalyticsPage() {
  const params = useParams();
  const briefId = params.id as string;

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={`/briefs/${briefId}`}
            className="text-sm text-primary hover:underline mb-4 block"
          >
            ← Back to brief
          </Link>

          <div className="card p-6">
            <h1 className="text-3xl font-bold text-slate-900">
              📊 Analytics & Performance
            </h1>
            <p className="text-slate-600 mt-1">
              Track your content performance and get AI-powered insights
            </p>
          </div>
        </div>

        {/* Analytics Dashboard */}
        <AnalyticsDashboard briefId={briefId} />

        {/* Additional Info */}
        <div className="card p-6 mt-8 bg-blue-50 border-2 border-blue-200">
          <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
            💡 About Analytics
          </h3>
          <ul className="space-y-2 text-sm text-slate-700">
            <li>
              • <strong>Total Engagement:</strong> Sum of likes, comments, and shares
            </li>
            <li>
              • <strong>Reach:</strong> Number of unique people who saw your post
            </li>
            <li>
              • <strong>Engagement Rate:</strong> Engagement ÷ Reach × 100%
            </li>
            <li>
              • <strong>Best Posting Time:</strong> Based on when your posts get most engagement
            </li>
            <li>
              • <strong>Engagement Trend:</strong> Whether engagement is increasing or decreasing
            </li>
          </ul>
        </div>

        {/* Loop Back Section */}
        <div className="card p-6 mt-8 bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-300">
          <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
            🔄 Loop Back to Improve
          </h3>
          <p className="text-sm text-slate-700 mb-4">
            Use these insights to create better content next time!
          </p>
          <div className="space-y-2 text-sm text-slate-700">
            <p>
              <strong>Step 1:</strong> Analyze what worked (topics, formats,
              hashtags, posting times)
            </p>
            <p>
              <strong>Step 2:</strong> Create new brief with improved strategy
            </p>
            <p>
              <strong>Step 3:</strong> Generate ideas based on best performers
            </p>
            <p>
              <strong>Step 4:</strong> Publish and repeat the cycle
            </p>
          </div>

          <Link
            href="/briefs/new"
            className="btn-primary mt-4 inline-block"
          >
            ➕ Create New Brief with Insights
          </Link>
        </div>
      </div>
    </main>
  );
}
