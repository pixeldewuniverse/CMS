// app/api/content/route.ts
import { NextRequest, NextResponse } from 'next/server';
import {
  briefRepository,
  ideaRepository,
  contentRepository,
} from '@/lib/db/repositories';
import { generateCaptionsForAllPlatforms } from '@/lib/ai/generateCaption';
import type { ContentPiece } from '@/lib/db/schema';

export async function POST(request: NextRequest) {
  try {
    const { ideaId, briefId } = await request.json();

    if (!ideaId || !briefId) {
      return NextResponse.json(
        { error: 'ideaId and briefId are required' },
        { status: 400 }
      );
    }

    // Get brief & idea
    const brief = await briefRepository.findById(briefId);
    const idea = await ideaRepository.findByBriefId(briefId).then((ideas) =>
      ideas.find((i) => i._id === ideaId)
    );

    if (!brief || !idea) {
      return NextResponse.json(
        { error: 'Brief or idea not found' },
        { status: 404 }
      );
    }

    // Only generate for approved ideas
    if (idea.status !== 'approved') {
      return NextResponse.json(
        { error: 'Idea must be approved before generating content' },
        { status: 400 }
      );
    }

    // Generate captions per platform
    const captions = await generateCaptionsForAllPlatforms(brief, idea);

    // Create content pieces per platform
    const contentPieces: ContentPiece[] = [];

    for (const [platform, captionData] of Object.entries(captions)) {
      // Only create for enabled platforms
      if (!brief.platforms[platform as keyof typeof brief.platforms]?.enabled) {
        continue;
      }

      const contentPiece: Omit<ContentPiece, '_id'> = {
        ideaId: ideaId,
        briefId: briefId,
        platform: platform as ContentPiece['platform'],

        // Caption & metadata
        caption: captionData.caption,
        hashtags: captionData.hashtags,

        // Visual brief (empty for now, filled in step 5)
        visualBrief: {
          description: '',
          colorReferences: brief.colorPalette,
          styleNotes: `${brief.designStyle} style for ${brief.productName}`,
          dimensionPreset:
            platform === 'instagram'
              ? '1080x1080'
              : platform === 'tiktok'
                ? '1080x1920'
                : '1200x628',
        },

        // Schedule (empty, filled in step 7)
        scheduleInfo: {
          scheduledDate: new Date(),
          scheduledTime: '10:00',
          timezone: 'Asia/Jakarta',
          status: 'draft',
        },

        metadata: {
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      };

      const saved = await contentRepository.create(contentPiece);
      contentPieces.push(saved);
    }

    // Mark idea as "used"
    await ideaRepository.updateStatus(ideaId, 'used');

    return NextResponse.json(
      {
        count: contentPieces.length,
        contentPieces,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[POST /api/content]', error);
    return NextResponse.json(
      { error: 'Failed to generate content' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const briefId = request.nextUrl.searchParams.get('briefId');

    if (!briefId) {
      return NextResponse.json(
        { error: 'briefId is required' },
        { status: 400 }
      );
    }

    const contentPieces = await contentRepository.findByBriefId(briefId);
    return NextResponse.json(contentPieces, { status: 200 });
  } catch (error) {
    console.error('[GET /api/content]', error);
    return NextResponse.json(
      { error: 'Failed to fetch content' },
      { status: 500 }
    );
  }
}
