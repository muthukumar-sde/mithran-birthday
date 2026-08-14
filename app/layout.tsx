import type { Metadata } from 'next';
import './globals.scss';

export const metadata: Metadata = {
  title: "Mithran's 2nd Birthday Celebration ❤️✨",
  description: "A special birthday celebration created with love by Muthukumar & Pavithra for their darling son Mithran.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://mithran-birthday.vercel.app'),
  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
  openGraph: {
    title: "Mithran's 2nd Birthday Celebration ❤️✨",
    description: "A name created with the love of Muthukumar & Pavithra. Celebrating our little miracle Mithran ❤️",
    type: 'website',
    images: [
      {
        url: '/images/photo-25.jpg',
        width: 1200,
        height: 630,
        alt: "Mithran's Birthday Celebration",
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Mithran's 2nd Birthday Celebration ❤️✨",
    description: "Celebrating 2 years of pure magic, laughter, and endless love created by Muthukumar & Pavithra.",
    images: ['/images/photo-25.jpg'],
  },
};

import VisitorTracker from './components/VisitorTracker';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <VisitorTracker />
        {children}
      </body>
    </html>
  );
}
