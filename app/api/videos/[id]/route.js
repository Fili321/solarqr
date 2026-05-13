import { NextResponse } from 'next/server';
import { getVideoById, updateVideo, deleteVideo } from '@/lib/db';
import { deleteR2Object } from '@/lib/r2';

export async function GET(request, { params }) {
  const video = await getVideoById(params.id);
  if (!video) return NextResponse.json({ error: 'Video no encontrado' }, { status: 404 });
  return NextResponse.json(video);
}

export async function PUT(request, { params }) {
  const { title, description, r2Key, oldR2Key, instagramUrl, facebookUrl, tiktokUrl, youtubeUrl, whatsapp, websiteUrl, phone } = await request.json();

  if (r2Key && oldR2Key && r2Key !== oldR2Key) {
    try { await deleteR2Object(oldR2Key); } catch (e) { console.error('R2 delete error:', e); }
  }

  const video = await updateVideo(params.id, { title, description, r2Key, instagramUrl, facebookUrl, tiktokUrl, youtubeUrl, whatsapp, websiteUrl, phone });
  if (!video) return NextResponse.json({ error: 'Video no encontrado' }, { status: 404 });
  return NextResponse.json(video);
}

export async function DELETE(request, { params }) {
  const video = await getVideoById(params.id);
  if (!video) return NextResponse.json({ error: 'Video no encontrado' }, { status: 404 });
  try { await deleteR2Object(video.r2_key); } catch (e) { console.error('R2 delete error:', e); }
  await deleteVideo(params.id);
  return NextResponse.json({ ok: true });
}