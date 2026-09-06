import type {Metadata} from 'next'
import Link from 'next/link'
import type {ReactNode} from 'react'

import './globals.css'

export const metadata: Metadata = {
  title: 'Green & Gather',
  description: 'Workshop shell: a menu, and an agent you wire up yourself.',
}

export default function RootLayout({children}: {children: ReactNode}) {
  return (
    <html lang="en">
      <body>
        <header className="site-header">
          <Link href="/" className="brand">
            Green &amp; Gather
          </Link>
          <nav>
            <Link href="/menu">Menu</Link>
            <Link href="/chat">Ask the concierge</Link>
          </nav>
        </header>
        <main>{children}</main>
      </body>
    </html>
  )
}
