import {defineConfig} from 'rolldown'

// One bundle per function. The blueprint points at `functions/dist/<name>`.
// Add a config block here when you add a function directory.
export default [
  defineConfig({
    input: {index: 'draft-menu-copy/index.ts'},
    output: {
      dir: 'dist/draft-menu-copy',
      cleanDir: true,
      codeSplitting: false,
      minify: true,
      comments: false,
    },
    platform: 'node',
  }),
]
