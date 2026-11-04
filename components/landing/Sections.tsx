import Link from "next/link";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { BrandMark, Icon } from "@/components/ui/Icon";
import { CMP, FEATURED_PROJECTS } from "@/lib/landing-data";
import { AuthorshipCard } from "./Authorship";
import { HeroMock } from "./HeroMock";
import { LegalLink, TeamsContactButton } from "./LegalLinks";
import { RoadmapMap } from "./RoadmapMap";

export function Hero() {
  return (
    <section className="hero">
      <div className="wrap">
        <div className="hero-copy">
          <div className="hero-pill" style={{ animation: "fadeUp .8s var(--ease-out) both" }}>
            <b>Beta</b>Learn and code in the same window
          </div>
          <h1>
            <span className="ln">
              <span>Stop watching tutorials.</span>
            </span>
            <span className="ln">
              <span>Start building real software.</span>
            </span>
          </h1>
          <p className="hero-sub">
            Your personal AI development environment. Learn programming, build real applications, and become an independent developer.
          </p>
          <div className="hero-ctas">
            <Link className="btn btn-primary btn-lg" href="/register">
              Start learning
            </Link>
            <a className="btn btn-lg" href="#how">
              Explore how it works
            </a>
          </div>
          <div className="trust">
            <span><Icon name="check" />Real IDE in your browser</span>
            <span><Icon name="check" />Hints, not answers</span>
            <span><Icon name="check" />Free plan, no card</span>
          </div>
        </div>
        <HeroMock />
        <div className="strip">
          <div>
            <small>You bring</small>
            <p>Your current level, a daily time budget and, if you have one, an app idea.</p>
          </div>
          <div>
            <small>You build</small>
            <p>Real projects in a browser IDE, with a mentor that reads your code and hints in steps.</p>
          </div>
          <div>
            <small>You keep</small>
            <p>Verified skills, a portfolio of working apps and the habit of finishing on your own.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Intro() {
  return (
    <section className="section">
      <div className="wrap">
        <div className="section-head">
          <h2>Learning and coding happen in the same place.</h2>
          <p>
            Most courses end where real work starts: an empty editor and no one to ask. Codetta puts the editor, the terminal, your project plan and a
            mentor that reads your code side by side.
          </p>
        </div>
        <div className="cols-3">
          <div className="intro-col">
            <div className="intro-ico"><Icon name="code" /></div>
            <h3>Write real code</h3>
            <p>A browser IDE with files, tabs, a terminal and a live preview. The projects use the same tools you would use at a job.</p>
          </div>
          <div className="intro-col">
            <div className="intro-ico ai"><Icon name="sparkles" /></div>
            <h3>Get unstuck without copying</h3>
            <p>The mentor sees your current file and task. It gives hints in steps, so you still write the solution yourself.</p>
          </div>
          <div className="intro-col">
            <div className="intro-ico"><Icon name="award" /></div>
            <h3>Prove what you know</h3>
            <p>Skills count only after you demonstrate them in code. Your roadmap updates from what you can actually do.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export function IdeSection() {
  return (
    <section className="section" id="ide">
      <div className="wrap split">
        <div>
          <div className="section-head" style={{ marginBottom: 0 }}>
            <h2>An IDE, not a code box.</h2>
            <p>Everything you need to build a React app runs in the browser. Open the workspace and keep going where you left off.</p>
          </div>
          <div className="feat-list">
            <div className="feat"><Icon name="code" /><div><b>Editor with TypeScript support</b><span>Syntax highlighting, autocomplete, multiple tabs and formatting.</span></div></div>
            <div className="feat"><Icon name="terminal" /><div><b>A terminal that runs npm scripts</b><span>Install, run the dev server, build and test.</span></div></div>
            <div className="feat"><Icon name="eye" /><div><b>Live preview</b><span>See your app next to your code, updated on every save.</span></div></div>
            <div className="feat"><Icon name="alert" /><div><b>Problems panel</b><span>Errors and lint warnings with a jump to the exact line.</span></div></div>
          </div>
        </div>
        <div className="mock">
          <div className="mock-bar">
            <div className="mock-lights"><i /><i /><i /></div>
            <span style={{ marginLeft: 8 }}>Terminal</span>
            <span style={{ marginLeft: "auto" }} className="dim">zsh</span>
          </div>
          <div className="terminal" style={{ fontSize: 12.5, lineHeight: "21px", padding: "18px 20px" }}>
            <div><span className="tp-path">~/expense-tracker</span> <span className="tp-branch">(main)</span> <span className="tp-sign">$</span> npm test</div>
            <div className="tc-dim">&gt; expense-tracker@1.0.0 test</div>
            <div className="tc-dim">&gt; vitest run</div>
            <br />
            <div> <span className="tc-bg-ok">PASS</span> src/utils/calculateTotals.test.js</div>
            <div>{"   "}<span className="tc-ok">✓</span> sums income <span className="tc-dim">2ms</span></div>
            <div>{"   "}<span className="tc-ok">✓</span> sums expenses <span className="tc-dim">1ms</span></div>
            <div>{"   "}<span className="tc-ok">✓</span> calculates balance <span className="tc-dim">1ms</span></div>
            <div>{"   "}<span className="tc-ok">✓</span> handles an empty list <span className="tc-dim">0ms</span></div>
            <br />
            <div> <span className="tc-b">Tests</span>  <span className="tc-ok">4 passed</span> (4)</div>
            <div> <span className="tc-dim">Duration</span>  412ms</div>
            <br />
            <div><span className="tp-path">~/expense-tracker</span> <span className="tp-branch">(main)</span> <span className="tp-sign">$</span> <span className="caret" /></div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function MentorSection() {
  return (
    <section className="section" id="mentor-sec">
      <div className="wrap split rev">
        <div className="card" style={{ padding: "4px 0", background: "var(--ide-panel)", overflow: "hidden" }}>
          <div className="mentor-modes" style={{ borderBottom: "1px solid var(--line)" }}>
            <span className="mode-btn"><Icon name="book" />Explain</span>
            <span className="mode-btn on"><Icon name="bulb" />Help me</span>
            <span className="mode-btn"><Icon name="listChecks" />Code Review</span>
            <span className="mode-btn"><Icon name="target" />Challenge me</span>
            <span className="mode-btn"><Icon name="message" />Ask anything</span>
          </div>
          <div className="mentor-msgs" style={{ maxHeight: "none" }}>
            <div className="msg msg-user">Why is my component re-rendering?</div>
            <div className="msg msg-ai">
              <div className="msg-ai-head">
                <span className="ai-orb"><Icon name="sparkles" /></span>
                Mentor<span className="mode-tag">App.jsx, line 9</span>
              </div>
              <div className="msg-body">
                <p>Your component re-renders because its state changes. Let&apos;s inspect the state updates in your current component.</p>
                <CodeBlock
                  code={`const [transactions, setTransactions] = useState(initialTransactions);\n\nfunction addTransaction(transaction) {\n  setTransactions((prev) => [transaction, ...prev]);\n}`}
                  head="src/App.jsx  9–13"
                />
                <p>
                  Every call to <code>setTransactions</code> creates a new array, so React renders <code>App</code> again. That is expected. Want a
                  hint on how to check whether a render is actually a problem?
                </p>
              </div>
              <div className="msg-acts">
                <span className="btn btn-ai btn-sm">Hint 1</span>
                <span className="btn btn-sm">Show me in my code</span>
              </div>
            </div>
          </div>
        </div>
        <div>
          <div className="section-head" style={{ marginBottom: 0 }}>
            <h2>A mentor that knows which file you&apos;re in.</h2>
            <p>It knows your roadmap, your current task, the mistakes you made last week and the line your cursor is on.</p>
          </div>
          <div className="feat-list">
            <div className="feat ai"><Icon name="bulb" /><div><b>Hints in steps</b><span>Hint 1, hint 2, detailed guidance, then the full explanation only if you ask.</span></div></div>
            <div className="feat ai"><Icon name="listChecks" /><div><b>Code review on every task</b><span>Correctness, readability and the habits that matter in a team.</span></div></div>
            <div className="feat ai"><Icon name="target" /><div><b>Challenges that check understanding</b><span>Short exercises generated from what you just built.</span></div></div>
            <div className="feat ai"><Icon name="wand" /><div><b>Build mode when you need speed</b><span>Let an AI agent write the boring parts. Its code is marked, so your skills stay honest.</span></div></div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function AuthorshipSection() {
  return (
    <section className="section" id="authorship">
      <div className="wrap auth-wrap">
        <div>
          <div className="section-head" style={{ marginBottom: 0 }}>
            <h2>Know exactly what you wrote.</h2>
            <p>Every change is tracked as you work. At the end of each project you get an authorship report, and skills count only from code you wrote yourself.</p>
          </div>
          <div className="auth-legend">
            <div><i className="c-you" /><div><b>Written by you</b><span>Code you typed. This is what proves a skill.</span></div></div>
            <div><i className="c-hint" /><div><b>Written after a hint</b><span>Still yours, and still counts. Asking for help is part of learning.</span></div></div>
            <div><i className="c-edit" /><div><b>AI-written, edited by you</b><span>AI code you changed in a meaningful way.</span></div></div>
            <div><i className="c-ai" /><div><b>AI-written</b><span>From Build mode, inserted or pasted from the mentor, even if retyped.</span></div></div>
          </div>
          <p className="auth-note" style={{ marginTop: 20 }}>
            <Icon name="info" />
            Formatting, imports, config files and project scaffolding are left out, so the report reflects real logic.
          </p>
        </div>
        <AuthorshipCard />
      </div>
    </section>
  );
}

export function RoadmapSection() {
  return (
    <section className="section" id="roadmap-sec">
      <div className="wrap">
        <div className="section-head">
          <h2>A roadmap you can explore.</h2>
          <p>
            Skip what you already know. Every module shows what it covers, what it depends on and which project proves it. Try it: hover a module,
            then click it.
          </p>
        </div>
        <RoadmapMap inline />
      </div>
    </section>
  );
}

export function Compare() {
  return (
    <section className="section" id="compare">
      <div className="wrap">
        <div className="section-head center">
          <h2>Why not just courses and a chatbot?</h2>
          <p>Videos explain. Chatbots answer. Neither one watches you build, and building is the part that makes you a developer.</p>
        </div>
        <div className="cmp" role="table" aria-label="Comparison with video courses and chatbots">
          <div className="cmp-row cmp-head" role="row">
            <div role="columnheader" />
            <div role="columnheader">Video courses</div>
            <div role="columnheader">Chatbot</div>
            <div role="columnheader"><BrandMark />Codetta</div>
          </div>
          {CMP.map(([a, b, c, d]) => (
            <div key={a} className="cmp-row" role="row">
              <div role="cell">{a}</div>
              <div role="cell">{b}</div>
              <div role="cell">{c}</div>
              <div role="cell"><Icon name="check" />{d}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Audience() {
  return (
    <section className="section">
      <div className="wrap">
        <div className="section-head">
          <h2>For people who are done watching.</h2>
          <p>If you can follow a tutorial but freeze in front of an empty editor, this is built for you.</p>
        </div>
        <div className="aud">
          <div className="card"><div className="intro-ico"><Icon name="reset" /></div><h3>Stuck in tutorial hell</h3><p>You finished three courses and still can&apos;t start a project alone. Here every lesson ends in code you write.</p></div>
          <div className="card"><div className="intro-ico"><Icon name="briefcase" /></div><h3>Career switchers</h3><p>You need a portfolio that proves you can build, not a list of certificates. Every project here is real and reviewed.</p></div>
          <div className="card"><div className="intro-ico ai"><Icon name="book" /></div><h3>Students and self-taught</h3><p>You know the syntax. You want someone to check your code and tell you what a senior would change.</p></div>
          <div className="card"><div className="intro-ico"><Icon name="zap" /></div><h3>Founders with an idea</h3><p>Describe your app. We scope it to your level and turn it into milestones you can actually ship.</p></div>
        </div>
      </div>
    </section>
  );
}

export function Projects() {
  return (
    <section className="section" id="projects-sec">
      <div className="wrap">
        <div className="section-head">
          <h2>Projects you would put on a CV.</h2>
          <p>Start from the library or describe your own idea. Ambitious ideas get scoped to your level, not rejected.</p>
        </div>
        <div className="proj-rows">
          {FEATURED_PROJECTS.map((p) => (
            <div key={p.id} className="proj-row">
              <div>
                <b>{p.name}</b>
                <div className="muted">{p.desc}</div>
              </div>
              <div className="tags">
                {p.tech.slice(0, 3).map((t) => (
                  <span key={t} className="tech">{t}</span>
                ))}
              </div>
              <div className="muted">Builds: {p.skills.join(", ")}</div>
              <div className="dim">{p.effort}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FinalCta() {
  return (
    <section className="final-cta">
      <div className="wrap">
        <h2>Your next project is waiting in the editor.</h2>
        <p>Take the assessment and get a roadmap in about ten minutes.</p>
        <div className="hero-ctas" style={{ animation: "none" }}>
          <Link className="btn btn-primary btn-lg" href="/register">Start learning</Link>
          <Link className="btn btn-lg btn-ghost" href="/login">I already have an account</Link>
        </div>
        <div className="trust" style={{ animation: "none" }}>
          <span><Icon name="check" />Free plan, no card</span>
          <span><Icon name="check" />Cancel Pro anytime</span>
          <span><Icon name="check" />Your code stays yours</span>
        </div>
      </div>
    </section>
  );
}

export function SiteFooter() {
  return (
    <footer className="footer">
      <div className="wrap">
        <div className="footer-grid">
          <div>
            <Link href="/" className="brand" style={{ color: "var(--text)" }}>
              <BrandMark />
              Codetta
            </Link>
            <p style={{ marginTop: 12, maxWidth: 280 }}>Learn by building. Build real software. Become an independent developer.</p>
          </div>
          <div>
            <h5>Product</h5>
            <a href="#ide">Browser IDE</a>
            <a href="#mentor-sec">AI Mentor</a>
            <a href="#roadmap-sec">Roadmaps</a>
            <a href="#pricing">Pricing</a>
          </div>
          <div>
            <h5>Coming in V0.2</h5>
            <span className="footer-soon">GitHub sync</span>
            <span className="footer-soon">Local VS Code development</span>
            <span className="footer-soon">Repository analysis</span>
          </div>
          <div>
            <h5>Company</h5>
            <a href="#faq">FAQ</a>
            <TeamsContactButton className="footer-btn">Teams</TeamsContactButton>
            <LegalLink kind="Terms" />
            <LegalLink kind="Privacy" />
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 Codetta. All rights reserved.</span>
          <span className="links">
            <LegalLink kind="Terms" />
            <LegalLink kind="Privacy" />
            <LegalLink kind="Cookies" />
          </span>
        </div>
      </div>
    </footer>
  );
}
