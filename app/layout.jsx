import './globals.css';

export const metadata = {
  title: 'Video QR App',
  description: 'Share videos via QR codes',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className="bg-gray-950 text-white min-h-screen">{children}</body>
    </html>
  );
}
