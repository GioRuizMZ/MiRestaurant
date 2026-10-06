import { expect } from '@playwright/test'
import { Given, Then, When } from './fixtures'

Given('el usuario abre el detalle en {string}', async ({ page }, path: string) => {
  await page.goto(path)
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
})

Then(
  've el detalle de {string} con la imagen cargada, el precio {string} y el SKU {string}',
  async ({ page }, name: string, price: string, sku: string) => {
    const detail = page.getByRole('article', { name })
    await expect(detail.getByRole('heading', { level: 1, name })).toBeVisible()
    await expect(detail.getByText(price, { exact: true })).toBeVisible()
    await expect(detail.getByText(sku, { exact: true })).toBeVisible()

    // La imagen tiene que haberse descargado y decodificado, no solo existir en el DOM.
    const image = detail.getByRole('img', { name })
    await expect(image).toBeVisible()
    await expect
      .poll(() => image.evaluate((element) => element instanceof HTMLImageElement && element.naturalWidth > 0))
      .toBe(true)
  },
)

When('pulsa el botón {string}', async ({ page }, label: string) => {
  await page.getByRole('link', { name: label }).click()
})

When('recarga la página', async ({ page }) => {
  await page.reload()
})

Then('ve el título {string}', async ({ page }, title: string) => {
  await expect(page.getByRole('heading', { level: 1, name: title })).toBeVisible()
})

When('aumenta la cantidad a {int} y pulsa {string}', async ({ page }, target: number, label: string) => {
  for (let current = 1; current < target; current += 1) {
    await page.getByRole('button', { name: 'Aumentar cantidad' }).click()
  }
  await expect(page.getByTestId('quantity-value')).toHaveText(String(target))
  await page.getByRole('button', { name: label }).click()
})

Then('el indicador de la barra superior muestra {string}', async ({ page }, count: string) => {
  await expect(page.getByRole('banner').getByTestId('cart-count')).toHaveText(count)
})

Then('ve el aviso {string} y el contador vuelve a 1', async ({ page }, message: string) => {
  await expect(page.getByRole('status').filter({ hasText: message })).toBeVisible()
  await expect(page.getByTestId('quantity-value')).toHaveText('1')
})
