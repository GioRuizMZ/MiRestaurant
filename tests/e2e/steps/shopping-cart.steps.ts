import { expect } from '@playwright/test'
import { When } from './fixtures'

When(
  'pulsa "Agregar" en las tarjetas de {string}, {string} y {string}',
  async ({ page }, first: string, second: string, third: string) => {
    const names = [first, second, third]
    for (const name of names) {
      await page.getByRole('button', { name: `Agregar ${name}`, exact: true }).click()
    }
    await expect(page.getByRole('banner').getByTestId('order-count')).toHaveText(`${names.length} productos`)
  },
)
