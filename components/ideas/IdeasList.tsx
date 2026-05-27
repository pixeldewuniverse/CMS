// components/ideas/IdeasList.tsx
'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import type { ContentIdea } from '@/lib/db/schema';

interface IdeasListProps {
  briefId: string;
  initialIdeas: ContentIdea[];
  onIdeaApproved?: (idea: ContentIdea) => void;
  onGenerateContent?: (ideaId: string) => void;
  generatingContent?: boolean;
}

export default function IdeasList({
  briefId,
  initialIdeas,
  onIdeaApproved,
  onGenerateContent,
  generatingContent,
}: IdeasListProps) {
  const [ideas, setIdeas] = useState<ContentIdea[]>(initialIdeas);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleApprove = async (ideaId: string) => {
    setUpdatingId(ideaId);
    try {
      const response = await fetch(`/api/ideas/${ideaId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'approved' }),
      });

      if (!response.ok) throw new Error('Failed to approve');

      const updated = await response.json();
      setIdeas((prev) =>
        prev.map((i) => (i._id === ideaId ? updated : i))
      );

      toast.success('Idea approved! ✅');
      onIdeaApproved?.(updated);
    } catch (error) {
      console.error(error);
      toast.error('Gagal approve idea');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleReject = async (ideaId: string) => {
    setUpdatingId(ideaId);
    try {
      const response = await fetch(`/api/ideas/${ideaId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'rejected',
          rejectionReason: 'Manual rejection',
        }),
      });

      if (!response.ok) throw new Error('Failed to reject');

      const updated = await response.json();
      setIdeas((prev) =>
        prev.map((i) => (i._id === ideaId ? updated : i))
      );

      toast.success('Idea rejected');
    } catch (error) {
      console.error(error);
      toast.error('Gagal reject idea');
    } finally {
      setUpdatingId(null);
    }
  };

  if (ideas.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-slate-600">Belum ada content ideas</p>
      </div>
    );
  }

  const suggestedIdeas = ideas.filter((i) => i.status === 'suggested');
  const approvedIdeas = ideas.filter((i) => i.status === 'approved');
  const rejectedIdeas = ideas.filter((i) => i.status === 'rejected');

  return (
    <div className="space-y-8">
      {/* Suggested Ideas */}
      {suggestedIdeas.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span className="text-yellow-600">⏳</span>
            Pending Review ({suggestedIdeas.length})
          </h3>
          <div className="space-y-3">
            {suggestedIdeas.map((idea) => (
              <div key={idea._id} className="card p-4">
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-slate-900">
                        {idea.topic}
                      </h4>
                      <p className="text-sm text-slate-600">
                        <span className="font-medium">Angle:</span> {idea.angle}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedId(expandedId === idea._id ? null : (idea._id ?? null))
                      }
                      className="text-sm text-slate-500 hover:text-slate-700"
                    >
                      {expandedId === idea._id ? '▼' : '▶'}
                    </button>
                  </div>

                  {expandedId === idea._id && (
                    <div className="mt-3 pt-3 border-t border-slate-200 space-y-2">
                      <div>
                        <p className="text-xs font-medium text-slate-600 mb-1">
                          Format:
                        </p>
                        <p className="text-sm text-slate-700">{idea.format}</p>
                      </div>

                      <div>
                        <p className="text-xs font-medium text-slate-600 mb-1">
                          Platforms:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {idea.platforms.map((platform) => (
                            <span
                              key={platform}
                              className="text-xs bg-primary/10 text-primary px-2 py-1 rounded"
                            >
                              {platform}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <p className="text-xs font-medium text-slate-600 mb-1">
                          Description:
                        </p>
                        <p className="text-sm text-slate-700">
                          {idea.description}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2 mt-3 pt-3 border-t border-slate-200">
                    <button
                      onClick={() => handleApprove(idea._id!)}
                      disabled={updatingId === idea._id}
                      className="btn-secondary text-sm disabled:opacity-50"
                    >
                      ✓ Approve
                    </button>
                    <button
                      onClick={() => handleReject(idea._id!)}
                      disabled={updatingId === idea._id}
                      className="btn-ghost text-sm disabled:opacity-50"
                    >
                      ✕ Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Approved Ideas */}
      {approvedIdeas.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span className="text-green-600">✓</span>
            Approved ({approvedIdeas.length})
          </h3>
          <div className="space-y-3">
            {approvedIdeas.map((idea) => (
              <div
                key={idea._id}
                className="card p-4 border-l-4 border-green-500"
              >
                <h4 className="font-semibold text-slate-900">{idea.topic}</h4>
                <p className="text-sm text-slate-600 mt-1">
                  {idea.angle} • {idea.format}
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {idea.platforms.map((platform) => (
                    <span
                      key={platform}
                      className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded"
                    >
                      {platform}
                    </span>
                  ))}
                </div>

                {onGenerateContent && (
                  <button
                    onClick={() => onGenerateContent(idea._id!)}
                    disabled={generatingContent}
                    className="btn-primary text-sm mt-3 disabled:opacity-50"
                  >
                    {generatingContent ? 'Generating...' : '✨ Generate Content'}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rejected Ideas */}
      {rejectedIdeas.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-slate-500">
            <span>✕</span>
            Rejected ({rejectedIdeas.length})
          </h3>
          <div className="space-y-2">
            {rejectedIdeas.slice(0, 3).map((idea) => (
              <div key={idea._id} className="card p-4 opacity-60">
                <p className="font-medium text-slate-700 line-clamp-1">
                  {idea.topic}
                </p>
              </div>
            ))}
            {rejectedIdeas.length > 3 && (
              <p className="text-sm text-slate-500 text-center">
                +{rejectedIdeas.length - 3} more rejected
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
