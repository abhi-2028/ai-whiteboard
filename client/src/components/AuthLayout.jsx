import React from 'react';
import { Link } from 'react-router-dom';
import { PenLine } from 'lucide-react';
import { cn } from '../lib/utils';

function Logo({ light = false }) {
  return (
    <Link to="/" className={cn('inline-flex items-center gap-2', light ? 'text-white' : 'text-ink')}>
      <span className={cn('grid h-9 w-9 place-items-center rounded-xl', light ? 'bg-white/15' : 'bg-brand-50')}>
        <PenLine className="h-4 w-4" />
      </span>
      <span className="font-display text-xl font-bold">Canvas</span>
    </Link>
  );
}

export default function AuthLayout({ title, subtitle, children, footer, wide = false }) {
  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      <section className="brand-gradient relative hidden overflow-hidden p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <Logo light />
        <div className="relative z-10 max-w-md">
          <h2 className="font-display text-4xl font-bold leading-tight">Think it. Draw it. Share it.</h2>
          <p className="mt-5 text-white/80">
            An infinite whiteboard for notes, diagrams, sketches and sticky-note brainstorms — with AI and live collaboration built in.
          </p>
        </div>
        <div className="relative z-10 flex flex-wrap gap-x-5 gap-y-2 text-sm text-white/70">
          <span>✎ Freehand &amp; shapes</span>
          <span>✦ AI brainstorm</span>
          <span>◉ Real-time</span>
        </div>
        <svg className="pointer-events-none absolute -bottom-16 -right-10 opacity-20" width="360" height="360" viewBox="0 0 360 360" fill="none" aria-hidden="true">
          <circle cx="210" cy="170" r="112" stroke="white" strokeWidth="2" />
          <path d="M25 280C84 166 163 107 316 98" stroke="white" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </section>

      <section className="flex items-center justify-center p-6 sm:p-10">
        <div className={cn('w-full animate-in', wide ? 'max-w-md' : 'max-w-sm')}>
          <div className="mb-10 lg:hidden">
            <Logo />
          </div>
          {title && <h1 className="font-display text-2xl font-bold">{title}</h1>}
          {subtitle && <p className="mt-2 text-sm text-muted">{subtitle}</p>}
          <div className="mt-8">{children}</div>
          {footer && <div className="mt-8 text-center text-sm text-muted">{footer}</div>}
        </div>
      </section>
    </main>
  );
}
