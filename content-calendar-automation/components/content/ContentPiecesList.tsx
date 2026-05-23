// components/content/ContentPiecesList.tsx
'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import type { ContentPiece } from '@/lib/db/schema';
import VisualBriefViewer from './VisualBriefViewer';
import DesignUpload from './DesignUpload';
import PublishButton from './PublishButton';

interface ContentPiecesListProps {
  briefId: string;
  initialContent: ContentPiece[];
  onContentGenerated?: () => void;
}

export default function ContentPiecesList({
  briefId,
  initialContent,
  onContentGenerated,
}: ContentPiecesListProps) {
  const [content, setContent] = useState<ContentPiece[]>(initialContent);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [generatingBriefId, setGeneratingBriefId] = useState<string | null>(null);

  if (content.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-slate-600">Belum ada content pieces</p>
      </div>
    );
  }

  const handleGenerateVisualBrief = async (contentPieceId: string) => {
    setGeneratingBriefId(contentPieceId);
    try {
      const response = await fetch('/api/visual-brief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contentPieceId, briefId }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate visual brief');
      }

      const result = await response.json();
      
      // Update content piece with visual brief
      setContent((prev) =>
        prev.map((c) =>
          c._id === contentPieceId
            ? {
                ...c,
                visualBrief: {
                  ...c.visualBrief,
                  description: result.visualBrief.description,
                  visualConcept: result.visualBrief.visualConcept,
                  mainElements: result.visualBrief.mainElements,
                  colorStrategy: result.visualBrief.colorStrategy,
                  typography: result.visualBrief.typography,
                  layout: result.visualBrief.layout,
                  keyVisuals: result.visualBrief.keyVisuals,
                  designTips: result.visualBrief.designTips,
                  canvaTemplate: result.visualBrief.canvaTemplate,
                },
              }
            : c
        )
      );

      toast.success('Visual brief generated! 🎨');
    } catch (error) {
      console.error(error);
      toast.error('Failed to generate visual brief');
    } finally {
      setGeneratingBriefId(null);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <span className="text-blue-600">📝</span>
        Generated Content ({content.length})
      </h3>

      <div className="space-y-3">
        {content.map((piece) => (
          <div key={piece._id} className="card p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-semibold text-slate-900 capitalize">
                    {piece.platform}
                  </span>
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                    {piece.scheduleInfo.status}
                  </span>
                </div>
                <p className="text-sm text-slate-600 line-clamp-2">
                  {piece.caption}
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setExpandedId(expandedId === piece._id ? null : piece._id)
                }
                className="text-sm text-slate-500 hover:text-slate-700"
              >
                {expandedId === piece._id ? '▼' : '▶'}
              </button>
            </div>

            {expandedId === piece._id && (
              <div className="mt-3 pt-3 border-t border-slate-200 space-y-3">
                {/* Full Caption */}
                <div>
                  <p className="text-xs font-medium text-slate-600 mb-1">
                    Full Caption:
                  </p>
                  <p className="text-sm text-slate-700 bg-slate-50 p-2 rounded">
                    {piece.caption}
                  </p>
                </div>

                {/* Hashtags */}
                {piece.hashtags && piece.hashtags.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-slate-600 mb-1">
                      Hashtags:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {piece.hashtags.map((tag) => (
                        <span
                          key={tag}
                          className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Visual Brief Section */}
                <div>
                  <VisualBriefViewer
                    contentPieceId={piece._id!}
                    platform={piece.platform}
                    visualBrief={
                      piece.visualBrief?.description
                        ? {
                            title: `${piece.platform} Visual Brief`,
                            description: piece.visualBrief.description || '',
                            visualConcept: (piece.visualBrief as any)?.visualConcept || '',
                            mainElements: (piece.visualBrief as any)?.mainElements || [],
                            colorStrategy: (piece.visualBrief as any)?.colorStrategy || '',
                            typography: (piece.visualBrief as any)?.typography || {
                              heading: '',
                              body: '',
                            },
                            layout: (piece.visualBrief as any)?.layout || '',
                            keyVisuals: (piece.visualBrief as any)?.keyVisuals || [],
                            designTips: (piece.visualBrief as any)?.designTips || [],
                            canvaTemplate: (piece.visualBrief as any)?.canvaTemplate,
                          }
                        : undefined
                    }
                    isLoading={generatingBriefId === piece._id}
                    onGenerate={handleGenerateVisualBrief}
                  />
                </div>

                {/* Design Upload Section */}
                <div>
                  <DesignUpload
                    contentPieceId={piece._id!}
                    platform={piece.platform}
                    onUploadSuccess={(imageUrl) => {
                      toast.success('Design uploaded! Ready to schedule.');
                    }}
                  />
                </div>

                {/* Uploaded Image Preview */}
                {piece.designImage?.url && (
                  <div>
                    <p className="text-xs font-medium text-slate-600 mb-2">
                      ✓ Design Uploaded
                    </p>
                    <img
                      src={piece.designImage.url}
                      alt="Uploaded design"
                      className="rounded border border-slate-200 max-h-48 object-cover"
                    />
                  </div>
                )}

                {/* Schedule Info */}
                {piece.scheduleInfo && (
                  <div>
                    <p className="text-xs font-medium text-slate-600 mb-1">
                      Schedule:
                    </p>
                    <div className="text-sm text-slate-700 bg-slate-50 p-2 rounded space-y-1">
                      <p>
                        <span className="font-medium">Date:</span>{' '}
                        {new Date(piece.scheduleInfo.scheduledDate).toLocaleDateString(
                          'id-ID'
                        )}
                      </p>
                      <p>
                        <span className="font-medium">Time:</span>{' '}
                        {piece.scheduleInfo.scheduledTime}
                      </p>
                      <p>
                        <span className="font-medium">Timezone:</span>{' '}
                        {piece.scheduleInfo.timezone}
                      </p>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <button className="btn-ghost text-sm">
                    ✎ Edit Caption
                  </button>
                </div>

                {/* Publish Button */}
                <div>
                  <PublishButton
                    contentPieceId={piece._id!}
                    platform={piece.platform}
                    isScheduled={piece.scheduleInfo.status === 'scheduled'}
                    hasDesign={!!piece.designImage?.url}
                    onPublishSuccess={() => {
                      toast.success('Post published successfully! 🎉');
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
