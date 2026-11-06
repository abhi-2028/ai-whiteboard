import React from 'react';
import { Link } from 'react-router-dom';
import {
  Download,
  MousePointer2,
  PenLine,
  Shapes,
  Sparkles,
  Users,
} from 'lucide-react';
import Button from '../components/ui/Button';
import { useAuthUser } from '../context/AuthContext';

const features = [
  {
    icon: Shapes,
    title: 'Shapes',
    description: 'Every tool you need — Text, sticky notes, shapes, lines, arrows, freehand drawing and build lists on one infinite canvas.',
  },
  {
    icon: Sparkles,
    title: 'AI brainstorming',
    description: 'Turn a prompt into a wall of sticky notes or a structured outline. Summarize a busy board in a click.',
  },
  {
    icon: Users,
    title: 'Real-time collaboration',
    description: "See teammates' cursors and edits live. Share a board with editors and viewers.",
  },
  {
    icon: Download,
    title: 'Export anywhere',
    description: 'Download your whiteboard as a crisp PNG or a scalable SVG to drop into docs and decks.',
  },
];

function BrandLockup() {
  return (
    <Link to="/" className="inline-flex items-center gap-2">
      <span className="grid h-9 w-9 place-items-center rounded-full brand-gradient text-white shadow-card">
        <PenLine className="h-4 w-4" />
      </span>
      <span className="font-display text-xl font-bold">Canvas</span>
    </Link>
  );
}

function Arrow({ className }) {
  return (
    <svg className={className} width="70" height="32" viewBox="0 0 70 32" fill="none" aria-hidden="true">
      <path d="M6 16h52" stroke="#e11d48" strokeWidth="2.5" strokeLinecap="round" />
      <path d="m49 8 10 8-10 8" stroke="#e11d48" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function Landing() {
  const user = useAuthUser();

  return (
    <div className="min-h-screen">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <BrandLockup />
        <div className="flex items-center gap-2">
          {user ? (
            <Link to="/dashboard"><Button size="sm">Open app</Button></Link>
          ) : (
            <>
              <Link to="/login"><Button variant="ghost" size="sm">Sign in</Button></Link>
              <Link to="/register"><Button size="sm">Get started</Button></Link>
            </>
          )}
        </div>
      </nav>

      <section className="mx-auto max-w-4xl px-6 pb-10 pt-16 text-center animate-in">
        <div className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3.5 py-1.5 text-xs font-medium text-shadow-[var(--shadow-card)]">
          <Sparkles className="h-3.5 w-3.5 text-brand-500" />
          AI-powered whiteboard notes
        </div>
        <h1 className="mt-7 font-display text-5xl font-bold leading-[1.05] sm:text-6xl">
          The infinite canvas for
          <br />
          <span className="text-gradient">notes that think with you.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg text-muted">
          Sketch, diagram and brainstorm freely. Drop text, shapes and sticky notes, draw by hand, and let AI expand your ideas — all in real time.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link to="/dashboard"><Button size="lg"><MousePointer2 className="h-4 w-4" />Start whiteboarding</Button></Link>
          {!user && <Link to="/login"><Button variant="secondary" size="lg">Sign in</Button></Link>}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-20">
        <div className="card canvas-bg-dots rounded-3xl px-6 py-10 shadow-[var(--shadow-lift)] sm:px-10" style={{ backgroundSize: '22px 22px', backgroundColor: '#fff' }}>
          <div className="flex min-h-24 flex-wrap items-center justify-center gap-5 sm:gap-6">
            <div className="rounded-2xl bg-amber-200 px-6 py-3 text-sm font-semibold text-amber-950 shadow-soft" style={{ transform: 'rotate(-3deg)' }}>
              💡 Brainstorm ideas
            </div>
            <div className="rounded-2xl border border-line bg-white px-7 py-3 text-sm font-semibold text-ink shadow-soft" style={{ transform: 'rotate(1deg)' }}>
              Plan
            </div>
            <Arrow className="shrink-0" />
            <div className="rounded-full bg-blue-200 px-7 py-3 text-sm font-semibold text-blue-900 shadow-soft" style={{ transform: 'rotate(2deg)' }}>
              Ship 🚀
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-5xl gap-4 px-6 pb-24 sm:grid-cols-2">
        {features.map(({ icon: Icon, title, description }) => (
          <article className="card rounded-2xl p-6" key={title}>
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-brand-600">
              <Icon className="h-5 w-5" />
            </div>
            <h2 className="mt-5 font-display text-lg font-semibold">{title}</h2>
            <p className="mt-2 text-sm text-muted">{description}</p>
          </article>
        ))}
      </section>

      <footer className="border-t border-line py-8 text-center text-sm text-muted">
        Built with the PERN stack · React · Express · PostgreSQL · Socket.IO.
      </footer>
    </div>
  );
}
