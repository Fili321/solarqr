import './globals.css';
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata = {
  title: 'Video QR',
  description: 'Comparte videos via QR',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" className={inter.variable}>
      <body className="font-sans bg-gray-950 text-white min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}