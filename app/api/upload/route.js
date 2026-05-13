import { NextResponse } from 'next/server';
import { getPresignedUploadUrl } from '@/lib/r2';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request) {
  const { filename, contentType } = await request.json();

  if (!filename || !contentType) {
    return NextResponse.json({ error: 'filename y contentType son requeridos' }, { status: 400 });
  }

  if (!contentType.startsWith('video/')) {
    return NextResponse.json({ error: 'Solo se permiten archivos de video' }, { status: 400 });
  }

  const ext = filename.split('.').pop();
  const key = `videos/${uuidv4()}.${ext}`;

  const uploadUrl = await getPresignedUploadUrl(key, contentType);

  return NextResponse.json({ uploadUrl, key });
}