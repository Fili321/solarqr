import { NextResponse } from 'next/server';
import { getAllVideos, createVideo } from '@/lib/db';

export async function GET() {
  const videos = await getAllVideos();
  return NextResponse.json(videos);
}

export async function POST(request) {
  const { title, description, r2Key, instagramUrl, facebookUrl, tiktokUrl, youtubeUrl, whatsapp, websiteUrl, phone } = await request.json();

  if (!title || !r2Key) {
    return NextResponse.json({ error: 'title y r2Key son requeridos' }, { status: 400 });
  }

  const video = await createVideo({ title, description, r2Key, instagramUrl, facebookUrl, tiktokUrl, youtubeUrl, whatsapp, websiteUrl, phone });
  return NextResponse.json(video, { status: 201 });
}