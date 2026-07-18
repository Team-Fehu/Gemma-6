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
  const tools = [
    'price_elasticity_impact()',
    'estimate_cashflow_impact()',
    'supplier_exposure()',
    'project_revenue()',
    'capacity_check()',
    'cannibalization_estimate()',
  ];

  return (
    <div className="landing-page min-h-screen text-white overflow-y-auto">
      <header className="site-nav border-b sticky top-0 z-30 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="brand-mark w-8 h-8 rounded-xl" aria-hidden="true" />
            <span className="text-sm font-bold tracking-[0.16em]">GEMMA-6</span>
          </div>
          <nav className="hidden md:flex items-center gap-9 text-xs uppercase tracking-[0.16em] text-gray-500">
            <a href="#how-it-works" className="hover:text-purple-300 transition-colors">Product</a>
            <a href="#advisors" className="hover:text-purple-300 transition-colors">Advisors</a>
            <a href="#grounding" className="hover:text-cyan-300 transition-colors">Grounding</a>
          </nav>
          <button onClick={onGetStarted} className="primary-button px-5 py-2.5 text-sm font-semibold rounded-xl">
            Open workspace
          </button>
        </div>
      </header>

      <main>
        <section className="hero-zone relative px-6 py-20 text-center overflow-hidden">
          <span className="hero-glow one" aria-hidden="true" />
          <span className="hero-glow two" aria-hidden="true" />
          <div className="relative max-w-4xl mx-auto">
            <span className="live-pill mb-7">Local model online</span>
            <p className="text-xs font-semibold tracking-[0.24em] text-purple-300 uppercase mb-5">
              One Gemma model · Six specialist perspectives
            </p>
            <h1 className="hero-title-gradient font-serif-display text-5xl sm:text-6xl lg:text-7xl leading-[.98] mb-7">
              Better decisions,
              <br />grounded in your numbers.
            </h1>
            <p className="text-base md:text-lg leading-8 text-gray-400 max-w-2xl mx-auto mb-9">
              Turn one business decision into six focused analyses. Every figure is calculated by deterministic tools, then combined into one clear recommendation.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button onClick={onGetStarted} className="primary-button px-7 py-3.5 font-semibold rounded-xl">
                Start an analysis <span className="ml-2">→</span>
              </button>
              <a href="#how-it-works" className="px-7 py-3.5 font-semibold rounded-xl border border-white/10 bg-white/[0.035] text-gray-300 hover:text-white hover:bg-white/[0.07] transition-all">
                See how it works
              </a>
            </div>
          </div>

          <div className="dashboard-preview glass-panel relative max-w-5xl w-full mx-auto mt-20 rounded-2xl overflow-hidden text-left">
            <div className="flex items-center justify-between px-5 md:px-7 py-4 border-b border-white/10">
              <div className="flex items-center gap-3 text-xs text-gray-400">
                <span className="brand-mark w-5 h-5 rounded-md" />
                <span className="tracking-wider">ANALYSIS PIPELINE</span>
              </div>
              <span className="live-pill">Running</span>
            </div>
            <div className="p-5 md:p-8">
              <div className="flex items-end justify-between mb-5">
                <div>
                  <p className="text-[10px] uppercase tracking-[.2em] text-gray-600 mb-1">Decision under review</p>
                  <p className="text-sm md:text-base text-gray-200">Should we accept the new supplier contract?</p>
                </div>
                <span className="hidden sm:block text-xs font-mono text-purple-300">03 / 07 complete</span>
              </div>
              <div className="pipeline rounded-full mb-6"><span style={{ width: '43%' }} /></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {MOCK_ADVISORS.map((advisor, index) => (
                  <div key={advisor.name} className="rounded-xl border border-white/10 bg-black/20 px-4 py-4 flex items-center justify-between transition-all hover:bg-white/[0.05] hover:-translate-y-0.5" style={{ animationDelay: `${index * 120}ms` }}>
                    <div className="flex items-center gap-3">
                      <span className="advisor-icon !w-9 !h-9 !rounded-xl text-base">{advisor.icon}</span>
                      <span className="text-sm font-medium text-gray-200">{advisor.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase tracking-wider text-gray-600">{advisor.status}</span>
                      <StatusDot tone={advisor.tone} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-white/[0.07] py-6 bg-black/20">
          <p className="text-center text-[10px] tracking-[.28em] uppercase text-gray-600 mb-5">Deterministic tool layer</p>
          <div className="tool-marquee-shell max-w-7xl mx-auto font-mono text-xs">
            <div className="tool-marquee">
              {[...tools, ...tools].map((tool, index) => <span key={`${tool}-${index}`}>{tool}</span>)}
            </div>
          </div>
        </section>

        <section id="how-it-works" className="relative max-w-6xl mx-auto px-6 py-28">
          <div className="absolute left-1/2 top-24 bottom-24 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent hidden md:block" />
          <div className="space-y-28 md:space-y-40">
            {FEATURES.map((feature, index) => (
              <article key={feature.tag} id={index === 1 ? 'grounding' : index === 2 ? 'advisors' : undefined} className={`relative grid md:grid-cols-2 gap-12 md:gap-24 items-center ${index % 2 === 1 ? 'md:[&>*:first-child]:order-2' : ''}`}>
                <span className="hidden md:block absolute left-1/2 -translate-x-1/2 rail-dot top-1/2" />
                <div>
                  <span className="inline-flex text-[10px] uppercase tracking-[.2em] font-semibold text-purple-200 bg-purple-500/10 border border-purple-400/20 rounded-full px-3 py-1.5 mb-5">{feature.tag}</span>
                  <h2 className="font-serif-display text-4xl md:text-5xl leading-[1.05] mb-5">{feature.title}</h2>
                  <p className="text-gray-400 leading-7 mb-7">{feature.body}</p>
                  <div className="space-y-4">
                    {feature.bullets.map((bullet) => (
                      <div key={bullet.title} className="flex gap-3 border-t border-white/[0.08] pt-4">
                        <span className="text-cyan-400">↗</span>
                        <div><p className="font-semibold text-gray-100 text-sm">{bullet.title}</p><p className="text-sm text-gray-500 mt-1">{bullet.desc}</p></div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="feature-visual glass-panel rounded-3xl h-72 flex items-center justify-center">
                  <div className="visual-orbit"><div className="visual-core">{['6×', 'ƒ(x)', 'AI'][index]}</div></div>
                  <span className="absolute bottom-5 left-6 text-[10px] font-mono uppercase tracking-[.18em] text-gray-600">{['Sequential intelligence', 'Verified calculation', 'Contextual conversation'][index]}</span>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="px-6 pb-28">
          <div className="glass-panel relative overflow-hidden max-w-5xl mx-auto rounded-3xl px-7 md:px-16 py-16 md:py-20 text-center">
            <span className="hero-glow one" aria-hidden="true" />
            <p className="relative text-xs uppercase tracking-[.24em] text-cyan-300 mb-4">Ready when you are</p>
            <h2 className="relative font-serif-display text-4xl md:text-5xl mb-5">Put your next decision to the test.</h2>
            <p className="relative text-gray-400 max-w-xl mx-auto mb-8">Load a real scenario or start with a preset. Your data stays local and every calculated claim stays traceable.</p>
            <button onClick={onGetStarted} className="primary-button relative px-8 py-3.5 font-semibold rounded-xl">Launch GEMMA-6 →</button>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/[0.07] py-9 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row gap-3 items-center justify-between text-xs text-gray-600">
          <span>GEMMA-6 · Local decision intelligence</span><span>Six advisors. Zero invented numbers.</span>
        </div>
      </footer>
    </div>
  );
};
