import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Cozy 3D Workspace · AI Agent Campus',
  description: 'Interactive 3D tycoon office for AI coding agents with real-time OMP telemetry and live stairs to server room.',
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
