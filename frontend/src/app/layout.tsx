import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/Providers';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono', weight: ['400', '500', '600'] });

export const metadata: Metadata = {
  title: 'BuggyBot — DSA Learning Assistant',
  description: 'Professional AI tutor for data structures, algorithms, and debugging — structured explanations powered by OpenAI.',
  keywords: ['DSA', 'algorithms', 'AI tutor', 'data structures', 'grokking algorithms', 'binary search', 'BFS', 'DFS'],
  authors: [{ name: 'BuggyBot' }],
  openGraph: {
    title: 'BuggyBot — DSA Learning Assistant',
    description: 'Professional AI tutoring for data structures and algorithms.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <head>
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
