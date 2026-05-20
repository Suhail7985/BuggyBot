import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/Providers';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono', weight: ['400', '500', '600'] });

export const metadata: Metadata = {
  title: 'BuggyBot — Your DSA AI Mentor',
  description: 'Master Data Structures & Algorithms with BuggyBot, your chaotic but genius AI tutor powered by Grokking Algorithms.',
  keywords: ['DSA', 'algorithms', 'AI tutor', 'data structures', 'grokking algorithms', 'binary search', 'BFS', 'DFS'],
  authors: [{ name: 'BuggyBot' }],
  openGraph: {
    title: 'BuggyBot — Your DSA AI Mentor',
    description: 'Master DSA without losing your mind.',
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
