'use client';

import { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';

// ─── Login Form ───────────────────────────────────────────────────────────────
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
    if (res.ok) {
      onLogin();
    } else {
      const data = await res.json();
      setError(data.error || 'Error al iniciar sesión');
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950">
      <div className="bg-gray-900 rounded-2xl p-8 w-full max-w-sm shadow-2xl border border-gray-800">
        <h1 className="text-2xl font-bold text-white mb-2">Admin</h1>
        <p className="text-gray-400 text-sm mb-6">Ingresa tu contraseña para continuar</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold rounded-lg py-3 transition"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Upload Progress Bar ──────────────────────────────────────────────────────
function ProgressBar({ progress }) {
  return (
    <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
      <div
        className="bg-indigo-500 h-2 rounded-full transition-all duration-200"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

// ─── QR Modal ─────────────────────────────────────────────────────────────────
function QRModal({ video, baseUrl, onClose }) {
  const [qrDataUrl, setQrDataUrl] = useState('');
  const videoUrl = `${baseUrl}/v/${video.id}`;

  useEffect(() => {
    QRCode.toDataURL(videoUrl, {
      width: 300,
      margin: 2,
      color: { dark: '#000000', light: '#ffffff' },
    }).then(setQrDataUrl);
  }, [videoUrl]);

  function downloadQR() {
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `qr-${video.title.replace(/\s+/g, '-')}.png`;
    a.click();
  }

  function copyLink() {
    navigator.clipboard.writeText(videoUrl);
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-2xl p-6 w-full max-w-sm border border-gray-700 shadow-2xl">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-white">{video.title}</h3>
            <p className="text-gray-400 text-xs mt-1 break-all">{videoUrl}</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white ml-3 text-xl leading-none">✕</button>
        </div>

        {qrDataUrl ? (
          <div className="flex justify-center mb-4">
            <img src={qrDataUrl} alt="QR Code" className="rounded-lg w-52 h-52" />
          </div>
        ) : (
          <div className="w-52 h-52 mx-auto bg-gray-800 rounded-lg animate-pulse mb-4" />
        )}

        <div className="space-y-2">
          <button
            onClick={downloadQR}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg py-2.5 transition text-sm"
          >
            ⬇ Descargar QR
          </button>
          <button
            onClick={copyLink}
            className="w-full bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg py-2.5 transition text-sm"
          >
            🔗 Copiar enlace
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Video Form (create or edit) ──────────────────────────────────────────────
function VideoForm({ existing, onSave, onCancel }) {
  const [title, setTitle] = useState(existing?.title || '');
  const [description, setDescription] = useState(existing?.description || '');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const fileRef = useRef();

  const isEdit = !!existing;

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!isEdit && !file) {
      setError('Selecciona un video');
      return;
    }
    if (!title.trim()) {
      setError('El título es requerido');
      return;
    }

    setUploading(true);
    setProgress(0);

    try {
      let r2Key = existing?.r2_key || null;
      let oldR2Key = existing?.r2_key || null;

      // If a new file was selected, upload it to R2
      if (file) {
        // 1. Get presigned URL
        const presignRes = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filename: file.name, contentType: file.type }),
        });

        if (!presignRes.ok) throw new Error('Error al obtener URL de carga');
        const { uploadUrl, key } = await presignRes.json();
        r2Key = key;

        // 2. Upload directly to R2 via presigned URL with progress
        await new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open('PUT', uploadUrl);
          xhr.setRequestHeader('Content-Type', file.type);
          xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) {
              setProgress(Math.round((e.loaded / e.total) * 90));
            }
          };
          xhr.onload = () => (xhr.status === 200 ? resolve() : reject(new Error('Upload failed')));
          xhr.onerror = () => reject(new Error('Upload error'));
          xhr.send(file);
        });

        setProgress(95);
      }

      // 3. Create or update the video record
      const url = isEdit ? `/api/videos/${existing.id}` : '/api/videos';
      const method = isEdit ? 'PUT' : 'POST';
      const body = isEdit
        ? { title, description, r2Key, oldR2Key }
        : { title, description, r2Key };

      const saveRes = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!saveRes.ok) throw new Error('Error al guardar el video');
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
    <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6">
      <h2 className="text-lg font-bold text-white mb-5">
        {isEdit ? '✏️ Editar video' : '➕ Nuevo video'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Título *</label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Ej: Demo del producto"
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">Descripción</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Descripción opcional..."
            rows={3}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">
            {isEdit ? 'Reemplazar video (opcional)' : 'Archivo de video *'}
          </label>
          <div
            onClick={() => fileRef.current?.click()}
            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition
              ${file ? 'border-indigo-500 bg-indigo-500/10' : 'border-gray-700 hover:border-gray-500'}`}
          >
            {file ? (
              <div>
                <p className="text-indigo-300 font-medium">{file.name}</p>
                <p className="text-gray-500 text-xs mt-1">{(file.size / 1024 / 1024).toFixed(1)} MB</p>
              </div>
            ) : (
              <div>
                <p className="text-3xl mb-2">🎬</p>
                <p className="text-gray-400 text-sm">Haz clic para seleccionar un video</p>
                <p className="text-gray-600 text-xs mt-1">MP4, MOV, WebM, etc.</p>
              </div>
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="video/*"
            className="hidden"
            onChange={e => setFile(e.target.files[0] || null)}
          />
        </div>

        {uploading && (
          <div>
            <p className="text-sm text-gray-400">
              {progress < 95 ? `Subiendo video... ${progress}%` : 'Guardando...'}
            </p>
            <ProgressBar progress={progress} />
          </div>
        )}

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={uploading}
            className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold rounded-lg py-2.5 transition"
          >
            {uploading ? 'Procesando...' : isEdit ? 'Guardar cambios' : 'Crear video'}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition"
            >
              Cancelar
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

// ─── Video Card ───────────────────────────────────────────────────────────────
function VideoCard({ video, baseUrl, onEdit, onDelete, onShowQR }) {
  const [confirming, setConfirming] = useState(false);

  async function handleDelete() {
    if (!confirming) { setConfirming(true); return; }
    await fetch(`/api/videos/${video.id}`, { method: 'DELETE' });
    onDelete(video.id);
  }

  const createdAt = new Date(video.created_at).toLocaleDateString('es-ES', {
    day: '2-digit', month: 'short', year: 'numeric',
  });

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 hover:border-gray-700 transition">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-white truncate">{video.title}</h3>
          {video.description && (
            <p className="text-gray-400 text-sm mt-1 line-clamp-2">{video.description}</p>
          )}
          <p className="text-gray-600 text-xs mt-2">{createdAt}</p>
        </div>
      </div>

      <div className="flex gap-2 mt-4">
        <button
          onClick={() => onShowQR(video)}
          className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg py-2 transition"
        >
          📱 Ver QR
        </button>
        <button
          onClick={() => onEdit(video)}
          className="flex-1 bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium rounded-lg py-2 transition"
        >
          ✏️ Editar
        </button>
        <button
          onClick={handleDelete}
          onBlur={() => setConfirming(false)}
          className={`flex-1 text-sm font-medium rounded-lg py-2 transition
            ${confirming
              ? 'bg-red-600 hover:bg-red-500 text-white'
              : 'bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white'}`}
        >
          {confirming ? '¿Seguro?' : '🗑 Borrar'}
        </button>
      </div>

      <a
        href={`${baseUrl}/v/${video.id}`}
        target="_blank"
        rel="noopener noreferrer"
        className="block mt-2 text-center text-xs text-gray-500 hover:text-indigo-400 transition truncate"
      >
        {baseUrl}/v/{video.id}
      </a>
    </div>
  );
}

// ─── Main Admin Page ──────────────────────────────────────────────────────────
export default function AdminPage() {
  const [authed, setAuthed] = useState(null); // null = loading
  const [videos, setVideos] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingVideo, setEditingVideo] = useState(null);
  const [qrVideo, setQrVideo] = useState(null);
  const [baseUrl, setBaseUrl] = useState('');

  // Check auth by trying to fetch videos
  useEffect(() => {
    setBaseUrl(
      process.env.NEXT_PUBLIC_BASE_URL ||
      (typeof window !== 'undefined' ? window.location.origin : '')
    );
    fetch('/api/videos')
      .then(r => {
        if (r.status === 401) { setAuthed(false); return null; }
        setAuthed(true);
        return r.json();
      })
      .then(data => { if (data) setVideos(data); });
  }, []);

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    setAuthed(false);
  }

  function handleSave(saved, isEdit) {
    if (isEdit) {
      setVideos(v => v.map(x => (x.id === saved.id ? saved : x)));
    } else {
      setVideos(v => [saved, ...v]);
      // Auto-show QR after creating
      setQrVideo(saved);
    }
    setShowForm(false);
    setEditingVideo(null);
  }

  if (authed === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!authed) {
    return <LoginForm onLogin={() => setAuthed(true)} />;
  }

  return (
    <div className="min-h-screen bg-gray-950 p-4 md:p-8">
      {/* Header */}
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">🎬 Video QR</h1>
            <p className="text-gray-400 text-sm mt-1">Panel de administración</p>
          </div>
          <button
            onClick={handleLogout}
            className="text-sm text-gray-500 hover:text-white transition"
          >
            Salir →
          </button>
        </div>

        {/* Form: New or Edit */}
        {(showForm || editingVideo) ? (
          <div className="mb-8">
            <VideoForm
              existing={editingVideo}
              onSave={handleSave}
              onCancel={() => { setShowForm(false); setEditingVideo(null); }}
            />
          </div>
        ) : (
          <button
            onClick={() => setShowForm(true)}
            className="w-full mb-8 border-2 border-dashed border-gray-700 hover:border-indigo-500 rounded-2xl py-8 text-gray-400 hover:text-indigo-400 transition text-center"
          >
            <span className="text-3xl block mb-2">＋</span>
            <span className="font-medium">Subir nuevo video</span>
          </button>
        )}

        {/* Videos Grid */}
        {videos.length === 0 ? (
          <div className="text-center py-16 text-gray-600">
            <p className="text-4xl mb-3">📭</p>
            <p>Aún no hay videos. ¡Sube el primero!</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {videos.map(v => (
              <VideoCard
                key={v.id}
                video={v}
                baseUrl={baseUrl}
                onEdit={video => { setEditingVideo(video); setShowForm(false); }}
                onDelete={id => setVideos(vs => vs.filter(x => x.id !== id))}
                onShowQR={setQrVideo}
              />
            ))}
          </div>
        )}
      </div>

      {/* QR Modal */}
      {qrVideo && (
        <QRModal
          video={qrVideo}
          baseUrl={baseUrl}
          onClose={() => setQrVideo(null)}
        />
      )}
    </div>
  );
}
