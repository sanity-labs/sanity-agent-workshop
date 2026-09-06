import config from '@starter/eslint-config'

export default [
  {
    ignores: [
      '**/dist/',
      '**/.sanity/',
      '**/sanity.types.ts',
      '**/.next/',
      '**/next-env.d.ts',
      // Skills are reference material for agents, not code this repo runs. The vendored
      // public skills carry their own eslint.config.mjs, which ESLint 10 would otherwise load.
      'skills/',
      '.claude/',
    ],
  },
  ...config,
]
