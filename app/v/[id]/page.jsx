import { notFound } from 'next/navigation';
import { getVideoById } from '@/lib/db';
import { getPublicUrl } from '@/lib/r2';

export async function generateMetadata({ params }) {
  const video = await getVideoById(params.id);
  if (!video) return { title: 'Video no encontrado' };
  return {
    title: video.title,
    description: video.description || undefined,
    openGraph: {
      title: video.title,
      description: video.description || undefined,
      type: 'video.other',
    },
  };
}

export default async function VideoPage({ params }) {
  const video = await getVideoById(params.id);
  if (!video) notFound();

  const videoUrl = getPublicUrl(video.r2_key);

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      {/* Video player */}
      <div className="w-full bg-black flex items-center justify-center" style={{ minHeight: '56vw', maxHeight: '75vh' }}>
        <video
          src={videoUrl}
          controls
          autoPlay
          playsInline
          className="w-full h-full object-contain"
          style={{ maxHeight: '75vh' }}
        >
          Tu navegador no soporta reproducción de video.
        </video>
      </div>

      {/* Info */}
      <div className="max-w-2xl mx-auto w-full px-4 py-6">
        <h1 className="text-2xl font-bold text-white">{video.title}</h1>
        {video.description && (
          <p className="text-gray-400 mt-3 leading-relaxed whitespace-pre-wrap">
            {video.description}
          </p>
        )}
      </div>
    </div>
  );
}
