// components/dashboard/BriefsList.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { BusinessBrief } from '@/lib/db/schema';

interface BriefsListProps {
  userId: string;
}

export default function BriefsList({ userId }: BriefsListProps) {
  const [briefs, setBriefs] = useState<BusinessBrief[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBriefs = async () => {
      try {
        const response = await fetch(`/api/briefs?userId=${userId}`);
        if (!response.ok) throw new Error('Failed to fetch briefs');
        const data = await response.json();
        setBriefs(data);
      } catch (err) {
        setError('Gagal load briefs');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchBriefs();
  }, [userId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-slate-600">Loading briefs...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded">
        {error}
      </div>
    );
  }

  if (briefs.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-600 mb-4">Belum ada brief. Buat yang baru dulu!</p>
        <Link href="/briefs/new" className="btn-primary">
          ➕ Buat Brief Pertama
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {briefs.map((brief) => (
        <Link key={brief._id} href={`/briefs/${brief._id}`}>
          <div className="card-hover p-6">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-lg text-slate-900">
                {brief.name}
              </h3>
              <span className="text-xs bg-secondary/10 text-secondary px-2 py-1 rounded">
                {brief.status}
              </span>
            </div>

            <p className="text-sm text-slate-600 mb-3 line-clamp-2">
              {brief.description || 'No description'}
            </p>

            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium text-slate-700">Product:</span>
                <p className="text-slate-600">{brief.productName}</p>
              </div>

              <div>
                <span className="font-medium text-slate-700">Audience:</span>
                <p className="text-slate-600 line-clamp-1">
                  {brief.targetAudience}
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                {Object.entries(brief.platforms)
                  .filter(([_, config]) => config.enabled)
                  .map(([platform, _]) => (
                    <span
                      key={platform}
                      className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded"
                    >
                      {platform}
                    </span>
                  ))}
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-200 text-xs text-slate-500">
              Created: {new Date(brief.createdAt).toLocaleDateString('id-ID')}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
