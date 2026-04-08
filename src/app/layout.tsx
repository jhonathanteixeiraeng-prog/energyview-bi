import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'EnergyView - Análise de Faturas de Energia',
  description: 'Plataforma SaaS B2B para auditoria, gestão e análise técnica de faturas do setor elétrico.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className="antialiased dark min-h-screen bg-background font-sans">
        {children}
      </body>
    </html>
  );
}
