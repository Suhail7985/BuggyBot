'use client';

import Link from 'next/link';
import { BotMessageSquare, Brain, Zap, BookOpen, ArrowRight, FileSearch } from 'lucide-react';
import DemoChat from '@/components/landing/DemoChat';

const features = [
  {
    icon: Brain,
    title: 'Structured tutoring',
    description: 'Clear explanations for algorithms, data structures, and debugging.',
  },
  {
    icon: Zap,
    title: 'Complexity analysis',
    description: 'Time and space complexity with best, average, and worst cases.',
  },
  {
    icon: BookOpen,
    title: 'Quiz mode',
    description: 'Practice questions aligned with your course material.',
  },
  {
    icon: FileSearch,
    title: 'Source citations',
    description: 'Answers reference indexed chapters and pages when available.',
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen hero-bg">
      <header className="landing-nav">
        <div className="page-container h-full flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="message-avatar assistant w-8 h-8">
              <BotMessageSquare size={16} />
            </div>
            <span className="font-semibold text-sm">BuggyBot</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm text-[var(--text-secondary)]">
            <a href="#demo" className="hover:text-[var(--text-primary)] transition-colors">
              Demo
            </a>
            <a href="#features" className="hover:text-[var(--text-primary)] transition-colors">
              Features
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/login" className="btn-ghost text-sm px-3">
              Sign in
            </Link>
            <Link href="/register" className="btn-primary text-sm">
              Get started
            </Link>
          </div>
        </div>
      </header>

      <main className="pt-24 pb-16">
        <section className="page-container py-16 md:py-24">
          <div className="max-w-2xl mx-auto text-center">
            <p className="text-label mb-4">DSA learning assistant</p>
            <h1 className="text-4xl md:text-5xl font-semibold tracking-tight leading-tight mb-5">
              Learn algorithms with{' '}
              <span className="gradient-text">clarity</span>
            </h1>
            <p className="text-[var(--text-secondary)] text-base md:text-lg leading-relaxed mb-8">
              Professional, source-grounded tutoring for data structures, algorithms,
              and technical interview preparation.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link href="/register" className="btn-primary px-6 py-2.5">
                Create free account <ArrowRight size={16} />
              </Link>
              <a href="#demo" className="btn-secondary px-6 py-2.5">
                Try demo
              </a>
            </div>
          </div>
        </section>

        <section id="demo" className="page-container pb-20">
          <div className="max-w-2xl mx-auto mb-8 text-center">
            <h2 className="text-xl font-semibold mb-2">Live demo</h2>
            <p className="text-sm text-[var(--text-secondary)]">
              No account required. Ask a question below.
            </p>
          </div>
          <div className="max-w-2xl mx-auto">
            <DemoChat />
          </div>
        </section>

        <section id="features" className="page-container pb-24">
          <div className="text-center mb-10">
            <h2 className="text-xl font-semibold mb-2">Features</h2>
            <p className="text-sm text-[var(--text-secondary)] max-w-md mx-auto">
              Built for students who want precise answers, not noise.
            </p>
          </div>
          <div className="feature-grid max-w-4xl mx-auto">
            {features.map(({ icon: Icon, title, description }) => (
              <div key={title} className="surface-card">
                <div className="message-avatar assistant w-10 h-10 mb-4">
                  <Icon size={18} />
                </div>
                <h3 className="text-sm font-semibold mb-2">{title}</h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="page-container pb-16">
          <div className="surface-card max-w-xl mx-auto text-center py-10 px-6">
            <h2 className="text-lg font-semibold mb-2">Ready to start?</h2>
            <p className="text-sm text-[var(--text-secondary)] mb-6">
              Save your chat history and upload your own textbooks.
            </p>
            <Link href="/register" className="btn-primary px-8">
              Create account <ArrowRight size={16} />
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-[var(--border)] py-6">
        <div className="page-container flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[var(--text-muted)]">
          <span className="font-medium text-[var(--text-secondary)]">BuggyBot</span>
          <span>Next.js · Express · OpenAI</span>
        </div>
      </footer>
    </div>
  );
}
