import {defineCliConfig} from 'sanity/cli'

// Load studio .env so CLI commands (schema extract, typegen, exec scripts) see
// SANITY_STUDIO_* variables. Vite handles this automatically during `sanity dev`.
try {
  process.loadEnvFile(`${import.meta.dirname}/.env`)
} catch {}

export default defineCliConfig({
  api: {
    projectId: process.env.SANITY_STUDIO_PROJECT_ID!,
    dataset: process.env.SANITY_STUDIO_DATASET!,
  },
  // No `studioHost` and no `appId` on purpose: every attendee has their own
  // project, and fifty people cannot share a hostname. `sanity deploy` will
  // ask you to pick one the first time you run it.
  reactStrictMode: true,
  deployment: {
    autoUpdates: true,
  },
  typegen: {
    enabled: true,
    path: ['./schemaTypes/**/*.{ts,tsx}', '../app/**/*.{ts,tsx}', '../functions/*/index.ts'],
    generates: '../packages/@starter/sanity-types/sanity.types.ts',
  },
})
