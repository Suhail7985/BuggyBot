'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { BotMessageSquare, Zap, Brain, BookOpen, Trophy, ArrowRight, Star, ChevronRight } from 'lucide-react';
import DemoChat from '@/components/landing/DemoChat';

const features = [
  {
    icon: <Brain size={24} />,
    title: 'AI-Powered Tutor',
    description: 'Context-aware answers from Grokking Algorithms using advanced RAG technology.',
    color: 'from-blue-500/20 to-cyan-500/20',
    border: 'border-blue-500/20',
    glow: 'rgba(59,130,246,0.2)',
  },
  {
    icon: <Zap size={24} />,
    title: 'Complexity Analyzer',
    description: 'Instantly get Big O analysis with best/worst/average case breakdowns.',
    color: 'from-violet-500/20 to-purple-500/20',
    border: 'border-violet-500/20',
    glow: 'rgba(139,92,246,0.2)',
  },
  {
    icon: <Trophy size={24} />,
    title: 'Quiz Generator',
    description: 'Generate MCQs, interview questions and flashcards on any DSA topic.',
    color: 'from-emerald-500/20 to-green-500/20',
    border: 'border-emerald-500/20',
    glow: 'rgba(16,185,129,0.2)',
  },
  {
    icon: <BookOpen size={24} />,
    title: 'Chapter Revision',
    description: 'Deep dive into any chapter with structured summaries and examples.',
    color: 'from-orange-500/20 to-amber-500/20',
    border: 'border-orange-500/20',
    glow: 'rgba(249,115,22,0.2)',
  },
  {
    icon: <BotMessageSquare size={24} />,
    title: 'Smart Explanations',
    description: 'Real-world analogies, step-by-step breakdowns, and Python code examples.',
    color: 'from-pink-500/20 to-rose-500/20',
    border: 'border-pink-500/20',
    glow: 'rgba(236,72,153,0.2)',
  },
  {
    icon: <Star size={24} />,
    title: 'Source Citations',
    description: 'Every answer cites the exact chapter and page from your uploaded book.',
    color: 'from-cyan-500/20 to-teal-500/20',
    border: 'border-cyan-500/20',
    glow: 'rgba(6,182,212,0.2)',
  },
];

const stats = [
  { value: '10+', label: 'DSA Topics' },
  { value: 'RAG', label: 'AI Architecture' },
  { value: '100%', label: 'Book-Grounded' },
  { value: '<1s', label: 'Response Time' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

export default function LandingPage() {
  return (
    <div className="min-h-screen hero-bg overflow-x-hidden">
      {/* ===== NAVBAR ===== */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#080c18]/80 border-b border-white/5 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
              <BotMessageSquare size={17} className="text-white" />
            </div>
            <span className="font-black text-xl tracking-tight">BuggyBot</span>
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-[10px] font-bold text-blue-400 uppercase tracking-wider">
              Beta
            </span>
          </div>

          <div className="hidden md:flex items-center gap-6 text-sm text-[var(--text-secondary)] font-medium">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#demo" className="hover:text-white transition-colors">Demo</a>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/login" className="btn-ghost text-sm font-semibold px-4">Sign in</Link>
            <Link href="/register" className="btn-primary text-sm py-2.5 px-5">
              Get Started <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </nav>

      {/* ===== HERO ===== */}
      <section className="pt-36 pb-24 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--bg-secondary)] border border-white/10 text-sm text-[var(--text-secondary)] mb-8"
          >
            <span className="w-2 h-2 rounded-full bg-green-400" />
            Powered by Gemini AI + RAG Architecture
            <ChevronRight size={14} className="text-[var(--text-muted)]" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-5xl md:text-7xl font-black tracking-tight leading-[1.1] mb-6"
          >
            Master DSA{' '}
            <br />
            <span className="gradient-text">Without Losing</span>
            <br />
            Your Mind
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-lg md:text-xl text-[var(--text-secondary)] max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            BuggyBot turns algorithm confusion into simple conversations.
            Ask anything from{' '}
            <span className="text-white font-medium">Grokking Algorithms</span>{' '}
            and get instant, book-grounded explanations.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-4 mb-16"
          >
            <Link href="/register" id="cta-start-learning" className="btn-primary px-8 py-3 text-base">
              Start Learning Free
              <ArrowRight size={18} />
            </Link>
            <Link href="/register" id="cta-upload-book" className="btn-secondary px-8 py-3 text-base">
              Upload Your Book
            </Link>
          </motion.div>

          {/* Stats Bar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="flex flex-wrap justify-center gap-8 md:gap-16"
          >
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-black gradient-text">{stat.value}</div>
                <div className="text-sm text-[var(--text-muted)] mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===== DEMO SECTION ===== */}
      <section id="demo" className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              See BuggyBot in{' '}
              <span className="gradient-text">Action</span>
            </h2>
            <p className="text-[var(--text-secondary)]">
              Try it out below — no signup required for the demo.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <DemoChat />
          </motion.div>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything You Need to{' '}
              <span className="gradient-text">Ace DSA</span>
            </h2>
            <p className="text-[var(--text-secondary)] max-w-xl mx-auto">
              From first principles to interview prep — BuggyBot has you covered.
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {features.map((feature) => (
              <motion.div
                key={feature.title}
                variants={itemVariants}
                className="glass-card p-7 group cursor-default relative overflow-hidden border border-white/5 hover:border-white/15"
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                {/* Ambient glow backdrop */}
                <div 
                  className="absolute -right-10 -top-10 w-32 h-32 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{ background: feature.glow }}
                />

                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/10 to-violet-600/10 border border-white/10 flex items-center justify-center mb-5 text-blue-400 group-hover:text-blue-300 group-hover:scale-110 group-hover:border-blue-500/30 transition-all duration-300">
                  {feature.icon}
                </div>
                <h3 className="font-bold text-lg mb-2.5 text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-blue-200 transition-all duration-300">
                  {feature.title}
                </h3>
                <p className="text-[var(--text-secondary)] text-sm leading-relaxed group-hover:text-slate-300 transition-colors duration-300">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===== CTA SECTION ===== */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-card p-12"
          >
            <div className="text-5xl mb-6">🤖</div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Finally Understand{' '}
              <span className="gradient-text">Binary Search?</span>
            </h2>
            <p className="text-[var(--text-secondary)] mb-8">
              Join thousands of students mastering DSA one conversation at a time.
            </p>
            <Link href="/register" id="cta-bottom" className="btn-primary px-10 py-4 text-lg">
              Start Learning Free <ArrowRight size={20} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="border-t border-white/5 py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
            <span className="font-bold text-white">BuggyBot</span>
            <span>·</span>
            <span>Your chaotic but genius DSA mentor</span>
          </div>
          <p className="text-xs text-[var(--text-muted)]">
            Built with ❤️ using Next.js, FastAPI & Gemini AI
          </p>
        </div>
      </footer>
    </div>
  );
}
