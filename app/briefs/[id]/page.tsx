// app/briefs/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import type { BusinessBrief, ContentIdea, ContentPiece } from '@/lib/db/schema';
import IdeasList from '@/components/ideas/IdeasList';
import ContentPiecesList from '@/components/content/ContentPiecesList';
import ContentCalendar from '@/components/calendar/ContentCalendar';

export default function BriefDetailPage() {
  const params = useParams();
  const briefId = params.id as string;

  const [brief, setBrief] = useState<BusinessBrief | null>(null);
  const [ideas, setIdeas] = useState<ContentIdea[]>([]);
  const [contentPieces, setContentPieces] = useState<ContentPiece[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [generatingContent, setGeneratingContent] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch brief
        const briefRes = await fetch(`/api/briefs/${briefId}`);
        if (!briefRes.ok) throw new Error('Brief not found');
        const briefData = await briefRes.json();
        setBrief(briefData);

        // Fetch existing ideas
        const ideasRes = await fetch(`/api/ideas?briefId=${briefId}`);
        if (ideasRes.ok) {
          const ideasData = await ideasRes.json();
          setIdeas(ideasData);
        }

        // Fetch content pieces
        const contentRes = await fetch(`/api/content?briefId=${briefId}`);
        if (contentRes.ok) {
          const contentData = await contentRes.json();
          setContentPieces(contentData);
        }
      } catch (err) {
        setError('Gagal load brief');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [briefId]);

  const handleGenerateIdeas = async (count: number = 5) => {
    setGenerating(true);
    try {
      const response = await fetch('/api/ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ briefId, ideaCount: count }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate ideas');
      }

      const result = await response.json();
      setIdeas((prev) => [...prev, ...result.ideas]);
      toast.success(`Generated ${result.count} new ideas! 🎉`);
      setShowForm(false);
    } catch (error) {
      console.error(error);
      toast.error('Gagal generate ideas');
    } finally {
      setGenerating(false);
    }
  };

  const handleGenerateContent = async (ideaId: string) => {
    setGeneratingContent(true);
    try {
      const response = await fetch('/api/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ideaId, briefId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate content');
      }

      const result = await response.json();
      setContentPieces((prev) => [...prev, ...result.contentPieces]);
      toast.success(`Generated ${result.count} content pieces! ✨`);

      // Refresh ideas to update status
      const ideasRes = await fetch(`/api/ideas?briefId=${briefId}`);
      if (ideasRes.ok) {
        const ideasData = await ideasRes.json();
        setIdeas(ideasData);
      }
    } catch (error) {
      console.error(error);
      toast.error('Gagal generate content');
    } finally {
      setGeneratingContent(false);
    }
  };
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-slate-600">Loading brief...</div>
      </div>
    );
  }

  if (error || !brief) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600">{error || 'Brief not found'}</div>
      </div>
    );
  }

  const approvedCount = ideas.filter((i) => i.status === 'approved').length;
  const suggestedCount = ideas.filter((i) => i.status === 'suggested').length;

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard" className="text-sm text-primary hover:underline mb-4 block">
            ← Back to dashboard
          </Link>

          <div className="card p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-slate-900">
                  {brief.name}
                </h1>
                {brief.description && (
                  <p className="text-slate-600 mt-1">{brief.description}</p>
                )}
              </div>
              <div className="flex gap-2">
                <Link
                  href={`/briefs/${briefId}/analytics`}
                  className="btn-ghost text-sm"
                >
                  📊 Analytics
                </Link>
                <Link
                  href={`/briefs/${briefId}/edit`}
                  className="btn-ghost text-sm"
                >
                  ✎ Edit
                </Link>
              </div>
            </div>

            {/* Brief Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-200">
              <div>
                <p className="text-xs font-medium text-slate-600 mb-1">
                  Product
                </p>
                <p className="font-medium text-slate-900">
                  {brief.productName}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium text-slate-600 mb-1">
                  Target Audience
                </p>
                <p className="text-sm text-slate-700 line-clamp-2">
                  {brief.targetAudience}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium text-slate-600 mb-1">
                  Goal
                </p>
                <p className="text-sm text-slate-700 line-clamp-2">
                  {brief.goal}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium text-slate-600 mb-1">
                  Tone
                </p>
                <p className="font-medium text-slate-900">{brief.tone}</p>
              </div>

              <div>
                <p className="text-xs font-medium text-slate-600 mb-1">
                  Design Style
                </p>
                <p className="font-medium text-slate-900">
                  {brief.designStyle}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium text-slate-600 mb-1">
                  Colors
                </p>
                <div className="flex gap-2">
                  {brief.colorPalette.map((color) => (
                    <div
                      key={color}
                      className="w-6 h-6 rounded border border-slate-300"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Platforms */}
            <div className="mt-6 pt-6 border-t border-slate-200">
              <p className="text-xs font-medium text-slate-600 mb-3">
                Enabled Platforms
              </p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(brief.platforms)
                  .filter(([_, config]) => config.enabled)
                  .map(([platform, config]) => (
                    <div
                      key={platform}
                      className="bg-primary/10 text-primary px-3 py-2 rounded text-sm font-medium"
                    >
                      {platform}
                      <span className="ml-2 text-xs opacity-75">
                        {config.postFrequency}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>

        {/* Ideas Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                Content Ideas
              </h2>
              <p className="text-slate-600 text-sm mt-1">
                {suggestedCount} pending • {approvedCount} approved
              </p>
            </div>

            {!showForm && (
              <button
                onClick={() => setShowForm(true)}
                className="btn-primary"
              >
                ⚡ Generate Ideas
              </button>
            )}
          </div>

          {/* Generate Form */}
          {showForm && (
            <div className="card p-6">
              <h3 className="font-semibold mb-4">Generate New Ideas</h3>
              <div className="space-y-4">
                <p className="text-sm text-slate-600">
                  How many ideas do you want? (max 10)
                </p>

                <div className="flex gap-2">
                  {[3, 5, 10].map((count) => (
                    <button
                      key={count}
                      onClick={() => handleGenerateIdeas(count)}
                      disabled={generating}
                      className="btn-secondary disabled:opacity-50"
                    >
                      {generating ? 'Generating...' : `${count} ideas`}
                    </button>
                  ))}
                  <button
                    onClick={() => setShowForm(false)}
                    className="btn-ghost"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Ideas List */}
          {ideas.length > 0 ? (
            <IdeasList
              briefId={briefId}
              initialIdeas={ideas}
              onIdeaApproved={(idea) => {
                setIdeas((prev) =>
                  prev.map((i) => (i._id === idea._id ? idea : i))
                );
              }}
              onGenerateContent={handleGenerateContent}
              generatingContent={generatingContent}
            />
          ) : (
            <div className="card p-8 text-center">
              <p className="text-slate-600 mb-4">
                Belum ada content ideas untuk brief ini.
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="btn-primary"
              >
                ⚡ Generate Ideas
              </button>
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="space-y-6 mt-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              Generated Content
            </h2>
            <p className="text-slate-600 text-sm">
              Captions, hashtags, visual briefs, dan design upload
            </p>
          </div>

          {contentPieces.length > 0 ? (
            <ContentPiecesList
              briefId={briefId}
              initialContent={contentPieces}
            />
          ) : (
            <div className="card p-8 text-center">
              <p className="text-slate-600 mb-4">
                Belum ada generated content. Approve ideas dulu, terus generate caption!
              </p>
            </div>
          )}
        </div>

        {/* Calendar Section */}
        <div className="space-y-6 mt-8">
          <ContentCalendar
            briefId={briefId}
            contentPieces={contentPieces}
            onScheduleUpdate={() => {
              // Refresh content pieces after scheduling
              const fetchContent = async () => {
                const contentRes = await fetch(`/api/content?briefId=${briefId}`);
                if (contentRes.ok) {
                  const contentData = await contentRes.json();
                  setContentPieces(contentData);
                }
              };
              fetchContent();
            }}
          />
        </div>
      </div>
    </main>
  );
}
