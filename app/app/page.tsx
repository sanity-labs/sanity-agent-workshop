import Link from 'next/link'

export default function HomePage() {
  return (
    <>
      <h1>Green &amp; Gather</h1>
      <p className="lede">
        A fast-casual bowls and wraps chain with 40 locations across NYC, Austin, and Chicago. This
        is the workshop shell: the menu renders from your Sanity dataset, and the concierge is an
        agent you build.
      </p>

      <div className="card-grid">
        <Link href="/menu" className="card" style={{textDecoration: 'none'}}>
          <h3>Menu →</h3>
          <p className="body">
            The 83-document seed, rendered. If this page is empty, run <code>pnpm bootstrap</code>.
          </p>
        </Link>
        <Link href="/chat" className="card" style={{textDecoration: 'none'}}>
          <h3>Ask the concierge →</h3>
          <p className="body">
            The chat UI works. The agent behind it does not — yet. It replies{' '}
            <em>&ldquo;not connected yet&rdquo;</em> until you wire{' '}
            <code>app/api/agent/route.ts</code>.
          </p>
        </Link>
      </div>

      <h2 className="section-title">Setup succeeded when</h2>
      <p className="body">
        You can open the chat, send a message, and get the &ldquo;not connected yet&rdquo; reply.
        That stub is the deliverable of setup. The shell is given; the agent is what you build.
      </p>
    </>
  )
}
