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
    // Off on purpose. Auto-updates would serve the latest Studio at runtime, and this
    // repo pins sanity to the 6.9 line because the @sanity/workflow-* 0.31 packages
    // do not build against @sanity/ui@4 (Studio 6.10+). A deployed Studio has to run
    // the same version the plugin was built for. See AGENTS.md.
    autoUpdates: false,
  },
  typegen: {
    enabled: true,
    path: [
      './schemaTypes/**/*.{ts,tsx}',
      // Explicit app folders, not '../app/**' — that would scan app/node_modules.
      '../app/app/**/*.{ts,tsx}',
      '../app/components/**/*.{ts,tsx}',
      '../app/lib/**/*.{ts,tsx}',
      '../functions/*/index.ts',
    ],
    generates: '../packages/@starter/sanity-types/sanity.types.ts',
  },
})
