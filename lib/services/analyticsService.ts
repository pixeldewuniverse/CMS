// lib/services/analyticsService.ts
import { BufferService, LaterService } from './bufferService';

export interface PostAnalytics {
  postId: string;
  platform: string;
  caption: string;
  scheduledDate: Date;
  metrics: {
    likes: number;
    comments: number;
    shares: number;
    clicks: number;
    impressions: number;
    reach: number;
    engagementRate: number; // percentage
  };
  fetchedAt: Date;
}

export interface BriefAnalytics {
  briefId: string;
  period: {
    startDate: Date;
    endDate: Date;
  };
  posts: PostAnalytics[];
  summary: {
    totalPosts: number;
    totalEngagement: number;
    totalReach: number;
    avgEngagementRate: number;
    bestPost: {
      caption: string;
      engagement: number;
    };
    bestPerformingPlatform: {
      platform: string;
      engagement: number;
    };
    bestTopic?: string;
    bestFormat?: string;
    topHashtags?: string[];
  };
  insights: {
    bestPostingTime: string;
    bestDayOfWeek: string;
    engagementTrend: 'up' | 'down' | 'stable';
    recommendations: string[];
  };
}

/**
 * Analytics Service untuk fetch metrics dari Buffer/Later
 */
export const analyticsService = {
  /**
   * Fetch analytics dari Buffer (requires bufferId di contentPiece)
   */
  async fetchBufferAnalytics(
    accessToken: string,
    bufferId: string
  ): Promise<PostAnalytics | null> {
    if (!accessToken || !bufferId) {
      return null;
    }

    try {
      const bufferService = new BufferService(accessToken);
      // Buffer API endpoint untuk update analytics
      const response = await fetch(
        `https://api.bufferapp.com/1/updates/${bufferId}/analytics.json?access_token=${accessToken}`
      );

      if (!response.ok) {
        console.warn('Failed to fetch Buffer analytics');
        return null;
      }

      const data = await response.json() as any;

      return {
        postId: bufferId,
        platform: data.profile?.service || 'unknown',
        caption: data.text || '',
        scheduledDate: new Date(data.created_at),
        metrics: {
          likes: data.shares || 0,
          comments: data.replies || 0,
          shares: data.retweets || 0,
          clicks: data.clicks || 0,
          impressions: data.impressions || 0,
          reach: data.reach || 0,
          engagementRate: calculateEngagementRate(
            (data.shares || 0) + (data.replies || 0) + (data.retweets || 0),
            data.reach || 1
          ),
        },
        fetchedAt: new Date(),
      };
    } catch (error) {
      console.error('Failed to fetch Buffer analytics:', error);
      return null;
    }
  },

  /**
   * Fetch analytics dari Later
   */
  async fetchLaterAnalytics(
    apiKey: string,
    postId: string
  ): Promise<PostAnalytics | null> {
    if (!apiKey || !postId) {
      return null;
    }

    try {
      const response = await fetch(`https://api.later.com/v1/posts/${postId}`, {
        headers: {
          'X-API-KEY': apiKey,
        },
      });

      if (!response.ok) {
        console.warn('Failed to fetch Later analytics');
        return null;
      }

      const data = await response.json() as any;

      return {
        postId,
        platform: data.platform || 'unknown',
        caption: data.caption || '',
        scheduledDate: new Date(data.scheduled_at),
        metrics: {
          likes: data.likes || 0,
          comments: data.comments || 0,
          shares: data.shares || 0,
          clicks: data.link_clicks || 0,
          impressions: data.impressions || 0,
          reach: data.reach || 0,
          engagementRate: calculateEngagementRate(
            (data.likes || 0) + (data.comments || 0) + (data.shares || 0),
            data.reach || 1
          ),
        },
        fetchedAt: new Date(),
      };
    } catch (error) {
      console.error('Failed to fetch Later analytics:', error);
      return null;
    }
  },

  /**
   * Generate analytics report untuk brief
   */
  async generateBriefAnalytics(
    briefId: string,
    contentPieces: any[],
    accessToken: string,
    service: 'buffer' | 'later'
  ): Promise<BriefAnalytics> {
    const postsAnalytics: PostAnalytics[] = [];

    // Fetch analytics untuk setiap post
    for (const piece of contentPieces) {
      if (!piece.scheduleInfo.bufferId) continue;

      let analytics: PostAnalytics | null = null;

      if (service === 'buffer') {
        analytics = await this.fetchBufferAnalytics(
          accessToken,
          piece.scheduleInfo.bufferId
        );
      } else {
        analytics = await this.fetchLaterAnalytics(
          accessToken,
          piece.scheduleInfo.bufferId
        );
      }

      if (analytics) {
        postsAnalytics.push(analytics);
      }
    }

    // Calculate summary
    const totalEngagement = postsAnalytics.reduce((sum, post) => {
      return (
        sum +
        post.metrics.likes +
        post.metrics.comments +
        post.metrics.shares
      );
    }, 0);

    const totalReach = postsAnalytics.reduce(
      (sum, post) => sum + post.metrics.reach,
      0
    );

    const avgEngagementRate =
      postsAnalytics.length > 0
        ? (
            postsAnalytics.reduce((sum, post) => {
              return sum + post.metrics.engagementRate;
            }, 0) / postsAnalytics.length
          ).toFixed(2)
        : '0';

    const bestPost = postsAnalytics.reduce(
      (best, post) => {
        const postEngagement =
          post.metrics.likes +
          post.metrics.comments +
          post.metrics.shares;
        const bestEngagement =
          best.metrics.likes +
          best.metrics.comments +
          best.metrics.shares;

        return postEngagement > bestEngagement ? post : best;
      },
      postsAnalytics[0] || { metrics: { likes: 0, comments: 0, shares: 0 } }
    );

    // Platform breakdown
    const platformStats = new Map<string, number>();
    postsAnalytics.forEach((post) => {
      const current = platformStats.get(post.platform) || 0;
      platformStats.set(
        post.platform,
        current +
          post.metrics.likes +
          post.metrics.comments +
          post.metrics.shares
      );
    });

    const bestPerformingPlatform = Array.from(platformStats.entries()).reduce(
      (best, [platform, engagement]) => {
        return engagement > best.engagement
          ? { platform, engagement }
          : best;
      },
      { platform: 'unknown', engagement: 0 }
    );

    return {
      briefId,
      period: {
        startDate: new Date(
          Math.min(
            ...postsAnalytics.map((p) => p.scheduledDate.getTime())
          )
        ),
        endDate: new Date(
          Math.max(
            ...postsAnalytics.map((p) => p.scheduledDate.getTime())
          )
        ),
      },
      posts: postsAnalytics,
      summary: {
        totalPosts: postsAnalytics.length,
        totalEngagement,
        totalReach,
        avgEngagementRate: parseFloat(avgEngagementRate as string),
        bestPost: {
          caption: bestPost.caption || '',
          engagement:
            (bestPost.metrics?.likes || 0) +
            (bestPost.metrics?.comments || 0) +
            (bestPost.metrics?.shares || 0),
        },
        bestPerformingPlatform,
        topHashtags: extractTopHashtags(postsAnalytics),
      },
      insights: {
        bestPostingTime: calculateBestPostingTime(postsAnalytics),
        bestDayOfWeek: calculateBestDayOfWeek(postsAnalytics),
        engagementTrend: calculateTrend(postsAnalytics),
        recommendations: generateRecommendations(postsAnalytics),
      },
    };
  },
};

