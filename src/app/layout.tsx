import type { Metadata } from 'next';
import './globals.css';
import { SecurityLayer } from '../components/SecurityLayer';
import { PlatformProvider } from '../components/PlatformContext';

export const metadata: Metadata = {
  title: 'Streamly — All-in-One Streaming',
  description: 'The ultimate movie and TV streaming experience.',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    apple: 'https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Streamly',
  },
};

export const viewport = {
  themeColor: '#141414',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var p=localStorage.getItem('app_platform');if(p==='nprime'||p==='nflix'||p==='hotstar'){document.documentElement.setAttribute('data-theme',p);}}catch(e){}})();`,
          }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://image.tmdb.org" />
        <link rel="preconnect" href="https://api.dicebear.com" crossOrigin="anonymous" />
        <meta name="mobile-web-app-capable" content="yes" />
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
