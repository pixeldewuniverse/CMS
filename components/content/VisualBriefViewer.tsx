// components/content/VisualBriefViewer.tsx
'use client';

import { useState } from 'react';

interface VisualBriefData {
  title: string;
  description: string;
  visualConcept: string;
  mainElements: Array<{
    name: string;
    description: string;
  }>;
  colorStrategy: string;
  typography: {
    heading: string;
    body: string;
  };
  layout: string;
  keyVisuals: string[];
  designTips: string[];
  canvaTemplate?: string;
}

interface VisualBriefViewerProps {
  contentPieceId: string;
  platform: string;
  visualBrief?: VisualBriefData;
  isLoading?: boolean;
  onGenerate?: (contentPieceId: string) => void;
  onCanvaClick?: () => void;
}

export default function VisualBriefViewer({
  contentPieceId,
  platform,
  visualBrief,
  isLoading = false,
  onGenerate,
  onCanvaClick,
}: VisualBriefViewerProps) {
  const [expanded, setExpanded] = useState(true);

  if (!visualBrief && !isLoading && onGenerate) {
    return (
      <div className="bg-slate-50 border border-slate-200 rounded p-4">
        <button
          onClick={() => onGenerate(contentPieceId)}
          className="btn-primary"
          disabled={isLoading}
        >
          {isLoading ? 'Generating...' : '🎨 Generate Visual Brief'}
        </button>
      </div>
    );
  }

  if (!visualBrief) {
    return null;
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 rounded-lg overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-3 flex items-center justify-between bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 transition"
      >
        <div className="text-left">
          <h3 className="font-semibold text-lg">{visualBrief.title}</h3>
          <p className="text-sm text-blue-100">{visualBrief.description}</p>
        </div>
        <span className="text-xl">{expanded ? '▼' : '▶'}</span>
      </button>

      {/* Content */}
      {expanded && (
        <div className="p-6 space-y-6">
          {/* Visual Concept */}
          <div>
            <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
              <span>💡</span> Visual Concept
            </h4>
            <p className="text-slate-700 bg-white p-3 rounded">
              {visualBrief.visualConcept}
            </p>
          </div>

          {/* Main Elements */}
          {visualBrief.mainElements && visualBrief.mainElements.length > 0 && (
            <div>
              <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <span>🎯</span> Design Elements
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {visualBrief.mainElements.map((element, idx) => (
                  <div key={idx} className="bg-white p-3 rounded border-l-4 border-blue-500">
                    <p className="font-medium text-slate-900">{element.name}</p>
                    <p className="text-sm text-slate-600 mt-1">
                      {element.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Color Strategy */}
          <div>
            <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
              <span>🎨</span> Color Strategy
            </h4>
            <p className="text-slate-700 bg-white p-3 rounded">
              {visualBrief.colorStrategy}
            </p>
          </div>

          {/* Typography */}
          <div>
            <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <span>✍️</span> Typography
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-white p-3 rounded">
                <p className="text-xs font-medium text-slate-600 mb-1">
                  HEADINGS
                </p>
                <p className="text-slate-700">{visualBrief.typography.heading}</p>
              </div>
              <div className="bg-white p-3 rounded">
                <p className="text-xs font-medium text-slate-600 mb-1">
                  BODY TEXT
                </p>
                <p className="text-slate-700">{visualBrief.typography.body}</p>
              </div>
            </div>
          </div>

          {/* Layout */}
          <div>
            <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
              <span>📐</span> Layout & Composition
            </h4>
            <p className="text-slate-700 bg-white p-3 rounded">
              {visualBrief.layout}
            </p>
          </div>

          {/* Key Visuals */}
          {visualBrief.keyVisuals && visualBrief.keyVisuals.length > 0 && (
            <div>
              <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <span>⭐</span> Key Visual Elements
              </h4>
              <div className="flex flex-wrap gap-2">
                {visualBrief.keyVisuals.map((visual, idx) => (
                  <span
                    key={idx}
                    className="bg-white px-3 py-2 rounded border border-blue-200 text-sm text-slate-700"
                  >
                    {visual}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Design Tips */}
          {visualBrief.designTips && visualBrief.designTips.length > 0 && (
            <div>
              <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <span>💡</span> Design Tips for Max Engagement
              </h4>
              <ul className="space-y-2">
                {visualBrief.designTips.map((tip, idx) => (
                  <li key={idx} className="flex gap-2 text-slate-700">
                    <span className="text-blue-500 font-bold">→</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Canva Template */}
          {visualBrief.canvaTemplate && (
            <div className="bg-orange-50 border border-orange-200 rounded p-4">
              <p className="font-medium text-slate-900 mb-2">
                🎨 Suggested Canva Template
              </p>
              <p className="text-slate-700 mb-3">
                {visualBrief.canvaTemplate}
              </p>
              {onCanvaClick && (
                <button
                  onClick={onCanvaClick}
                  className="btn-secondary text-sm"
                >
                  → Open Canva (coming soon)
                </button>
              )}
            </div>
          )}

          {/* Copy Brief Button */}
          <div className="bg-blue-50 p-4 rounded border border-blue-200">
            <button
              onClick={() => {
                const briefText = `
Visual Brief: ${visualBrief.title}

Concept: ${visualBrief.visualConcept}

Elements:
${visualBrief.mainElements?.map((e) => `- ${e.name}: ${e.description}`).join('\n')}

Colors: ${visualBrief.colorStrategy}

Typography:
- Headings: ${visualBrief.typography.heading}
- Body: ${visualBrief.typography.body}

Layout: ${visualBrief.layout}

Key Visuals: ${visualBrief.keyVisuals?.join(', ')}

Tips:
${visualBrief.designTips?.map((t) => `- ${t}`).join('\n')}
`;
                navigator.clipboard.writeText(briefText);
              }}
              className="btn-ghost text-sm w-full"
            >
              📋 Copy Brief to Clipboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
