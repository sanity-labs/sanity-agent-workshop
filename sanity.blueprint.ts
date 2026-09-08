import { defineBlueprint, defineDocumentFunction } from '@sanity/blueprints'
/*
// Load env — jiti (which loads this file) doesn't support process.loadEnvFile,
// so we parse studio/.env manually. import.meta.dirname is synthesized by jiti.
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

try {
  const envFile = resolve(import.meta.dirname ?? process.cwd(), 'studio/.env')
  for (const line of readFileSync(envFile, 'utf8').split('\n')) {
    const match = line.match(/^([^#=]+)=(.*)$/)
    if (match) {
      const value = match[2].trim().replace(/^(['"])(.*)\1$/, '$2')
      process.env[match[1].trim()] ??= value
    }
  }
} catch { }

const { SANITY_STUDIO_PROJECT_ID, SANITY_STUDIO_DATASET } = process.env

if (!SANITY_STUDIO_PROJECT_ID || !SANITY_STUDIO_DATASET) {
  throw new Error(
    'Missing required env vars for blueprint deploy: SANITY_STUDIO_PROJECT_ID and SANITY_STUDIO_DATASET must be set in studio/.env',
  )
}
*/

/**
 * Track 2's plumbing. One Function, deployed by bootstrap, stubbed in
 * functions/draft-menu-copy/index.ts.
 */
export default defineBlueprint({
  resources: [
    defineDocumentFunction({
      name: 'draft-menu-copy',
      event: {
        on: ['create', 'update'],
        // Recursion guard, in place from day one: Mission 2-2 writes
        // description.base, which emits another update event. Once the field
        // exists this filter stops matching, so the Function cannot loop on
        // its own patch. In Mission 2-1 (log only) it simply means each item
        // fires until someone drafts its copy.
        filter: '_type == "menuItem" && !defined(description.base)',
        projection: '{_id, _type, title, recipe}',
      },
    }),
  ],
})
