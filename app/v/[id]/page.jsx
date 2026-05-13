import { notFound } from 'next/navigation';
import { getVideoById } from '@/lib/db';
import { getPublicUrl } from '@/lib/r2';

export async function generateMetadata({ params }) {
  const video = await getVideoById(params.id);
  if (!video) return { title: 'Video no encontrado' };
  return { title: video.title, description: video.description || undefined };
}

function SocialButton({ href, icon, label, style }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer"
      className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl font-semibold text-sm transition-all hover:scale-105 active:scale-95 hover:brightness-110 ${style}`}>
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
      style: 'bg-gradient-to-r from-orange-500 to-orange-400 text-white shadow-lg shadow-orange-500/25',
    },
    video.whatsapp && {
      href: `https://wa.me/${video.whatsapp.replace(/[^0-9]/g, '')}`,
      icon: '💬', label: 'WhatsApp',
      style: 'bg-gradient-to-r from-green-500 to-emerald-400 text-white shadow-lg shadow-green-500/25',
    },
    video.instagram_url && {
      href: video.instagram_url, icon: '📸', label: 'Instagram',
      style: 'bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-lg shadow-purple-500/25',
    },
    video.tiktok_url && {
      href: video.tiktok_url, icon: '🎵', label: 'TikTok',
      style: 'bg-gradient-to-r from-gray-800 to-gray-700 text-white border border-gray-600',
    },
    video.youtube_url && {
      href: video.youtube_url, icon: '▶️', label: 'YouTube',
      style: 'bg-gradient-to-r from-red-600 to-red-500 text-white shadow-lg shadow-red-500/25',
    },
    video.facebook_url && {
      href: video.facebook_url, icon: '👥', label: 'Facebook',
      style: 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/25',
    },
    video.website_url && {
      href: video.website_url, icon: '🌐', label: 'Sitio web',
      style: 'bg-gradient-to-r from-cyan-600 to-sky-500 text-white shadow-lg shadow-sky-500/25',
    },
  ].filter(Boolean);

  return (
    <div className="min-h-screen bg-gray-950">

      {/* Header con título */}
      <div className="w-full px-5 pt-7 pb-5 max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-1 h-7 rounded-full bg-gradient-to-b from-orange-400 to-orange-600" />
          <h1 className="text-2xl md:text-3xl font-bold text-white leading-tight tracking-tight">
            {video.title}
          </h1>
        </div>
      </div>

      {/* Video — grande */}
      <div className="w-full bg-black">
        <div className="max-w-3xl mx-auto">
          <video
            src={videoUrl}
            controls
            autoPlay
            playsInline
            className="w-full"
            style={{ maxHeight: '80vh' }}
          >
            Tu navegador no soporta reproducción de video.
          </video>
        </div>
      </div>

      {/* Contenido inferior */}
      <div className="max-w-3xl mx-auto px-5 py-7 space-y-7">

        {/* Descripción */}
        {video.description && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-blue-400" />
              <p className="text-xs font-semibold text-blue-400 uppercase tracking-widest">Descripción</p>
            </div>
            <p className="text-gray-300 leading-relaxed whitespace-pre-wrap text-sm">
              {video.description}
            </p>
          </div>
        )}

        {/* Contacto y redes */}
        {socials.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-green-400" />
              <p className="text-xs font-semibold text-green-400 uppercase tracking-widest">Contacto</p>
              <div className="flex-1 h-px bg-gray-800" />
            </div>
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
              {socials.map((s, i) => <SocialButton key={i} {...s} />)}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}