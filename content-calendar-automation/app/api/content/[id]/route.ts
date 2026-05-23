// app/api/content/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { contentRepository } from '@/lib/db/repositories';
import type { ContentPiece } from '@/lib/db/schema';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Note: contentRepository doesn't have findById, but we can use MongoDB directly
    // For now, return error - will be used for fetching single piece later
    return NextResponse.json(
      { error: 'Not implemented yet' },
      { status: 501 }
    );
  } catch (error) {
    console.error(`[GET /api/content/${params.id}]`, error);
    return NextResponse.json(
      { error: 'Failed to fetch content' },
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

    const updates: Partial<ContentPiece> = {};

    // Allow updating specific fields
    const allowedFields = [
      'caption',
      'hashtags',
      'visualBrief',
      'scheduleInfo',
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

    // Note: Need to add updateById method to contentRepository
    // For now, this is a placeholder
    return NextResponse.json(
      { error: 'Not fully implemented yet' },
      { status: 501 }
    );
  } catch (error) {
    console.error(`[PUT /api/content/${params.id}]`, error);
    return NextResponse.json(
      { error: 'Failed to update content' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Mark as draft/deleted
    return NextResponse.json(
      { error: 'Not fully implemented yet' },
      { status: 501 }
    );
  } catch (error) {
    console.error(`[DELETE /api/content/${params.id}]`, error);
    return NextResponse.json(
      { error: 'Failed to delete content' },
      { status: 500 }
    );
  }
}
