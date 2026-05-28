// app/api/analytics/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { briefRepository, contentRepository } from '@/lib/db/repositories';
import { analyticsService } from '@/lib/services/analyticsService';
import { connectMongoDB } from '@/lib/db/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(request: NextRequest) {
  try {
    const briefId = request.nextUrl.searchParams.get('briefId');
    const userId = request.nextUrl.searchParams.get('userId');
    const accessToken = request.nextUrl.searchParams.get('accessToken');
    const service = request.nextUrl.searchParams.get('service') as 'buffer' | 'later';

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

    // Verify caller owns the brief
    if (userId && brief.userId !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Get all content pieces for this brief
    const db = await connectMongoDB();
    const contentPieces = await db
      .collection('contentPieces')
      .find({ briefId })
      .toArray();

    if (contentPieces.length === 0) {
      return NextResponse.json(
        {
          briefId,
          summary: {
            totalPosts: 0,
            totalEngagement: 0,
            totalReach: 0,
            avgEngagementRate: 0,
          },
          posts: [],
          message: 'No published posts to analyze',
        },
        { status: 200 }
      );
    }

    // Generate analytics (requires access token if service provided)
    let analytics: any = {
      briefId,
      posts: [],
      summary: {
        totalPosts: contentPieces.length,
        totalEngagement: 0,
        totalReach: 0,
        avgEngagementRate: 0,
      },
    };

    if (accessToken && service) {
      analytics = await analyticsService.generateBriefAnalytics(
        briefId,
        contentPieces,
        accessToken,
        service
      );

      // Persist snapshot once per day — only when we have real performance data
      const today = new Date(Date.UTC(
        new Date().getUTCFullYear(),
        new Date().getUTCMonth(),
        new Date().getUTCDate()
      ));
      await db.collection('performanceAnalytics').updateOne(
        { briefId, 'period.startDate': today },
        {
          $set: {
            briefId,
            period: { startDate: today, endDate: new Date() },
            platformStats: calculatePlatformStats(contentPieces),
            summary: analytics.summary,
            aiRecommendations: analytics.insights?.recommendations || [],
            generatedAt: new Date(),
          },
        },
        { upsert: true }
      );
    } else {
      // Without token, just return basic stats from local DB — no write
      const totalEngagement = contentPieces.reduce((sum, piece) => {
        const metrics = piece.performance || { likes: 0, comments: 0, shares: 0 };
        return sum + (metrics.likes || 0) + (metrics.comments || 0) + (metrics.shares || 0);
      }, 0);

      analytics.summary.totalEngagement = totalEngagement;
      analytics.summary.totalReach = contentPieces.reduce(
        (sum, piece) => sum + (piece.performance?.reach || 0),
        0
      );

      if (analytics.summary.totalReach > 0) {
        analytics.summary.avgEngagementRate = parseFloat(
          (
            (analytics.summary.totalEngagement /
              analytics.summary.totalReach) *
            100
          ).toFixed(2)
        );
      }

      analytics.posts = contentPieces.map((piece) => ({
        postId: piece._id,
        platform: piece.platform,
        caption: piece.caption,
        scheduledDate: piece.scheduleInfo.scheduledDate,
        metrics: piece.performance || {
          likes: 0,
          comments: 0,
          shares: 0,
          clicks: 0,
          impressions: 0,
          reach: 0,
          engagementRate: 0,
        },
      }));
    }

    return NextResponse.json(analytics, { status: 200 });
  } catch (error) {
    console.error('[GET /api/analytics]', error);
    return NextResponse.json(
      { error: 'Failed to generate analytics' },
      { status: 500 }
    );
  }
}

function calculatePlatformStats(contentPieces: any[]) {
  const platformMap = new Map<string, any>();

  contentPieces.forEach((piece) => {
    const platform = piece.platform;
    if (!platformMap.has(platform)) {
      platformMap.set(platform, {
        platform,
        totalPosts: 0,
        totalEngagement: 0,
        avgEngagementRate: 0,
      });
    }

    const stats = platformMap.get(platform);
    stats.totalPosts += 1;

    if (piece.performance) {
      const engagement =
        (piece.performance.likes || 0) +
        (piece.performance.comments || 0) +
        (piece.performance.shares || 0);
      stats.totalEngagement += engagement;
    }
  });

  return Array.from(platformMap.values());
}
