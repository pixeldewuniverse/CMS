// app/api/visual-brief/route.ts
import { NextRequest, NextResponse } from 'next/server';
import {
  briefRepository,
  ideaRepository,
  contentRepository,
} from '@/lib/db/repositories';
import { generateVisualBrief } from '@/lib/ai/generateVisualBrief';
import { connectMongoDB } from '@/lib/db/mongodb';
import { ObjectId } from 'mongodb';

export async function POST(request: NextRequest) {
  try {
    const { contentPieceId, briefId } = await request.json();

    if (!contentPieceId || !briefId) {
      return NextResponse.json(
        { error: 'contentPieceId and briefId are required' },
        { status: 400 }
      );
    }

    // Get brief
    const brief = await briefRepository.findById(briefId);
    if (!brief) {
      return NextResponse.json({ error: 'Brief not found' }, { status: 404 });
    }

    // Get content piece
    const db = await connectMongoDB();
    const contentPiece = await db.collection('contentPieces').findOne({
      _id: new ObjectId(contentPieceId),
    });

    if (!contentPiece) {
      return NextResponse.json(
        { error: 'Content piece not found' },
        { status: 404 }
      );
    }

    // Get idea
    const idea = await ideaRepository.findByBriefId(briefId).then((ideas) =>
      ideas.find((i) => i._id === contentPiece.ideaId)
    );

    if (!idea) {
      return NextResponse.json({ error: 'Idea not found' }, { status: 404 });
    }

    // Generate visual brief
    const visualBrief = await generateVisualBrief(brief, idea, contentPiece);

    // Update content piece with visual brief
    await db.collection('contentPieces').updateOne(
      { _id: new ObjectId(contentPieceId) },
      {
        $set: {
          visualBrief: {
            ...contentPiece.visualBrief,
            description: visualBrief.description,
            visualConcept: visualBrief.visualConcept,
            mainElements: visualBrief.mainElements,
            colorStrategy: visualBrief.colorStrategy,
            typography: visualBrief.typography,
            layout: visualBrief.layout,
            keyVisuals: visualBrief.keyVisuals,
            designTips: visualBrief.designTips,
            canvaTemplate: visualBrief.canvaTemplate,
          },
          'metadata.updatedAt': new Date(),
        },
      }
    );

    // Fetch updated piece
    const updated = await db.collection('contentPieces').findOne({
      _id: new ObjectId(contentPieceId),
    });

    return NextResponse.json(
      {
        contentPieceId,
        visualBrief,
        message: 'Visual brief generated successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[POST /api/visual-brief]', error);
    return NextResponse.json(
      { error: 'Failed to generate visual brief' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const contentPieceId = request.nextUrl.searchParams.get('contentPieceId');

    if (!contentPieceId) {
      return NextResponse.json(
        { error: 'contentPieceId is required' },
        { status: 400 }
      );
    }

    const db = await connectMongoDB();
    const contentPiece = await db.collection('contentPieces').findOne({
      _id: new ObjectId(contentPieceId),
    });

    if (!contentPiece) {
      return NextResponse.json(
        { error: 'Content piece not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        contentPieceId,
        visualBrief: contentPiece.visualBrief,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[GET /api/visual-brief]', error);
    return NextResponse.json(
      { error: 'Failed to fetch visual brief' },
      { status: 500 }
    );
  }
}
