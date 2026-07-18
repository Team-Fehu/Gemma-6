import React from 'react';

interface LandingPageProps {
  onGetStarted: () => void;
}

const MOCK_ADVISORS = [
  { icon: '💲', name: 'Pricing', status: 'Done', tone: 'done' as const },
  { icon: '📈', name: 'Revenue', status: 'Done', tone: 'done' as const },
  { icon: '🏭', name: 'Supplier', status: 'Running', tone: 'running' as const },
  { icon: '💰', name: 'Collections', status: 'Waiting', tone: 'idle' as const },
  { icon: '⚙️', name: 'Operations', status: 'Waiting', tone: 'idle' as const },
  { icon: '🚀', name: 'Growth', status: 'Waiting', tone: 'idle' as const },
];

const FEATURES = [
  {
    tag: 'One model, six lanes',
    title: (
      <>
        Six specialists.
        <br />
        One brain.
      </>
    ),
    body: 'Gemma runs sequentially through pricing, revenue, supplier, collections, operations, and growth — each advisor sees only its own lane, so the reasoning never leaks between roles.',
    bullets: [
      { title: 'Sequential by design', desc: 'One model in memory at a time. No thrashing, no races.' },
      { title: 'A report is the memory', desc: 'Each advisor writes to disk and steps aside. Nothing stays "alive."' },
    ],
  },
  {
    tag: 'Zero hallucinated numbers',
    title: (
      <>
        The model reasons.
        <br />
        Tools compute.
      </>
    ),
    body: 'Every derived figure — margins, churn, DSO shifts, capacity — comes from a deterministic Python calculator, never from the model\'s imagination. Reports cite the exact call behind each number.',
    bullets: [
      { title: 'Grounded by construction', desc: 'Missing a number? It goes under Open Questions, not a guess.' },
      { title: 'Auditable math', desc: 'Every figure traces back to a formula and its inputs.' },
    ],
  },
  {
    tag: 'Talk to any advisor',
    title: (
      <>
        Click a lane.
        <br />
        Ask it anything.
      </>
    ),
    body: 'Once a report lands, reload that advisor\'s role and its report as context and chat directly — follow-up questions, what-ifs, second opinions.',
    bullets: [
      { title: 'Grounded follow-ups', desc: 'Chat is scoped to that advisor\'s report and the business data.' },
      { title: 'Front desk synthesis', desc: 'One voice that reads all six reports and flags disagreements.' },
    ],
  },
];

