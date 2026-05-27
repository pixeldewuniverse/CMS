// app/api/ideas/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { ideaRepository } from '@/lib/db/repositories';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const { status, rejectionReason } = await request.json();

    if (!['approved', 'rejected', 'suggested', 'used'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    const updated = await ideaRepository.updateStatus(id, status, rejectionReason);

    if (!updated) {
      return NextResponse.json(
        { error: 'Idea not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error(`[PUT /api/ideas/${id}]`, error);
    return NextResponse.json(
      { error: 'Failed to update idea' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const updated = await ideaRepository.updateStatus(id, 'rejected', 'Manually deleted');

    if (!updated) {
      return NextResponse.json(
        { error: 'Idea not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Idea deleted' }, { status: 200 });
  } catch (error) {
    console.error(`[DELETE /api/ideas/${id}]`, error);
    return NextResponse.json(
      { error: 'Failed to delete idea' },
      { status: 500 }
    );
  }
}
