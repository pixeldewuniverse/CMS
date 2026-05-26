// app/api/publish/route.ts
import { NextRequest, NextResponse } from 'next/server';
import {
  briefRepository,
  contentRepository,
} from '@/lib/db/repositories';
import { BufferService, LaterService } from '@/lib/services/bufferService';
import { connectMongoDB } from '@/lib/db/mongodb';
import { ObjectId } from 'mongodb';

export async function POST(request: NextRequest) {
  try {
    const {
      contentPieceId,
      publishService,
      accessToken,
      profileId,
    } = await request.json();

    if (!contentPieceId || !publishService || !accessToken) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
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

    // Validate scheduled time
    const scheduledTime = new Date(contentPiece.scheduleInfo.scheduledDate);
    if (scheduledTime < new Date()) {
      return NextResponse.json(
        { error: 'Cannot publish posts in the past' },
        { status: 400 }
      );
    }

    let publishResult: any;

    if (publishService === 'buffer') {
      if (!profileId) {
        return NextResponse.json(
          { error: 'Buffer profileId required' },
          { status: 400 }
        );
      }

      const bufferService = new BufferService(accessToken);
      const postData = {
        text: `${contentPiece.caption}\n\n${contentPiece.hashtags.join(' ')}`,
        media: contentPiece.designImage?.url
          ? {
              url: `${process.env.NEXT_PUBLIC_APP_URL}${contentPiece.designImage.url}`,
            }
          : undefined,
        publish_at: Math.floor(scheduledTime.getTime() / 1000), // Unix timestamp
      };

      publishResult = await bufferService.schedulePost(profileId, postData);
    } else if (publishService === 'later') {
      const laterService = new LaterService(accessToken);
      const postData = {
        caption: `${contentPiece.caption}\n\n${contentPiece.hashtags.join(' ')}`,
        image_url: contentPiece.designImage?.url
          ? `${process.env.NEXT_PUBLIC_APP_URL}${contentPiece.designImage.url}`
          : '',
        posted_at: scheduledTime.toISOString(),
        channels: [contentPiece.platform],
      };

      publishResult = await laterService.schedulePost(postData);
    } else {
      return NextResponse.json(
        { error: 'Unknown publish service' },
        { status: 400 }
      );
    }

    if (!publishResult.success) {
      return NextResponse.json(
        { error: publishResult.message || 'Failed to publish' },
        { status: 500 }
      );
    }

    // Update content piece dengan publish info
    await db.collection('contentPieces').updateOne(
      { _id: new ObjectId(contentPieceId) },
      {
        $set: {
          'scheduleInfo.status': 'published',
          'scheduleInfo.bufferId': publishResult.buffer_id,
          'scheduleInfo.publishService': publishService,
          'scheduleInfo.publishedAt': new Date(),
          'metadata.updatedAt': new Date(),
        },
      }
    );

    return NextResponse.json(
      {
        success: true,
        publishId: publishResult.buffer_id,
        message: `Post scheduled to ${publishService}`,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[POST /api/publish]', error);
    return NextResponse.json(
      { error: 'Failed to publish post' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const service = request.nextUrl.searchParams.get('service');
    const accessToken = request.nextUrl.searchParams.get('accessToken');

    if (!service || !accessToken) {
      return NextResponse.json(
        { error: 'service and accessToken required' },
        { status: 400 }
      );
    }

    let profiles = [];

    if (service === 'buffer') {
      const bufferService = new BufferService(accessToken);
      profiles = await bufferService.getProfiles();
    } else if (service === 'later') {
      // Later doesn't have a public profiles endpoint
      profiles = [
        { id: 'later-instagram', name: 'Instagram' },
        { id: 'later-tiktok', name: 'TikTok' },
        { id: 'later-facebook', name: 'Facebook' },
      ];
    }

    return NextResponse.json(
      { profiles },
      { status: 200 }
    );
  } catch (error) {
    console.error('[GET /api/publish]', error);
    return NextResponse.json(
      { error: 'Failed to fetch profiles' },
      { status: 500 }
    );
  }
}
