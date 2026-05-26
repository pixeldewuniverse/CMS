// app/api/briefs/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { briefRepository } from '@/lib/db/repositories';
import type { BusinessBrief } from '@/lib/db/schema';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const brief = await briefRepository.findById(params.id);

    if (!brief) {
      return NextResponse.json({ error: 'Brief not found' }, { status: 404 });
    }

    return NextResponse.json(brief, { status: 200 });
  } catch (error) {
    console.error(`[GET /api/briefs/${params.id}]`, error);
    return NextResponse.json(
      { error: 'Failed to fetch brief' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    const updates: Partial<BusinessBrief> = {};

    // Only update allowed fields
    const allowedFields = [
      'name',
      'description',
      'productName',
      'productDescription',
      'targetAudience',
      'goal',
      'tone',
      'platforms',
      'colorPalette',
      'brandGuidelines',
      'designStyle',
    ];

    for (const field of allowedFields) {
      if (field in body) {
        (updates as any)[field] = body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    const brief = await briefRepository.update(params.id, updates);

    if (!brief) {
      return NextResponse.json({ error: 'Brief not found' }, { status: 404 });
    }

    return NextResponse.json(brief, { status: 200 });
  } catch (error) {
    console.error(`[PUT /api/briefs/${params.id}]`, error);
    return NextResponse.json(
      { error: 'Failed to update brief' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const success = await briefRepository.delete(params.id);

    if (!success) {
      return NextResponse.json({ error: 'Brief not found' }, { status: 404 });
    }

    return NextResponse.json(
      { message: 'Brief archived successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error(`[DELETE /api/briefs/${params.id}]`, error);
    return NextResponse.json(
      { error: 'Failed to delete brief' },
      { status: 500 }
    );
  }
}
