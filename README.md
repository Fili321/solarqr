# Video QR App

Sube videos a Cloudflare R2, genera un QR permanente con link al video. Puedes cambiar el video sin que el QR cambie.

## Stack
- **Next.js 14** (App Router)
- **Cloudflare R2** — almacenamiento de videos
- **PostgreSQL** — metadata (Railway)
- **Railway** — hosting

---

## Setup local

```bash
git clone <repo>
cd video-qr-app
npm install
cp .env.example .env.local
# Edita .env.local con tus credenciales
npm run dev
```

---

## Variables de entorno

| Variable | Descripción |
|---|---|
| `DATABASE_URL` | PostgreSQL de Railway |
| `R2_ACCOUNT_ID` | ID de tu cuenta Cloudflare |
| `R2_ACCESS_KEY_ID` | Access Key de R2 |
| `R2_SECRET_ACCESS_KEY` | Secret Key de R2 |
| `R2_BUCKET_NAME` | Nombre del bucket |
| `R2_PUBLIC_URL` | URL pública del bucket (ver abajo) |
| `NEXT_PUBLIC_BASE_URL` | URL de Railway sin slash final |
| `ADMIN_PASSWORD` | Contraseña del panel admin |

---

## Configurar Cloudflare R2

### 1. Crear el bucket
- Ve a Cloudflare Dashboard → R2 → Create Bucket

### 2. Habilitar acceso público
- Entra al bucket → Settings → Public Access → Allow Access
- Copia la URL pública (ej: `https://pub-xxxx.r2.dev`) → ponla en `R2_PUBLIC_URL`

### 3. Crear API Token
- R2 → Manage R2 API Tokens → Create API Token
- Permisos: **Object Read & Write** para el bucket específico
- Copia `Access Key ID` y `Secret Access Key`

### 4. Configurar CORS (para upload directo desde el browser)
En el bucket → Settings → CORS Policy, pega esto:

```json
[
  {
    "AllowedOrigins": ["https://tu-app.railway.app"],
    "AllowedMethods": ["PUT", "GET", "HEAD"],
    "AllowedHeaders": ["Content-Type", "Content-Length"],
    "MaxAgeSeconds": 3000
  }
]
```

> En desarrollo agrega `"http://localhost:3000"` a `AllowedOrigins`.

---

## Deploy en Railway

1. Push el proyecto a GitHub
2. En Railway → New Project → Deploy from GitHub
3. Add a PostgreSQL database (Railway lo provisiona automáticamente)
4. En Variables, agrega todas las variables del `.env.example`
5. Railway genera la URL → ponla en `NEXT_PUBLIC_BASE_URL`

> La tabla `videos` se crea automáticamente en el primer arranque.

---

## Cómo funciona el QR permanente

El QR apunta a `/v/{uuid}` donde `uuid` es el ID en la base de datos. 
Ese ID **nunca cambia**. Cuando reemplazas el video, solo se actualiza el `r2_key` en la DB, pero el ID (y el QR) permanecen iguales.

```
QR → /v/abc-123-def  ←→  DB { id: abc-123-def, r2_key: "videos/nuevo.mp4" }
```
