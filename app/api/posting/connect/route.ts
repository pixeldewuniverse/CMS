// app/api/posting/connect/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { BufferService, LaterService } from '@/lib/services/bufferService';

export async function POST(request: NextRequest) {
  try {
    const { platform, accessToken } = await request.json();

    if (!platform || !accessToken) {
      return NextResponse.json(
        { error: 'Platform and accessToken are required' },
        { status: 400 }
      );
    }

    if (platform === 'buffer') {
      const bufferService = new BufferService(accessToken);

      // Test connection by fetching profiles
      const profiles = await bufferService.getProfiles();

      return NextResponse.json(
        {
          success: true,
          platform: 'buffer',
          profiles: profiles,
          message: `Connected! Found ${profiles.length} profile(s)`,
        },
        { status: 200 }
      );
    } else if (platform === 'later') {
      const laterService = new LaterService(accessToken);

      // Test connection
      const account = await laterService.getAccount();

      return NextResponse.json(
        {
          success: true,
          platform: 'later',
          account: account,
          profiles: [{ id: account.id, formatted_username: account.username }],
          message: 'Connected to Later!',
        },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { error: 'Invalid platform' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('[POST /api/posting/connect]', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to connect. Check your token.',
      },
      { status: 401 }
    );
  }
}
