import type { Metadata } from 'next';
import './globals.scss';

export const metadata: Metadata = {
  title: "Mithran's Birthday ❤️",
  description: "A special birthday celebration created with love by Muthukumar & Pavithra for their son Mithran.",
  openGraph: {
    title: "Mithran's Birthday Celebration",
    description: "A name created with the love of Muthukumar & Pavithra. Celebrating our little miracle Mithran ❤️",
    type: 'website',
    images: [
      {
        url: '/images/photo-01.jpg',
        width: 1200,
        height: 630,
        alt: 'Mithran Birthday',
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
