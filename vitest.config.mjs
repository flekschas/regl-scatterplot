import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    browser: {
      provider: 'playwright',
      enabled: true,
      name: 'chromium',
      headless: true,
      screenshot: 'off',
    },
    coverage: {
      include: ['src'],
      reporter: ['text', 'json-summary', 'json'],
    },
  },
})
