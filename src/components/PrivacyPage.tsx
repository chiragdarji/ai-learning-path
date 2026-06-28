import { Link } from 'react-router-dom'

export function PrivacyPage() {
  return (
    <article className="privacy-page">
      <header className="page-header">
        <p className="eyebrow">Legal</p>
        <h1>Privacy Policy</h1>
        <p className="lead">Last updated: June 2026</p>
      </header>

      <section>
        <h2>What this site is</h2>
        <p>
          AI Learning Path (vidyanix.ai) is a curated curriculum browser. We link to
          third-party resources and do not host their content.
        </p>
      </section>

      <section>
        <h2>Data we store locally</h2>
        <p>
          Without signing in, progress checkmarks and track preference are stored only
          in your browser via localStorage. We do not receive this data.
        </p>
      </section>

      <section>
        <h2>When you sign in</h2>
        <p>
          If you enable cloud sync (Supabase), we store your account email, completed
          resource IDs, and track preference so progress follows you across devices.
          Authentication is handled by Supabase; see{' '}
          <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer">
            Supabase Privacy Policy
          </a>
          .
        </p>
      </section>

      <section>
        <h2>Analytics</h2>
        <p>
          We may use privacy-friendly analytics (Plausible) to count page views. No
          advertising cookies are used. If enabled, analytics receives page URL and
          referrer only.
        </p>
      </section>

      <section>
        <h2>External links</h2>
        <p>
          Resource cards open publisher sites in a new tab. We are not affiliated with
          linked publishers and do not control their privacy practices.
        </p>
      </section>

      <section>
        <h2>Contact</h2>
        <p>
          Questions: open an issue on{' '}
          <a
            href="https://github.com/chiragdarji/ai-learning-path"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>{' '}
          or email the site owner.
        </p>
      </section>

      <p>
        <Link to="/">← Back to roadmap</Link>
      </p>
    </article>
  )
}
