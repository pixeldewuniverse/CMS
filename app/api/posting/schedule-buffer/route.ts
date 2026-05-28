// app/api/posting/schedule-buffer/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectMongoDB } from '@/lib/db/mongodb';
import { BufferService } from '@/lib/services/bufferService';
import { ObjectId } from 'mongodb';

interface ScheduleRequest {
  contentPieceId: string;
  bufferAccessToken?: string;
  laterApiKey?: string;
  platform: 'buffer' | 'later';
  profileId?: string;
}

export async function POST(request: NextRequest) {
  try {
    const {
      contentPieceId,
      bufferAccessToken,
      laterApiKey,
      platform,
      profileId,
    } = (await request.json()) as ScheduleRequest;

    if (!contentPieceId || !platform) {
      return NextResponse.json(
        { error: 'contentPieceId and platform are required' },
        { status: 400 }
      );
    }

    const db = await connectMongoDB();

    // Get content piece
    const contentPiece = await db.collection('contentPieces').findOne({
      _id: new ObjectId(contentPieceId),
    });

    if (!contentPiece) {
      return NextResponse.json(
        { error: 'Content piece not found' },
        { status: 404 }
      );
    }

    // Validate token
    const token =
      platform === 'buffer' ? bufferAccessToken : laterApiKey;
    if (!token) {
      return NextResponse.json(
        { error: `${platform} token is required` },
        { status: 400 }
      );
    }

    let result: any;

    if (platform === 'buffer') {
      if (!profileId) {
        return NextResponse.json(
          { error: 'profileId required for Buffer' },
          { status: 400 }
        );
      }

      const bufferService = new BufferService(token);

      // Prepare Buffer post
      const publishAt = Math.floor(
        new Date(contentPiece.scheduleInfo.scheduledDate).getTime() / 1000
      );

      result = await bufferService.schedulePost(profileId, {
        text: `${contentPiece.caption}\n\n${contentPiece.hashtags.join(' ')}`,
        media: contentPiece.designImage?.url
          ? { url: contentPiece.designImage.url }
          : undefined,
        publish_at: publishAt,
      });
    } else {
      // Later implementation (simplified)
      result = {
        success: true,
        message: 'Later scheduling not fully implemented yet',
        buffer_id: 'later-' + contentPieceId,
      };
    }

    // Update content piece dengan Buffer ID
    if (result.buffer_id) {
      await db.collection('contentPieces').updateOne(
        { _id: new ObjectId(contentPieceId) },
        {
          $set: {
            'scheduleInfo.bufferId': result.buffer_id,
            'scheduleInfo.status': 'scheduled',
            'metadata.updatedAt': new Date(),
          },
        }
      );
    }

    return NextResponse.json(
      {
        success: result.success,
        message: result.message || 'Post scheduled successfully',
        bufferId: result.buffer_id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[POST /api/posting/schedule-buffer]', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to schedule post',
      },
      { status: 500 }
    );
  }
}

/**
 * Publish scheduled posts (cron job)
 */
export async function PUT(request: NextRequest) {
  if (!process.env.CRON_SECRET) {
    console.error('[PUT /api/posting/schedule-buffer] CRON_SECRET is not configured');
    return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
  }
  const cronSecret = request.headers.get('x-cron-secret');
  if (cronSecret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const db = await connectMongoDB();

    // Find all scheduled posts that are due
    const now = new Date();
    const duePosts = await db
      .collection('contentPieces')
      .find({
        'scheduleInfo.status': 'scheduled',
        'scheduleInfo.scheduledDate': { $lte: now },
        'scheduleInfo.bufferId': { $exists: true },
      })
      .toArray();

    if (duePosts.length === 0) {
      return NextResponse.json(
        { message: 'No posts to publish', count: 0 },
        { status: 200 }
      );
    }

    // Mark as posted (actual publishing handled by Buffer)
    const ids = duePosts.map((p) => new ObjectId(p._id));
    const result = await db.collection('contentPieces').updateMany(
      { _id: { $in: ids } },
      {
        $set: {
          'scheduleInfo.status': 'posted',
          'metadata.publishedAt': new Date(),
        },
      }
    );

    return NextResponse.json(
      {
        message: 'Posts published',
        count: result.modifiedCount,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[PUT /api/posting/schedule-buffer]', error);
    return NextResponse.json(
      { error: 'Failed to publish posts' },
      { status: 500 }
    );
  }
}
