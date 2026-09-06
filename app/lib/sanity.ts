import 'server-only'

import {createClient} from '@sanity/client'

/**
 * Server-only Sanity client for the menu page.
 *
 * The dataset is private (bootstrap does that), so reads need a token. This
 * one is a project Viewer token and it never reaches the browser — nothing in
 * this file is imported from a client component.
 *
 * This client is for RENDERING the menu. The agent does not use it; the agent
 * reaches content through a Context MCP endpoint (Mission 1-1).
 */
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production'
const token = process.env.SANITY_READ_TOKEN

export const sanityConfigured = Boolean(projectId && token)

export const sanity = sanityConfigured
  ? createClient({
      projectId: projectId!,
      dataset,
      apiVersion: '2025-05-08',
      token,
      useCdn: false,
      perspective: 'published',
    })
  : null
