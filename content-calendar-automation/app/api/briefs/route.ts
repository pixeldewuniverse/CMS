// app/api/briefs/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { briefRepository } from '@/lib/db/repositories';
import type { BusinessBrief } from '@/lib/db/schema';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validation
    const required = ['name', 'productName', 'targetAudience', 'goal', 'userId'];
    for (const field of required) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Field "${field}" is required` },
          { status: 400 }
        );
      }
    }

    // Create brief
    const briefData: Omit<BusinessBrief, '_id'> = {
      userId: body.userId,
      name: body.name,
      description: body.description || '',
      productName: body.productName,
      productDescription: body.productDescription || '',
      targetAudience: body.targetAudience,
      goal: body.goal,
      tone: body.tone || 'Professional',
      platforms: body.platforms || {
        instagram: { enabled: true, postFrequency: '3x/week' },
        linkedin: { enabled: true, postFrequency: '3x/week' },
        tiktok: { enabled: false, postFrequency: '3x/week' },
        twitter: { enabled: false, postFrequency: '1x/week' },
        facebook: { enabled: false, postFrequency: '1x/week' },
      },
      colorPalette: body.colorPalette || ['#534AB7', '#0F6E56'],
      brandGuidelines: body.brandGuidelines,
      designStyle: body.designStyle || 'Modern',
      createdAt: new Date(),
      updatedAt: new Date(),
      status: 'active',
    };

    const brief = await briefRepository.create(briefData);

    return NextResponse.json(brief, { status: 201 });
  } catch (error) {
    console.error('[POST /api/briefs]', error);
    return NextResponse.json(
      { error: 'Failed to create brief' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    const briefs = await briefRepository.findByUserId(userId);
    return NextResponse.json(briefs, { status: 200 });
  } catch (error) {
    console.error('[GET /api/briefs]', error);
    return NextResponse.json(
      { error: 'Failed to fetch briefs' },
      { status: 500 }
    );
  }
}
