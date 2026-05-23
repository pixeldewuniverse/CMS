// app/api/ideas/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { briefRepository, ideaRepository } from '@/lib/db/repositories';
import { generateContentIdeas } from '@/lib/ai/generateIdeas';

export async function POST(request: NextRequest) {
  try {
    const { briefId, ideaCount = 5 } = await request.json();

    if (!briefId) {
      return NextResponse.json(
        { error: 'briefId is required' },
        { status: 400 }
      );
    }

    // Get brief
    const brief = await briefRepository.findById(briefId);
    if (!brief) {
      return NextResponse.json({ error: 'Brief not found' }, { status: 404 });
    }

    // Generate ideas dengan Claude
    const generatedIdeas = await generateContentIdeas(brief, ideaCount);

    // Save to database
    const savedIdeas = [];
    for (const idea of generatedIdeas) {
      const saved = await ideaRepository.create({
        briefId,
        topic: idea.topic,
        angle: idea.angle,
        format: idea.format,
        platforms: idea.platforms,
        description: idea.description,
        generatedBy: 'claude-opus',
        status: 'suggested',
      });
      savedIdeas.push(saved);
    }

    return NextResponse.json(
      {
        count: savedIdeas.length,
        ideas: savedIdeas,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[POST /api/ideas]', error);
    return NextResponse.json(
      { error: 'Failed to generate ideas' },
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

    const ideas = await ideaRepository.findByBriefId(briefId);
    return NextResponse.json(ideas, { status: 200 });
  } catch (error) {
    console.error('[GET /api/ideas]', error);
    return NextResponse.json(
      { error: 'Failed to fetch ideas' },
      { status: 500 }
    );
  }
}
