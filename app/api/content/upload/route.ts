// app/api/content/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { connectMongoDB } from '@/lib/db/mongodb';
import { ObjectId } from 'mongodb';

function detectImageExtension(buf: Buffer): string | null {
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'jpg';
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) return 'png';
  if (buf[0] === 0x47 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x38) return 'gif';
  if (buf[0] === 0x52 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x46 &&
      buf[8] === 0x57 && buf[9] === 0x45 && buf[10] === 0x42 && buf[11] === 0x50) return 'webp';
  return null;
}

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

    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: 'File size must be under 10MB' },
        { status: 400 }
      );
    }

    // Convert file to buffer before MIME check so we verify actual bytes
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Verify file signature (magic bytes) — client-supplied Content-Type is not trusted
    const ext = detectImageExtension(buffer);
    if (!ext) {
      return NextResponse.json(
        { error: 'Only JPEG, PNG, GIF, and WebP images are allowed' },
        { status: 400 }
      );
    }

    // Generate unique filename using server-verified extension
    const timestamp = Date.now();
    const filename = `${contentPieceId}-${platform}-${timestamp}.${ext}`;

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
