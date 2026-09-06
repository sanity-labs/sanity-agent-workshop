import config from '@starter/eslint-config'

export default [
  {
    ignores: [
      '**/dist/',
      '**/.sanity/',
      '**/sanity.types.ts',
      '**/.next/',
      '**/next-env.d.ts',
      '.claude/',
    ],
  },
  ...config,
]
