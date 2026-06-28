import { CURRICULUM_META } from '../data/meta'

export function EmbedPage() {
  const apiUrl = `${window.location.origin}/api/v1/curriculum.json`
  const embedSnippet = `<iframe src="${window.location.origin}" title="AI Learning Path" width="100%" height="720" style="border:1px solid #333;border-radius:8px"></iframe>`

  return (
    <article className="community-page">
      <header className="page-header">
        <p className="eyebrow">Developers</p>
        <h1>Embed &amp; API</h1>
        <p className="lead">
          Curriculum version <strong>{CURRICULUM_META.label}</strong> (
          {CURRICULUM_META.version})
        </p>
      </header>

      <section>
        <h2>JSON API</h2>
        <p className="section-intro">
          Static curriculum export generated at build time. No authentication required.
        </p>
        <pre className="code-block">
          <code>{apiUrl}</code>
        </pre>
      </section>

      <section>
        <h2>oEmbed / iframe</h2>
        <p className="section-intro">Embed the learning path in internal wikis or LMS pages.</p>
        <pre className="code-block">
          <code>{embedSnippet}</code>
        </pre>
      </section>

      <section>
        <h2>Version pinning (D7)</h2>
        <p className="section-intro">
          Signed-in users store <code>curriculum_version</code> on their profile (
          currently {CURRICULUM_META.version}). Future snapshots can coexist when content is
          versioned in <code>content/meta.json</code>.
        </p>
      </section>
    </article>
  )
}
