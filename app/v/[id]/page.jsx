import { notFound } from 'next/navigation';
import { getVideoById } from '@/lib/db';
import { getPublicUrl } from '@/lib/r2';

export async function generateMetadata({ params }) {
  const video = await getVideoById(params.id);
  if (!video) return { title: 'Video no encontrado' };
  return {
    title: video.title,
    description: video.description || undefined,
  };
}

function SocialButton({ href, icon, label, color }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer"
      className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl font-medium text-sm transition hover:scale-105 active:scale-95 ${color}`}>
      <span className="text-lg leading-none">{icon}</span>
      <span>{label}</span>
    </a>
  );
}

export default async function VideoPage({ params }) {
  const video = await getVideoById(params.id);
  if (!video) notFound();

  const videoUrl = getPublicUrl(video.r2_key);

  const socials = [
    video.phone && {
      href: `tel:${video.phone.replace(/\s/g, '')}`,
      icon: '📞', label: video.phone,
      color: 'bg-gray-700 text-white border border-gray-600',
    },
    video.whatsapp && {
      href: `https://wa.me/${video.whatsapp.replace(/[^0-9]/g, '')}`,
      icon: '💬', label: 'WhatsApp',
      color: 'bg-green-600 text-white',
    },
    video.instagram_url && {
      href: video.instagram_url, icon: '📸', label: 'Instagram',
      color: 'bg-gradient-to-r from-purple-600 to-pink-500 text-white',
    },
    video.tiktok_url && {
      href: video.tiktok_url, icon: '🎵', label: 'TikTok',
      color: 'bg-gray-800 text-white border border-gray-700',
    },
    video.youtube_url && {
      href: video.youtube_url, icon: '▶️', label: 'YouTube',
      color: 'bg-red-600 text-white',
    },
    video.facebook_url && {
      href: video.facebook_url, icon: '👥', label: 'Facebook',
      color: 'bg-blue-600 text-white',
    },
    video.website_url && {
      href: video.website_url, icon: '🌐', label: 'Sitio web',
      color: 'bg-gray-700 text-white',
    },
  ].filter(Boolean);

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      <div className="w-full bg-black" style={{ aspectRatio: '16/9', maxHeight: '70vh' }}>
        <video src={videoUrl} controls autoPlay playsInline
          className="w-full h-full object-contain" style={{ maxHeight: '70vh' }}>
          Tu navegador no soporta reproducción de video.
        </video>
      </div>

      <div className="flex-1 max-w-2xl mx-auto w-full px-5 py-7">
        <h1 className="text-2xl font-bold text-white leading-tight">{video.title}</h1>

        {video.description && (
          <p className="text-gray-400 mt-3 leading-relaxed whitespace-pre-wrap text-sm">
            {video.description}
          </p>
        )}

        {socials.length > 0 && (
          <div className="mt-7">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">Contacto</p>
            <div className="flex flex-wrap gap-2">
              {socials.map((s, i) => <SocialButton key={i} {...s} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}