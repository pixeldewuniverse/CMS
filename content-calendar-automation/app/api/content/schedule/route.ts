// app/api/content/schedule/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectMongoDB } from '@/lib/db/mongodb';
import { ObjectId } from 'mongodb';

export async function POST(request: NextRequest) {
  try {
    const { contentPieceId, scheduledDate, scheduledTime, briefId } =
      await request.json();

    if (!contentPieceId || !scheduledDate || !scheduledTime) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate date is in future
    const scheduleDateTime = new Date(scheduledDate);
    if (scheduleDateTime < new Date()) {
      return NextResponse.json(
        { error: 'Cannot schedule posts in the past' },
        { status: 400 }
      );
    }

    const db = await connectMongoDB();

    // Update content piece
    const result = await db.collection('contentPieces').updateOne(
      { _id: new ObjectId(contentPieceId) },
      {
        $set: {
          'scheduleInfo.scheduledDate': new Date(scheduledDate),
          'scheduleInfo.scheduledTime': scheduledTime,
          'scheduleInfo.status': 'scheduled',
          'metadata.updatedAt': new Date(),
        },
      }
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { error: 'Content piece not found' },
        { status: 404 }
      );
    }

    // Add to calendar
    if (briefId) {
      const month = scheduleDateTime.getMonth() + 1;
      const year = scheduleDateTime.getFullYear();

      await db.collection('contentCalendars').updateOne(
        { briefId, month, year },
        {
          $push: {
            schedule: {
              contentPieceId,
              platform: (await db
                .collection('contentPieces')
                .findOne({ _id: new ObjectId(contentPieceId) }))?.platform,
              scheduledDate: new Date(scheduledDate),
              scheduledTime: scheduledTime,
              status: 'scheduled',
            },
          },
          $set: { 'metadata.updatedAt': new Date() },
        },
        { upsert: true }
      );
    }

    return NextResponse.json(
      { message: 'Post scheduled successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('[POST /api/content/schedule]', error);
    return NextResponse.json(
      { error: 'Failed to schedule post' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const briefId = request.nextUrl.searchParams.get('briefId');
    const month = request.nextUrl.searchParams.get('month');
    const year = request.nextUrl.searchParams.get('year');

    if (!briefId || !month || !year) {
      return NextResponse.json(
        { error: 'briefId, month, year are required' },
        { status: 400 }
      );
    }

    const db = await connectMongoDB();
    const calendar = await db.collection('contentCalendars').findOne({
      briefId,
      month: parseInt(month),
      year: parseInt(year),
    });

    if (!calendar) {
      return NextResponse.json(
        { schedule: [] },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { schedule: calendar.schedule },
      { status: 200 }
    );
  } catch (error) {
    console.error('[GET /api/content/schedule]', error);
    return NextResponse.json(
      { error: 'Failed to fetch schedule' },
      { status: 500 }
    );
  }
}
