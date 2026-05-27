import './globals.css';
import Shell from '@/components/Shell';

export const metadata = {
  title: 'Carglass – Værkstedssystem',
  description: 'Intern styring af reparationsopgaver for Carglass A/S',
};

export default function RootLayout({ children }) {
  return (
    <html lang="da">
      <body className="min-h-screen bg-slate-50 text-slate-900">
        <Shell>{children}</Shell>
      </body>
    </html>
  );
}
