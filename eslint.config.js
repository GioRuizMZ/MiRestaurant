import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

// Spec component-architecture: los componentes de atomic design son solo de presentación.
// No acceden a la API, a la caché de queries, a los stores ni a los hooks de datos.
const presentationOnlyPaths = [
  { name: 'axios', message: 'Los componentes no hacen peticiones: usa una page o un container.' },
  { name: 'zustand', message: 'Los componentes no leen stores: recibe el dato por props.' },
  { name: '@tanstack/react-query', message: 'Los componentes no usan queries: recibe el dato por props.' },
  {
    name: 'react-router',
    importNames: ['useNavigate', 'useParams', 'useLocation', 'useSearchParams', 'useMatch'],
    message: 'La navegación programática vive en pages o containers.',
  },
]

const presentationOnlyPatterns = [
  {
    regex: '^@/(api|services|store|hooks|layouts|pages|app|config)(/|$)',
    message: 'Los componentes son de presentación: la lógica vive en hooks, pages y containers.',
  },
]

// Cada nivel solo puede componer niveles inferiores.
const higherLevels = {
  atoms: ['molecules', 'organisms', 'templates'],
  molecules: ['organisms', 'templates'],
  organisms: ['templates'],
  templates: [],
}

const componentLevelConfigs = Object.entries(higherLevels).map(([level, forbidden]) => ({
  files: [`src/components/${level}/**/*.{ts,tsx}`],
  rules: {
    'no-restricted-imports': [
      'error',
      {
        paths: presentationOnlyPaths,
        patterns: [
          ...presentationOnlyPatterns,
          ...(forbidden.length > 0
            ? [
                {
                  regex: `(^|/)(${forbidden.join('|')})(/|$)`,
                  message: `Los ${level} no pueden usar componentes de nivel superior (${forbidden.join(', ')}).`,
                },
              ]
            : []),
        ],
      },
    ],
  },
}))

export default defineConfig([
  globalIgnores([
    'dist',
    'coverage',
    'playwright-report',
    'test-results',
    '.features-gen',
    'public/mockServiceWorker.js',
  ]),
  {
    files: ['**/*.{ts,tsx,js}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
    },
  },
  {
    // Spec api-client: solo la capa de servicios usa el cliente HTTP.
    files: ['src/**/*.{ts,tsx}'],
    ignores: ['src/api/**', 'src/services/**', 'src/components/**', 'src/**/*.test.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [{ name: 'axios', message: 'Usa el apiClient a través de un servicio.' }],
          patterns: [{ regex: '^@/api/apiClient$', message: 'Solo los servicios usan el apiClient.' }],
        },
      ],
    },
  },
  ...componentLevelConfigs,
  {
    files: ['src/test/**', 'src/**/*.test.{ts,tsx}', 'src/**/*.steps.{ts,tsx}', 'src/app/**', 'src/mocks/**'],
    rules: { 'react-refresh/only-export-components': 'off' },
  },
  {
    files: ['scripts/**', 'tests/**', '*.config.{ts,js}'],
    languageOptions: { globals: globals.node },
  },
])
