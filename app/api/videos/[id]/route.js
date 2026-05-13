import { NextResponse } from 'next/server';
import { getVideoById, updateVideo, deleteVideo } from '@/lib/db';
import { deleteR2Object } from '@/lib/r2';

export async function GET(request, { params }) {
  const video = await getVideoById(params.id);
  if (!video) return NextResponse.json({ error: 'Video no encontrado' }, { status: 404 });
  return NextResponse.json(video);
}

export async function PUT(request, { params }) {
  const { title, description, r2Key, oldR2Key } = await request.json();

  // If replacing the video file, delete the old one from R2
  if (r2Key && oldR2Key && r2Key !== oldR2Key) {
    try {
      await deleteR2Object(oldR2Key);
    } catch (e) {
      console.error('Error deleting old R2 object:', e);
    }
  }

  const video = await updateVideo(params.id, { title, description, r2Key });
  if (!video) return NextResponse.json({ error: 'Video no encontrado' }, { status: 404 });

  return NextResponse.json(video);
}

export async function DELETE(request, { params }) {
  const video = await getVideoById(params.id);
  if (!video) return NextResponse.json({ error: 'Video no encontrado' }, { status: 404 });

  // Delete from R2
  try {
    await deleteR2Object(video.r2_key);
  } catch (e) {
    console.error('Error deleting R2 object:', e);
  }

  await deleteVideo(params.id);
  return NextResponse.json({ ok: true });
}
