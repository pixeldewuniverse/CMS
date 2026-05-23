// lib/services/bufferService.ts
import fetch from 'node-fetch';

interface BufferPost {
  id?: string;
  text: string;
  media?: {
    url: string;
  };
  media_urls?: string[];
  status?: 'sent' | 'failed';
}

interface BufferScheduleResponse {
  success: boolean;
  message?: string;
  buffer_id?: string;
}

export class BufferService {
  private accessToken: string;
  private baseUrl = 'https://api.bufferapp.com/1';

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  /**
   * Get Buffer profiles untuk user
   */
  async getProfiles(): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseUrl}/profiles.json?access_token=${this.accessToken}`);
      if (!response.ok) throw new Error('Failed to fetch profiles');
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Buffer getProfiles error:', error);
      throw error;
    }
  }

  /**
   * Schedule post ke Buffer
   */
  async schedulePost(
    profileId: string,
    post: {
      text: string;
      media?: { url: string };
      publish_at?: number; // Unix timestamp
    }
  ): Promise<BufferScheduleResponse> {
    try {
      const body = new URLSearchParams();
      body.append('access_token', this.accessToken);
      body.append('text', post.text);

      if (post.media?.url) {
        body.append('media[url]', post.media.url);
      }

      if (post.publish_at) {
        body.append('publish_at', post.publish_at.toString());
      }

      const response = await fetch(
        `${this.baseUrl}/profiles/${profileId}/updates/create.json`,
        {
          method: 'POST',
          body: body,
        }
      );

      if (!response.ok) {
        throw new Error(`Buffer API error: ${response.statusText}`);
      }

      const data = await response.json() as any;
      return {
        success: !data.error,
        message: data.message,
        buffer_id: data.update?.id,
      };
    } catch (error) {
      console.error('Buffer schedulePost error:', error);
      throw error;
    }
  }

  /**
   * Update scheduled post
   */
  async updatePost(
    updateId: string,
    post: {
      text: string;
      media?: { url: string };
      publish_at?: number;
    }
  ): Promise<BufferScheduleResponse> {
    try {
      const body = new URLSearchParams();
      body.append('access_token', this.accessToken);
      body.append('text', post.text);

      if (post.media?.url) {
        body.append('media[url]', post.media.url);
      }

      if (post.publish_at) {
        body.append('publish_at', post.publish_at.toString());
      }

      const response = await fetch(
        `${this.baseUrl}/updates/${updateId}/update.json`,
        {
          method: 'POST',
          body: body,
        }
      );

      if (!response.ok) {
        throw new Error(`Buffer API error: ${response.statusText}`);
      }

      const data = await response.json() as any;
      return {
        success: !data.error,
        message: data.message,
        buffer_id: updateId,
      };
    } catch (error) {
      console.error('Buffer updatePost error:', error);
      throw error;
    }
  }

  /**
   * Delete scheduled post
   */
  async deletePost(updateId: string): Promise<boolean> {
    try {
      const response = await fetch(
        `${this.baseUrl}/updates/${updateId}/destroy.json`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: `access_token=${this.accessToken}`,
        }
      );

      return response.ok;
    } catch (error) {
      console.error('Buffer deletePost error:', error);
      throw error;
    }
  }
}

/**
 * Later Service (alternative)
 */
export class LaterService {
  private apiKey: string;
  private baseUrl = 'https://api.later.com/v1';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * Get Later account info
   */
  async getAccount(): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/account`, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch account');
      return response.json();
    } catch (error) {
      console.error('Later getAccount error:', error);
      throw error;
    }
  }

  /**
   * Schedule post ke Later
   */
  async schedulePost(post: {
    caption: string;
    image_url: string;
    posted_at: string; // ISO date string
    channels: string[]; // ['instagram', 'facebook']
  }): Promise<BufferScheduleResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/posts`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(post),
      });

      if (!response.ok) {
        throw new Error(`Later API error: ${response.statusText}`);
      }

      const data = await response.json() as any;
      return {
        success: true,
        message: 'Post scheduled',
        buffer_id: data.id,
      };
    } catch (error) {
      console.error('Later schedulePost error:', error);
      throw error;
    }
  }
}

/**
 * Platform-specific service factory
 */
export function getPlatformService(
  platform: 'buffer' | 'later',
  token: string
) {
  if (platform === 'buffer') {
    return new BufferService(token);
  } else if (platform === 'later') {
    return new LaterService(token);
  }
  throw new Error(`Unknown platform: ${platform}`);
}
