import { expect } from '@playwright/test'
import { Then, When } from './fixtures'

When('busca {string} en la barra superior', async ({ page }, term: string) => {
  await page.getByRole('banner').getByRole('textbox', { name: 'Buscar productos' }).fill(term)
})

Then('ve solo la tarjeta de {string}', async ({ page }, name: string) => {
  await expect(page.getByRole('list', { name: 'Productos' }).getByRole('heading')).toHaveText([name])
})

Then('ve el total {string} en el pedido', async ({ page }, total: string) => {
  await expect(page).toHaveURL(/\/pedido$/)
  await expect(page.getByTestId('summary-total')).toHaveText(total)
})
