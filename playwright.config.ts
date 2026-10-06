import { defineConfig, devices } from '@playwright/test'
import { defineBddConfig } from 'playwright-bdd'

const PORT = 4173
const baseURL = `http://localhost:${PORT}`

// Nivel @e2e (spec testing-bdd): la app completa en un navegador real, con la API
// mockeada por MSW en el navegador usando los mismos handlers que el nivel @component.
const testDir = defineBddConfig({
  features: 'tests/e2e/features/**/*.feature',
  steps: 'tests/e2e/steps/**/*.ts',
})

export default defineConfig({
  testDir,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['Pixel 7'] }, grep: /@mobile/ },
  ],
  webServer: {
    command: `npx vite --mode e2e --port ${PORT} --strictPort`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    env: {
      VITE_API_URL: 'http://api.e2e/SrKioscoRemote/GetProducts?KioskID=8',
      VITE_API_TOKEN: 'e2e-token',
    },
  },
})