/**
 * Helper functions
 */
function calculateEngagementRate(
  engagement: number,
  reach: number
): number {
  if (reach === 0) return 0;
  return parseFloat(((engagement / reach) * 100).toFixed(2));
}

function extractTopHashtags(posts: PostAnalytics[]): string[] {
  const hashtagMap = new Map<string, number>();

  posts.forEach((post) => {
    const hashtags = post.caption.match(/#\w+/g) || [];
    hashtags.forEach((tag) => {
      hashtagMap.set(tag, (hashtagMap.get(tag) || 0) + 1);
    });
  });

  return Array.from(hashtagMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map((entry) => entry[0]);
}

function calculateBestPostingTime(posts: PostAnalytics[]): string {
  const timeMap = new Map<string, number>();

  posts.forEach((post) => {
    const hour = new Date(post.scheduledDate).getHours();
    const timeSlot = `${hour}:00 - ${(hour + 1) % 24}:00`;
    const engagement =
      post.metrics.likes +
      post.metrics.comments +
      post.metrics.shares;
    timeMap.set(timeSlot, (timeMap.get(timeSlot) || 0) + engagement);
  });

  const best = Array.from(timeMap.entries()).sort(
    (a, b) => b[1] - a[1]
  )[0];

  return best ? best[0] : '10:00 - 11:00';
}

function calculateBestDayOfWeek(posts: PostAnalytics[]): string {
  const days = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];
  const dayMap = new Map<string, number>();

  posts.forEach((post) => {
    const dayOfWeek = days[new Date(post.scheduledDate).getDay()];
    const engagement =
      post.metrics.likes +
      post.metrics.comments +
      post.metrics.shares;
    dayMap.set(dayOfWeek, (dayMap.get(dayOfWeek) || 0) + engagement);
  });

  const best = Array.from(dayMap.entries()).sort(
    (a, b) => b[1] - a[1]
  )[0];

  return best ? best[0] : 'Monday';
}

function calculateTrend(posts: PostAnalytics[]): 'up' | 'down' | 'stable' {
  if (posts.length < 2) return 'stable';

  const sorted = [...posts].sort(
    (a, b) =>
      new Date(a.scheduledDate).getTime() -
      new Date(b.scheduledDate).getTime()
  );

  const firstHalf = sorted.slice(0, Math.floor(sorted.length / 2));
  const secondHalf = sorted.slice(Math.floor(sorted.length / 2));

  const firstAvg =
    firstHalf.reduce(
      (sum, post) =>
        sum +
        post.metrics.likes +
        post.metrics.comments +
        post.metrics.shares,
      0
    ) / firstHalf.length;

  const secondAvg =
    secondHalf.reduce(
      (sum, post) =>
        sum +
        post.metrics.likes +
        post.metrics.comments +
        post.metrics.shares,
      0
    ) / secondHalf.length;

  const percentChange = ((secondAvg - firstAvg) / firstAvg) * 100;

  if (percentChange > 10) return 'up';
  if (percentChange < -10) return 'down';
  return 'stable';
}

function generateRecommendations(posts: PostAnalytics[]): string[] {
  const recommendations: string[] = [];

  const avgEngagement =
    posts.reduce(
      (sum, post) =>
        sum +
        post.metrics.likes +
        post.metrics.comments +
        post.metrics.shares,
      0
    ) / posts.length;

  const bestPost = posts.reduce((best, post) => {
    const postEngagement =
      post.metrics.likes +
      post.metrics.comments +
      post.metrics.shares;
    const bestEngagement =
      best.metrics.likes +
      best.metrics.comments +
      best.metrics.shares;
    return postEngagement > bestEngagement ? post : best;
  });

  if (avgEngagement < 50) {
    recommendations.push('Increase posting frequency - your engagement is low');
  }

  if (avgEngagement > 500) {
    recommendations.push('Great engagement! Maintain current strategy');
  }

  const topHashtags = extractTopHashtags(posts);
  if (topHashtags.length > 0) {
    recommendations.push(
      `Keep using these hashtags: ${topHashtags.slice(0, 3).join(', ')}`
    );
  }

  recommendations.push('Share content during peak posting times');
  recommendations.push('Engage with comments within first 2 hours');
  recommendations.push('Use video content - typically gets more engagement');

  return recommendations;
}
