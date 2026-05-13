'use client';

import { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';

function LoginForm({ onLogin }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    if (res.ok) { onLogin(); }
    else { const d = await res.json(); setError(d.error || 'Error'); }
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950">
      <div className="bg-gray-900 rounded-2xl p-8 w-full max-w-sm border border-gray-800">
        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center mb-5">
          <span className="text-xl">🎬</span>
        </div>
        <h1 className="text-2xl font-bold text-white mb-1">Bienvenido</h1>
        <p className="text-gray-400 text-sm mb-6">Ingresa tu contraseña para continuar</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="password" placeholder="Contraseña" value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold rounded-xl py-3 transition text-sm">
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}

function ProgressBar({ progress }) {
  return (
    <div className="w-full bg-gray-700 rounded-full h-1.5 mt-2">
      <div className="bg-indigo-500 h-1.5 rounded-full transition-all" style={{ width: `${progress}%` }} />
    </div>
  );
}

function QRModal({ video, baseUrl, onClose }) {
  const [qrPng, setQrPng] = useState('');
  const [qrSvg, setQrSvg] = useState('');
  const [qrPreview, setQrPreview] = useState('');
  const [copied, setCopied] = useState(false);
  const videoUrl = `${baseUrl}/v/${video.id}`;

  useEffect(() => {
    const base = { errorCorrectionLevel: 'H', color: { dark: '#000000', light: '#ffffff' } };
    QRCode.toDataURL(videoUrl, { ...base, width: 400, margin: 2 }).then(setQrPreview);
    QRCode.toDataURL(videoUrl, { ...base, width: 2400, margin: 3 }).then(setQrPng);
    QRCode.toString(videoUrl, { ...base, type: 'svg', margin: 3 }).then(setQrSvg);
  }, [videoUrl]);

  function downloadPNG() {
    const a = document.createElement('a');
    a.href = qrPng;
    a.download = `qr-${video.title.replace(/\s+/g, '-')}-2400px.png`;
    a.click();
  }

  function downloadSVG() {
    const blob = new Blob([qrSvg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `qr-${video.title.replace(/\s+/g, '-')}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-2xl p-6 w-full max-w-sm border border-gray-700">
        <div className="flex items-start justify-between mb-5">
          <div>
            <h3 className="text-lg font-bold text-white">{video.title}</h3>
            <p className="text-gray-500 text-xs mt-1 break-all">{videoUrl}</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white ml-3 text-xl">✕</button>
        </div>
        <div className="flex justify-center mb-2">
          {qrPreview
            ? <div className="bg-white p-3 rounded-xl"><img src={qrPreview} className="w-52 h-52" /></div>
            : <div className="w-52 h-52 bg-gray-800 rounded-xl animate-pulse" />}
        </div>
        <p className="text-center text-gray-600 text-xs mb-5">Corrección de error: Alta</p>
        <div className="space-y-2">
          <button onClick={downloadSVG}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl py-2.5 text-sm flex items-center justify-center gap-2">
            ⬇ SVG Vectorial <span className="text-indigo-300 text-xs font-normal">(recomendado para impresión)</span>
          </button>
          <button onClick={downloadPNG}
            className="w-full bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-xl py-2.5 text-sm">
            ⬇ PNG 2400×2400px
          </button>
          <button onClick={() => { navigator.clipboard.writeText(videoUrl); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
            className="w-full bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-xl py-2.5 text-sm">
            {copied ? '✓ Copiado' : '🔗 Copiar enlace'}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ icon, placeholder, value, onChange, type = 'url' }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-base w-6 text-center shrink-0">{icon}</span>
      <input type={type} placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)}
        className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
    </div>
  );
}

function VideoForm({ existing, onSave, onCancel }) {
  const [title, setTitle] = useState(existing?.title || '');
  const [description, setDescription] = useState(existing?.description || '');
  const [instagram, setInstagram] = useState(existing?.instagram_url || '');
  const [facebook, setFacebook] = useState(existing?.facebook_url || '');
  const [tiktok, setTiktok] = useState(existing?.tiktok_url || '');
  const [youtube, setYoutube] = useState(existing?.youtube_url || '');
  const [whatsapp, setWhatsapp] = useState(existing?.whatsapp || '');
  const [phone, setPhone] = useState(existing?.phone || '');
  const [website, setWebsite] = useState(existing?.website_url || '');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [showContact, setShowContact] = useState(
    !!(existing?.instagram_url || existing?.facebook_url || existing?.tiktok_url ||
       existing?.youtube_url || existing?.whatsapp || existing?.website_url || existing?.phone)
  );
  const fileRef = useRef();
  const isEdit = !!existing;

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!isEdit && !file) { setError('Selecciona un video'); return; }
    if (!title.trim()) { setError('El título es requerido'); return; }
    setUploading(true);
    setProgress(0);

    try {
      let r2Key = existing?.r2_key || null;
      const oldR2Key = existing?.r2_key || null;

      if (file) {
        const presignRes = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filename: file.name, contentType: file.type }),
        });
        if (!presignRes.ok) throw new Error('Error al obtener URL de carga');
        const { uploadUrl, key } = await presignRes.json();
        r2Key = key;

        await new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open('PUT', uploadUrl);
          xhr.setRequestHeader('Content-Type', file.type);
          xhr.upload.onprogress = (e) => { if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 90)); };
          xhr.onload = () => (xhr.status === 200 ? resolve() : reject(new Error('Upload failed')));
          xhr.onerror = () => reject(new Error('Upload error'));
          xhr.send(file);
        });
        setProgress(95);
      }

      const contact = {
        instagramUrl: instagram || null, facebookUrl: facebook || null,
        tiktokUrl: tiktok || null, youtubeUrl: youtube || null,
        whatsapp: whatsapp || null, websiteUrl: website || null, phone: phone || null,
      };

      const url = isEdit ? `/api/videos/${existing.id}` : '/api/videos';
      const method = isEdit ? 'PUT' : 'POST';
      const saveRes = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(isEdit ? { title, description, r2Key, oldR2Key, ...contact } : { title, description, r2Key, ...contact }),
      });
      if (!saveRes.ok) throw new Error('Error al guardar');
      const saved = await saveRes.json();
      setProgress(100);
      onSave(saved, isEdit);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="bg-gray-900 border border-gray-700/60 rounded-2xl p-6">
      <h2 className="text-base font-semibold text-white mb-5">{isEdit ? '✏️ Editar video' : '➕ Nuevo video'}</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1.5">Título *</label>
          <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Ej: Demo del producto"
            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1.5">Descripción</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Descripción opcional..." rows={3}
            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm resize-none" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1.5">{isEdit ? 'Reemplazar video (opcional)' : 'Archivo de video *'}</label>
          <div onClick={() => fileRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition ${file ? 'border-indigo-500 bg-indigo-500/10' : 'border-gray-700 hover:border-gray-600'}`}>
            {file
              ? <div><p className="text-indigo-300 font-medium text-sm">{file.name}</p><p className="text-gray-500 text-xs mt-1">{(file.size / 1024 / 1024).toFixed(1)} MB</p></div>
              : <div><p className="text-2xl mb-1.5">🎬</p><p className="text-gray-400 text-sm">Haz clic para seleccionar</p><p className="text-gray-600 text-xs mt-1">MP4, MOV, WebM…</p></div>
            }
          </div>
          <input ref={fileRef} type="file" accept="video/*" className="hidden" onChange={e => setFile(e.target.files[0] || null)} />
        </div>

        <div>
          <button type="button" onClick={() => setShowContact(!showContact)}
            className="flex items-center gap-2 text-xs font-medium text-gray-400 hover:text-white transition">
            <span className={`transition-transform inline-block ${showContact ? 'rotate-90' : ''}`}>▶</span>
            Contacto y redes sociales <span className="text-gray-600">(opcional)</span>
          </button>
          {showContact && (
            <div className="mt-3 space-y-2.5 bg-gray-800/40 rounded-xl p-4 border border-gray-700/40">
              <Field icon="📞" placeholder="+1 305 555 0000 (Teléfono)" value={phone} onChange={setPhone} type="tel" />
              <Field icon="💬" placeholder="+1 305 555 0000 (WhatsApp)" value={whatsapp} onChange={setWhatsapp} type="tel" />
              <Field icon="📸" placeholder="https://instagram.com/tuperfil" value={instagram} onChange={setInstagram} />
              <Field icon="🎵" placeholder="https://tiktok.com/@tuusuario" value={tiktok} onChange={setTiktok} />
              <Field icon="▶️" placeholder="https://youtube.com/@tucanal" value={youtube} onChange={setYoutube} />
              <Field icon="👥" placeholder="https://facebook.com/tupagina" value={facebook} onChange={setFacebook} />
              <Field icon="🌐" placeholder="https://tusitio.com" value={website} onChange={setWebsite} />
            </div>
          )}
        </div>

        {uploading && <div><p className="text-xs text-gray-400">{progress < 95 ? `Subiendo... ${progress}%` : 'Guardando...'}</p><ProgressBar progress={progress} /></div>}
        {error && <p className="text-red-400 text-sm">{error}</p>}

        <div className="flex gap-3 pt-1">
          <button type="submit" disabled={uploading}
            className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold rounded-xl py-2.5 transition text-sm">
            {uploading ? 'Procesando...' : isEdit ? 'Guardar cambios' : 'Crear video'}
          </button>
          {onCancel && <button type="button" onClick={onCancel} className="px-5 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition text-sm">Cancelar</button>}
        </div>
      </form>
    </div>
  );
}

function VideoCard({ video, baseUrl, onEdit, onDelete, onShowQR }) {
  const [confirming, setConfirming] = useState(false);

  async function handleDelete() {
    if (!confirming) { setConfirming(true); return; }
    await fetch(`/api/videos/${video.id}`, { method: 'DELETE' });
    onDelete(video.id);
  }

  const createdAt = new Date(video.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
  const hasContact = video.instagram_url || video.facebook_url || video.tiktok_url || video.youtube_url || video.whatsapp || video.website_url || video.phone;

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 hover:border-gray-700/80 transition">
      <div className="mb-4">
        <h3 className="font-semibold text-white">{video.title}</h3>
        {video.description && <p className="text-gray-400 text-sm mt-1 line-clamp-2">{video.description}</p>}
        <div className="flex items-center gap-3 mt-2">
          <p className="text-gray-600 text-xs">{createdAt}</p>
          {hasContact && <span className="text-xs text-indigo-400/80">Contacto ✓</span>}
        </div>
      </div>
      <div className="flex gap-2">
        <button onClick={() => onShowQR(video)} className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-xl py-2 transition">📱 Ver QR</button>
        <button onClick={() => onEdit(video)} className="flex-1 bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium rounded-xl py-2 transition">✏️ Editar</button>
        <button onClick={handleDelete} onBlur={() => setConfirming(false)}
          className={`flex-1 text-sm font-medium rounded-xl py-2 transition ${confirming ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-500 hover:text-white'}`}>
          {confirming ? '¿Seguro?' : '🗑'}
        </button>
      </div>
      <a href={`${baseUrl}/v/${video.id}`} target="_blank" rel="noopener noreferrer"
        className="block mt-3 text-center text-xs text-gray-700 hover:text-indigo-400 transition truncate">
        {baseUrl}/v/{video.id}
      </a>
    </div>
  );
}

export default function AdminPage() {
  const [authed, setAuthed] = useState(null);
  const [videos, setVideos] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingVideo, setEditingVideo] = useState(null);
  const [qrVideo, setQrVideo] = useState(null);
  const [baseUrl, setBaseUrl] = useState('');

  useEffect(() => {
    setBaseUrl(process.env.NEXT_PUBLIC_BASE_URL || window.location.origin);
    fetch('/api/videos')
      .then(r => { if (r.status === 401) { setAuthed(false); return null; } setAuthed(true); return r.json(); })
      .then(data => { if (data) setVideos(data); });
  }, []);

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    setAuthed(false);
  }

  function handleSave(saved, isEdit) {
    if (isEdit) setVideos(v => v.map(x => (x.id === saved.id ? saved : x)));
    else { setVideos(v => [saved, ...v]); setQrVideo(saved); }
    setShowForm(false);
    setEditingVideo(null);
  }

  if (authed === null) return <div className="min-h-screen flex items-center justify-center"><div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>;
  if (!authed) return <LoginForm onLogin={() => setAuthed(true)} />;

  return (
    <div className="min-h-screen bg-gray-950 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">Video QR</h1>
            <p className="text-gray-500 text-sm mt-0.5">Panel de administración</p>
          </div>
          <button onClick={handleLogout} className="text-sm text-gray-600 hover:text-white transition">Salir →</button>
        </div>

        {(showForm || editingVideo) ? (
          <div className="mb-6">
            <VideoForm existing={editingVideo} onSave={handleSave} onCancel={() => { setShowForm(false); setEditingVideo(null); }} />
          </div>
        ) : (
          <button onClick={() => setShowForm(true)}
            className="w-full mb-6 border-2 border-dashed border-gray-800 hover:border-indigo-600/50 hover:bg-indigo-600/5 rounded-2xl py-7 text-gray-500 hover:text-indigo-400 transition text-center">
            <span className="text-2xl block mb-1.5">＋</span>
            <span className="text-sm font-medium">Subir nuevo video</span>
          </button>
        )}

        {videos.length === 0
          ? <div className="text-center py-16 text-gray-700"><p className="text-4xl mb-3">📭</p><p className="text-sm">Aún no hay videos</p></div>
          : <div className="grid gap-4 sm:grid-cols-2">
              {videos.map(v => (
                <VideoCard key={v.id} video={v} baseUrl={baseUrl}
                  onEdit={video => { setEditingVideo(video); setShowForm(false); }}
                  onDelete={id => setVideos(vs => vs.filter(x => x.id !== id))}
                  onShowQR={setQrVideo} />
              ))}
            </div>
        }
      </div>
      {qrVideo && <QRModal video={qrVideo} baseUrl={baseUrl} onClose={() => setQrVideo(null)} />}
    </div>
  );
}