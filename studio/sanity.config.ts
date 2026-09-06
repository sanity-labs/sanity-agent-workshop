import {visionTool} from '@sanity/vision'
import {workflowDefaultDocumentNode, workflowStudioPlugin} from '@sanity/workflow-studio-plugin'
import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'

import {schemaTypes} from './schemaTypes'
import {structure} from './structure'

/**
 * Four things co-exist in this file, and it ships complete — nothing here is a
 * mission:
 *
 *  1. The schema (10 document types on a shared required-field contract).
 *  2. A desk structure that groups them so the Studio reads as a restaurant,
 *     not as ten flat lists.
 *  3. Vision, for running GROQ by hand while you build.
 *  4. The Workflows Studio plugin, already registered. Track 2's last mission
 *     deploys a *definition* named `menu-item-review`; you do not wire the
 *     plugin yourself. Until that definition exists the Workflows tab is
 *     simply empty — the plugin drops an unmatched mapping with a
 *     console.warn, never a crash. That is the same seam as the stubbed
 *     agent route in app/.
 */
export default defineConfig({
  name: 'default',
  title: 'Green & Gather',

  projectId: process.env.SANITY_STUDIO_PROJECT_ID!,
  dataset: process.env.SANITY_STUDIO_DATASET || 'production',

  schema: {types: schemaTypes},

  plugins: [
    structureTool({
      structure,
      // Adds the "Workflows" tab beside the document editor. `structureTool`
      // needs BOTH `structure` and `defaultDocumentNode` — pass one and you
      // silently lose the other.
      defaultDocumentNode: workflowDefaultDocumentNode(),
    }),
    workflowStudioPlugin({
      // Must match the tag passed to `sanity-workflows deploy --tag <tag>`.
      // A mismatch shows no definitions and the Workflows tab looks broken.
      tag: 'production',
      mappings: [
        {
          docType: 'menuItem',
          definition: 'menu-item-review',
          label: 'Menu item review',
          // A new dish is born under review instead of waiting for a Start click.
          autoStart: true,
        },
      ],
    }),
    visionTool(),
  ],
})
