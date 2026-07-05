import { DunetaButton as Button, DunetaLink as Link } from 'duneta/views/component';
import './duneta-home.css';

const stack = [
  {
    num: '01',
    title: 'React',
    desc: 'Full-stack React with React Router 8 — SSR, file-based routes, and UI components in app/pages.',
    path: 'app/pages',
  },
  {
    num: '02',
    title: 'Hono',
    desc: 'Type-safe API layer with Hono — services, auth, and route groups under /api.',
    path: 'app/http',
  },
  {
    num: '03',
    title: 'Cloudflare Worker',
    desc: 'Single Worker entry at the edge — routes traffic between React SSR and the Hono API.',
    path: 'worker.ts',
  },
] as const;

export function DunetaHome() {
  return (
    <main className="home">
      <div className="home-inner">
        <header className="home-header">
          <Link href="/" className="home-logo !text-zinc-900 hover:!text-zinc-900">
            <span className="home-logo-mark">D</span>
            Duneta
          </Link>
          <nav className="home-nav" aria-label="Navigation">
            <Link href="/about" className="!text-zinc-500 hover:!text-zinc-900">
              About
            </Link>
            <Link href="/datatable" className="!text-zinc-500 hover:!text-zinc-900">
              Demo
            </Link>
            <a
              href="https://github.com/BarryHoa/Duneta"
              target="_blank"
              rel="noopener noreferrer"
              className="!text-zinc-500 hover:!text-zinc-900"
            >
              GitHub
            </a>
          </nav>
        </header>

        <section className="home-hero">
          <div>
            <p className="home-eyebrow">Cloudflare Workers</p>
            <h1 className="home-title">
              Full-stack React.
              <br />
              Hono API. One Worker.
            </h1>
            <p className="home-lead">
              Duneta pairs server-rendered React with a Hono API — both deployed on Cloudflare Workers. No Node
              server, no split deployments. One runtime at the edge for your UI and <code>/api</code>.
            </p>
            <div className="home-actions">
              <Button variant="primary" onPress={() => (window.location.href = '/datatable')}>
                View demo
              </Button>
              <Button
                variant="secondary"
                onPress={() => window.open('https://github.com/BarryHoa/Duneta', '_blank', 'noopener,noreferrer')}
              >
                GitHub
              </Button>
            </div>
            <ul className="home-tags">
              <li>React</li>
              <li>Hono</li>
              <li>Cloudflare Workers</li>
              <li>TypeScript</li>
            </ul>
          </div>

          <div className="home-diagram" aria-label="Request routing architecture">
            <div className="home-diagram-bar">
              <div className="home-diagram-dots" aria-hidden="true">
                <span />
                <span />
                <span />
              </div>
              <span className="home-diagram-file">worker.ts</span>
            </div>
            <div className="home-diagram-body">
              <div className="home-route-grid">
                <div className="home-route-cell">
                  <strong>/api/*</strong>
                  <span>Hono</span>
                </div>
                <div className="home-route-cell">
                  <strong>/assets</strong>
                  <span>Static</span>
                </div>
                <div className="home-route-cell">
                  <strong>/*</strong>
                  <span>React SSR</span>
                </div>
              </div>
              <div className="home-code">
                <div>
                  <span className="c-dim">$ </span>
                  <span className="c-cmd">pnpm install && pnpm deploy</span>
                </div>
                <div className="c-ok">✓ build → wrangler deploy</div>
                <div>
                  <span className="c-dim">$ pnpm dev</span>
                  <span className="c-dim"> # localhost:8787</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="home-section">
          <div className="home-section-head">
            <h2>The stack</h2>
            <p>
              React for the frontend, Hono for the API, Cloudflare Workers for runtime — wired together in{' '}
              <code>worker.ts</code>.
            </p>
          </div>
          <div className="home-grid-3">
            {stack.map(({ num, title, desc, path }) => (
              <article key={title} className="home-grid-cell">
                <span className="home-grid-num">{num}</span>
                <h3>{title}</h3>
                <p>{desc}</p>
                <code>{path}</code>
              </article>
            ))}
          </div>
        </section>

        <section className="home-section">
          <div className="home-section-head">
            <h2>Workflow</h2>
            <p>Two commands cover local development and production deployment.</p>
          </div>
          <div className="home-commands">
            <div className="home-command">
              <p className="home-command-label">Development</p>
              <pre>pnpm dev</pre>
              <p>
                Local development on the Workers runtime with Vite HMR. React and Hono both run behind{' '}
                <code>pnpm dev</code> on port 8787.
              </p>
            </div>
            <div className="home-command">
              <p className="home-command-label">Production</p>
              <pre>pnpm deploy</pre>
              <p>
                Build and deploy React SSR plus the Hono API to Cloudflare Workers — one artifact, one edge
                deployment.
              </p>
            </div>
          </div>
        </section>

        <footer className="home-footer">
          <span>Duneta — Full-stack React &amp; Hono on Cloudflare Workers</span>
          <div className="home-footer-links">
            <Link href="/about" className="!text-zinc-500 hover:!text-zinc-900">
              About
            </Link>
            <Link href="/datatable" className="!text-zinc-500 hover:!text-zinc-900">
              DataTable
            </Link>
            <a
              href="https://github.com/BarryHoa/Duneta"
              target="_blank"
              rel="noopener noreferrer"
              className="!text-zinc-500 hover:!text-zinc-900"
            >
              GitHub
            </a>
          </div>
        </footer>
      </div>
    </main>
  );
}
