import type { Metadata } from 'next';
import './globals.css';
import { SecurityLayer } from '../components/SecurityLayer';
import { PlatformProvider } from '../components/PlatformContext';

export const metadata: Metadata = {
  title: 'Nflix — Movie & TV Discovery',
  description: 'Browse movie and TV metadata powered by TMDB.',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://image.tmdb.org" />
        <link rel="preconnect" href="https://api.dicebear.com" crossOrigin="anonymous" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        <PlatformProvider>
          <SecurityLayer>
            {children}
          </SecurityLayer>
        </PlatformProvider>
      </body>
    </html>
  );
}
