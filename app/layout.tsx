import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Body Recomposition Tracker',
  description: 'Track your body recomposition journey',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}