const StatusDot: React.FC<{ tone: 'done' | 'running' | 'idle' }> = ({ tone }) => {
  if (tone === 'done') return <span className="w-2 h-2 rounded-full bg-emerald-400" />;
  if (tone === 'running') return <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />;
  return <span className="w-2 h-2 rounded-full bg-gray-600" />;
};

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  return (
    <div className="min-h-screen bg-black text-white overflow-y-auto">
      {/* Nav */}
      <header className="border-b border-white/10 sticky top-0 z-30 bg-black/70 backdrop-blur">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-md bg-gradient-to-br from-accent to-accent-light" />
            <span className="font-semibold tracking-tight">GEMMA-6</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm text-gray-400">
            <a href="#how-it-works" className="hover:text-white transition-colors">Product</a>
            <a href="#advisors" className="hover:text-white transition-colors">Advisors</a>
            <a href="#grounding" className="hover:text-white transition-colors">Grounding</a>
          </nav>
          <button
            onClick={onGetStarted}
            className="px-4 py-2 text-sm font-semibold rounded-md bg-gradient-to-r from-accent to-accent-light hover:shadow-lg hover:shadow-accent/30 transition-all"
          >
            Get Started
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="relative px-6 pt-20 pb-16 text-center overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            background:
              'radial-gradient(600px circle at 50% 0%, rgba(168,85,247,0.18), transparent 60%)',
          }}
        />
        <div className="relative max-w-3xl mx-auto">
          <p className="text-xs font-semibold tracking-widest text-accent-light uppercase mb-5">
            One Gemma model &middot; Six advisor roles
          </p>
          <h1 className="font-serif-display text-5xl md:text-6xl leading-tight mb-5">
            Advise your business
            <br />
            peacefully
          </h1>
          <p className="text-lg text-gray-400 max-w-xl mx-auto mb-8">
            An SME advisory tool that never guesses a number. Pricing, revenue, supplier,
            collections, operations, and growth — reasoned by Gemma, grounded by deterministic
            tools.
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={onGetStarted}
              className="px-6 py-3 font-semibold rounded-lg bg-gradient-to-r from-accent to-accent-light hover:shadow-lg hover:shadow-accent/30 transition-all"
            >
              Get Started →
            </button>
            <a
              href="#how-it-works"
              className="px-6 py-3 font-semibold rounded-lg border border-white/15 text-gray-200 hover:bg-white/5 transition-colors"
            >
              How it works
            </a>
          </div>
        </div>

        {/* Floating dashboard preview */}
        <div className="relative max-w-4xl mx-auto mt-16 rounded-xl border border-white/10 bg-[#0d0d0d] shadow-2xl shadow-black/60 overflow-hidden text-left">
          <div className="flex items-center justify-between px-5 py-3 border-b border-white/10">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <span className="w-4 h-4 rounded bg-gradient-to-br from-accent to-accent-light" />
              GEMMA-6 / Analysis
            </div>
            <span className="text-xs text-gray-500">Dashboard</span>
          </div>
          <div className="p-6 grid grid-cols-2 md:grid-cols-3 gap-3">
            {MOCK_ADVISORS.map((a) => (
              <div
                key={a.name}
                className="rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <span>{a.icon}</span>
                  <span className="text-sm font-medium text-gray-200">{a.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">{a.status}</span>
                  <StatusDot tone={a.tone} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Logos-style strip -> re-purposed as "grounded in" strip */}
      <section className="border-y border-white/10 py-6">
        <div className="max-w-5xl mx-auto px-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-3 text-sm text-gray-500 font-mono">
          <span>price_elasticity_impact()</span>
          <span>estimate_cashflow_impact()</span>
          <span>supplier_exposure()</span>
          <span>project_revenue()</span>
          <span>capacity_check()</span>
          <span>cannibalization_estimate()</span>
        </div>
      </section>

      {/* Feature sections with rail */}
      <section id="how-it-works" className="relative max-w-5xl mx-auto px-6 py-24">
        <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px bg-white/10 hidden md:block" />
        <div className="space-y-28">
          {FEATURES.map((f, i) => (
            <div
              key={f.tag}
              id={i === 1 ? 'grounding' : i === 2 ? 'advisors' : undefined}
              className={`relative grid md:grid-cols-2 gap-10 items-center ${
                i % 2 === 1 ? 'md:[&>*:first-child]:order-2' : ''
              }`}
            >
              <div className="hidden md:block absolute left-1/2 -translate-x-1/2 rail-dot" style={{ top: 6 }} />
              <div>
                <span className="inline-block text-xs font-semibold text-accent-light bg-accent-bg border border-accent-border/40 rounded-full px-3 py-1 mb-4">
                  {f.tag}
                </span>
                <h2 className="font-serif-display text-3xl md:text-4xl leading-snug mb-4">{f.title}</h2>
                <p className="text-gray-400 mb-6">{f.body}</p>
                <div className="space-y-4">
                  {f.bullets.map((b) => (
                    <div key={b.title} className="border-t border-white/10 pt-3">
                      <p className="font-semibold text-gray-100 text-sm">{b.title}</p>
                      <p className="text-sm text-gray-500">{b.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-6 h-56 flex items-center justify-center">
                <div className="text-6xl">{['🧭', '🧮', '💬'][i]}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 pb-24">
        <div className="max-w-4xl mx-auto rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-transparent px-10 py-16 text-center">
          <h2 className="font-serif-display text-3xl md:text-4xl mb-4">Run your first analysis</h2>
          <p className="text-gray-400 mb-8">
            Load a preset scenario or bring your own numbers. Six advisors, one synthesis, no
            invented figures.
          </p>
          <button
            onClick={onGetStarted}
            className="px-8 py-3 font-semibold rounded-lg bg-gradient-to-r from-accent to-accent-light hover:shadow-lg hover:shadow-accent/30 transition-all"
          >
            Get Started →
          </button>
        </div>
      </section>

      <footer className="border-t border-white/10 py-8 text-center text-xs text-gray-600">
        GEMMA-6 — one Gemma model, six advisor roles, zero invented numbers.
      </footer>
    </div>
  );
};
