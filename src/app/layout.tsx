import type { Metadata } from 'next';
import './globals.css';
import TopNav from '@/components/TopNav';

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
        <TopNav />
        <main className="pt-16">
          {children}
        </main>
      </body>
    </html>
  );
}
