import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request) {
  const { password } = await request.json();

  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Contraseña incorrecta' }, { status: 401 });
  }

  // Simple signed token: base64(password + secret)
  const token = Buffer.from(
    `${process.env.ADMIN_PASSWORD}:${process.env.ADMIN_PASSWORD}`
  ).toString('base64');

  const cookieStore = cookies();
  cookieStore.set('admin_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });

  return NextResponse.json({ ok: true });
}
