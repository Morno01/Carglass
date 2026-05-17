import type { Metadata } from 'next';
import './globals.css';
import Navigation from '@/components/Navigation';
import ClientLayout from '@/components/ClientLayout';

export const metadata: Metadata = {
  title: 'Carglass – Værkstedssystem',
  description: 'Intern styring af reparationsopgaver for Carglass A/S',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="da">
      <body className="min-h-screen bg-slate-50">
        <Navigation />
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
