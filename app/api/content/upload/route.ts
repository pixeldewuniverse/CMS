// app/api/content/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { connectMongoDB } from '@/lib/db/mongodb';
import { ObjectId } from 'mongodb';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const contentPieceId = formData.get('contentPieceId') as string;
    const platform = formData.get('platform') as string;

    if (!file || !contentPieceId || !platform) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename
    const timestamp = Date.now();
    const filename = `${contentPieceId}-${platform}-${timestamp}.${file.name.split('.').pop()}`;

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads');
    try {
      await mkdir(uploadsDir, { recursive: true });
    } catch (error: any) {
      if (error.code !== 'EEXIST') {
        throw error;
      }
    }

    // Save file to disk
    const filepath = join(uploadsDir, filename);
    await writeFile(filepath, buffer);

    // Create public URL
    const imageUrl = `/uploads/${filename}`;

    // Update content piece in MongoDB
    const db = await connectMongoDB();
    await db.collection('contentPieces').updateOne(
      { _id: new ObjectId(contentPieceId) },
      {
        $set: {
          'designImage.url': imageUrl,
          'designImage.path': filepath,
          'designImage.uploadedAt': new Date(),
          'scheduleInfo.status': 'draft', // Reset to draft for review
          'metadata.updatedAt': new Date(),
        },
      }
    );

    return NextResponse.json(
      {
        filename,
        imageUrl,
        message: 'Design uploaded successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[POST /api/content/upload]', error);
    return NextResponse.json(
      { error: 'Failed to upload design' },
      { status: 500 }
    );
  }
}
