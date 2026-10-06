import { expect, type Locator, type Page } from '@playwright/test'
import { Given, Then, When } from './fixtures'

const productList = (page: Page) => page.getByRole('list', { name: 'Productos' })

const cardOf = (page: Page, name: string): Locator =>
  productList(page).getByRole('listitem').filter({ has: page.getByRole('link', { name, exact: true }) })

const backgroundOf = (locator: Locator) => locator.evaluate((element) => getComputedStyle(element).backgroundColor)

Given('el usuario está en el menú principal', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1, name: 'Menú principal' })).toBeVisible()
  await expect(productList(page).getByRole('listitem').first()).toBeVisible()
})

Then(
  've las tarjetas en el orden "Café americano", "Coca-Cola", "Ensalada", "Hamburguesa", "Hot dog"',
  async ({ page }) => {
    await expect(productList(page).getByRole('heading')).toHaveText([
      'Café americano',
      'Coca-Cola',
      'Ensalada',
      'Hamburguesa',
      'Hot dog',
    ])
  },
)

When('el usuario hace click sobre la imagen de la tarjeta de {string}', async ({ page }, name: string) => {
  // El enlace estirado cubre la imagen: el click en esa zona debe abrir el detalle.
  const image = cardOf(page, name).getByRole('img', { name })
  const box = await image.boundingBox()
  if (!box) throw new Error('La imagen de la tarjeta no es visible')
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2)
})

Then('la aplicación navega a {string}', async ({ page }, path: string) => {
  await expect(page).toHaveURL(new RegExp(`${path}$`))
})

let backgroundBefore = ''

When(
  'el usuario pasa el puntero sobre el botón "Agregar" de la tarjeta de {string}',
  async ({ page }, name: string) => {
    const button = cardOf(page, name).getByRole('button', { name: /agregar/i })
    backgroundBefore = await backgroundOf(button)
    await button.hover()
  },
)

Then('el color de fondo del botón cambia respecto a su estado normal', async ({ page }) => {
  const button = cardOf(page, 'Hamburguesa').getByRole('button', { name: /agregar/i })
  await expect.poll(() => backgroundOf(button)).not.toBe(backgroundBefore)
})

When('el usuario llega con la tecla Tab a la tarjeta de {string}', async ({ page }, name: string) => {
  const link = cardOf(page, name).getByRole('link', { name, exact: true })
  for (let presses = 0; presses < 40; presses += 1) {
    await page.keyboard.press('Tab')
    if (await link.evaluate((element) => element === document.activeElement)) return
  }
  throw new Error(`No se llegó a la tarjeta de "${name}" con Tab`)
})

Then('la tarjeta muestra un indicador de foco visible', async ({ page }) => {
  const card = cardOf(page, 'Hamburguesa').locator('article')
  await expect.poll(() => card.evaluate((element) => getComputedStyle(element).boxShadow)).not.toBe('none')
})
