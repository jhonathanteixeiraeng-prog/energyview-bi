import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' });

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
      <body className={`${inter.variable} ${jetbrainsMono.variable} antialiased dark min-h-screen bg-background font-sans`}>
        {children}
      </body>
    </html>
  );
}
