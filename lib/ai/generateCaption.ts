// lib/ai/generateCaption.ts
import Anthropic from '@anthropic-ai/sdk';
import type { BusinessBrief, ContentIdea } from '@/lib/db/schema';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface GeneratedCaption {
  caption: string;
  hashtags: string[];
  callToAction?: string;
}

export async function generateCaption(
  brief: BusinessBrief,
  idea: ContentIdea,
  platform: string
): Promise<GeneratedCaption> {
  const platformTones: Record<string, string> = {
    instagram:
      'Engaging, visually-oriented, emoji-friendly, conversational. Include call-to-action.',
    linkedin:
      'Professional yet approachable, thought-leadership focused, industry insights. Encourage discussion.',
    tiktok: 'Casual, trendy, short-form, Gen-Z friendly. Hook in first sentence. Use trending language.',
    twitter:
      'Witty, concise, thread-friendly if needed. Include conversation starters. Personality-driven.',
    facebook:
      'Community-focused, storytelling, friendly tone. Encourage shares and comments.',
  };

  const platformCharLimits: Record<string, number> = {
    instagram: 2200,
    linkedin: 3000,
    tiktok: 150,
    twitter: 280,
    facebook: 1000,
  };

  const prompt = `
Generate a social media caption for ${platform}.

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

**Tone:** ${brief.tone}

**Platform-specific tone:**
${platformTones[platform] || 'Engaging and relevant to the platform.'}

**Character limit:** Max ${platformCharLimits[platform] || 280} characters (excluding hashtags)

**Requirements:**
1. Caption should match the ${platform} character limit
2. Include 3-7 relevant hashtags (on separate line)
3. Optional: Include a call-to-action (like, comment, share, click link, etc)
4. Keep tone consistent with: ${brief.tone}
5. Align with product and campaign goal

**Return ONLY valid JSON, no markdown:**
{
  "caption": "string (main caption text, within char limit)",
  "hashtags": ["string array of hashtags with # symbol"],
  "callToAction": "optional string (what user should do)"
}
`;

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1000,
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

    const result: GeneratedCaption = JSON.parse(cleanedText);

    // Validate caption length
    const charLimit = platformCharLimits[platform] || 2200;
    if (result.caption.length > charLimit) {
      result.caption = result.caption.substring(0, charLimit - 3) + '...';
    }

    return result;
  } catch (error) {
    console.error('Failed to parse AI response:', responseText);
    throw new Error('Failed to generate caption');
  }
}

export async function generateCaptionsForAllPlatforms(
  brief: BusinessBrief,
  idea: ContentIdea
): Promise<Record<string, GeneratedCaption>> {
  const enabledPlatforms = Object.entries(brief.platforms)
    .filter(([_, config]) => config.enabled)
    .map(([name, _]) => name);

  const captions: Record<string, GeneratedCaption> = {};

  // Generate caption per platform in parallel
  const results = await Promise.allSettled(
    enabledPlatforms.map((platform) =>
      generateCaption(brief, idea, platform).then((caption) => ({
        platform,
        caption,
      }))
    )
  );

  for (let i = 0; i < results.length; i++) {
    const result = results[i];
    const platform = enabledPlatforms[i];
    if (result.status === 'fulfilled') {
      captions[result.value.platform] = result.value.caption;
    } else {
      console.error(`Failed to generate caption for ${platform}:`, result.reason);
      captions[platform] = {
        caption: idea.description,
        hashtags: [],
      };
    }
  }

  return captions;
}
