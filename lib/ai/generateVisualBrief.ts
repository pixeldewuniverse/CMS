// lib/ai/generateVisualBrief.ts
import Anthropic from '@anthropic-ai/sdk';
import type { BusinessBrief, ContentIdea, ContentPiece } from '@/lib/db/schema';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface DesignElement {
  name: string;
  description: string;
}

interface GeneratedVisualBrief {
  title: string;
  description: string;
  visualConcept: string;
  mainElements: DesignElement[];
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

export async function generateVisualBrief(
  brief: BusinessBrief,
  idea: ContentIdea,
  contentPiece: ContentPiece
): Promise<GeneratedVisualBrief> {
  const platformSpecs: Record<string, string> = {
    instagram:
      'Square (1080x1080). Visually bold, eye-catching. High contrast. Optimized for feed scroll.',
    linkedin:
      'Landscape (1200x628). Professional, clean. Text-heavy OK. Focus on credibility.',
    tiktok:
      'Vertical (1080x1920). Trendy, dynamic. Fast cuts work well. Text overlays important.',
    twitter: 'Landscape (1200x628). Quick impact. Text-heavy OK. Emoji friendly.',
    facebook:
      'Landscape or square (1200x628 or 1080x1080). Story-focused. Room for longer text.',
  };

  const prompt = `
Generate a detailed visual design brief for social media content.

**Product & Campaign:**
- Product: ${brief.productName}
- Product Description: ${brief.productDescription}
- Campaign Goal: ${brief.goal}
- Target Audience: ${brief.targetAudience}

**Content Idea:**
- Topic: ${idea.topic}
- Angle: ${idea.angle}
- Format: ${idea.format}
- Description: ${idea.description}

**Platform:** ${contentPiece.platform}
**Platform Specs:** ${platformSpecs[contentPiece.platform]}

**Brand:**
- Tone: ${brief.tone}
- Design Style: ${brief.designStyle}
- Color Palette: ${brief.colorPalette.join(', ')}

**Caption to Accompany:**
${contentPiece.caption}

**Requirements:**
1. Create a visual design brief for a designer or Canva user
2. Include specific design elements and composition
3. Color strategy using the brand palette
4. Typography recommendations
5. Layout structure
6. Key visual elements
7. Design tips for maximum engagement
8. Optional: Canva template recommendation (if applicable)

**Return ONLY valid JSON:**
{
  "title": "string (brief title)",
  "description": "string (1-2 sentence overview)",
  "visualConcept": "string (main visual concept/theme)",
  "mainElements": [
    {
      "name": "string (element name)",
      "description": "string (what it looks like)"
    }
  ],
  "colorStrategy": "string (how to use colors)",
  "typography": {
    "heading": "string (font style/size for headings)",
    "body": "string (font style/size for body text)"
  },
  "layout": "string (composition/layout description)",
  "keyVisuals": ["string array of visual elements to include"],
  "designTips": ["string array of tips for max engagement"],
  "canvaTemplate": "optional: canva template name or type"
}
`;

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2000,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  });

  // Extract text response
  const responseText =
    message.content[0].type === 'text' ? message.content[0].text : '';

  // Parse JSON
  try {
    const cleanedText = responseText
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    const result: GeneratedVisualBrief = JSON.parse(cleanedText);
    return result;
  } catch (error) {
    console.error('Failed to parse AI response:', responseText);
    throw new Error('Failed to generate visual brief');
  }
}

/**
 * Generate visual brief for all content pieces of a brief
 */
export async function generateVisualBriefsForBrief(
  brief: BusinessBrief,
  contentPieces: ContentPiece[],
  ideaMap: Record<string, ContentIdea>
): Promise<Record<string, GeneratedVisualBrief>> {
  const briefs: Record<string, GeneratedVisualBrief> = {};

  const results = await Promise.allSettled(
    contentPieces.map((piece) =>
      generateVisualBrief(brief, ideaMap[piece.ideaId], piece).then(
        (visualBrief) => ({
          contentPieceId: piece._id!,
          visualBrief,
        })
      )
    )
  );

  for (const result of results) {
    if (result.status === 'fulfilled') {
      briefs[result.value.contentPieceId] = result.value.visualBrief;
    } else {
      console.error('Failed to generate visual brief:', result.reason);
    }
  }

  return briefs;
}
