// lib/ai/generateIdeas.ts
import Anthropic from '@anthropic-ai/sdk';
import type { BusinessBrief, ContentIdea } from '@/lib/db/schema';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface GeneratedIdea {
  topic: string;
  angle: string;
  format: string;
  platforms: string[];
  description: string;
}

export async function generateContentIdeas(
  brief: BusinessBrief,
  ideaCount: number = 5
): Promise<GeneratedIdea[]> {
  const enabledPlatforms = Object.entries(brief.platforms)
    .filter(([_, config]) => config.enabled)
    .map(([name, _]) => name)
    .join(', ');

  const prompt = `
Generate ${ideaCount} creative content ideas for a social media strategy.

**Product:**
- Name: ${brief.productName}
- Description: ${brief.productDescription}

**Target Audience:** ${brief.targetAudience}

**Goal:** ${brief.goal}

**Tone:** ${brief.tone}

**Platforms:** ${enabledPlatforms}

**Design Style:** ${brief.designStyle}

**Color Palette:** ${brief.colorPalette.join(', ')}

For each idea, provide:
1. Topic (title)
2. Angle (e.g., "Behind-the-scenes", "Tutorial", "Trend", "User story", "Educational")
3. Format (e.g., "Carousel", "Video", "Static post", "Reel", "Story", "Long-form")
4. Best platforms for this idea (comma-separated)
5. Detailed description (2-3 sentences)

Return ONLY valid JSON array, no markdown, no explanation:
[
  {
    "topic": "string",
    "angle": "string",
    "format": "string",
    "platforms": ["string"],
    "description": "string"
  }
]
`;

  const message = await anthropic.messages.create({
    model: 'claude-opus-4-20250805',
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
    // Remove markdown code blocks if present
    const cleanedText = responseText
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    const ideas: GeneratedIdea[] = JSON.parse(cleanedText);
    return ideas;
  } catch (error) {
    console.error('Failed to parse AI response:', responseText);
    throw new Error('Failed to generate content ideas');
  }
}
