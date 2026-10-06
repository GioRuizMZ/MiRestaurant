import { expect, type Page } from '@playwright/test'
import { Given, Then, When } from './fixtures'

const sidebar = (page: Page) => page.getByRole('navigation', { name: 'Navegación principal' })
const aside = (page: Page) => page.locator('#app-sidebar')
const menuButton = (page: Page) => page.getByRole('button', { name: 'Menú' })

async function transitionDurationOf(page: Page): Promise<string> {
  return aside(page).evaluate((element) => getComputedStyle(element).transitionDuration)
}

async function asideBox(page: Page) {
  const box = await aside(page).boundingBox()
  if (!box) throw new Error('La barra lateral no tiene caja de layout')
  return box
}

Given('el usuario está en el catálogo', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('banner')).toBeVisible()
})

When('abre el pedido desde la barra superior', async ({ page }) => {
  await page.getByRole('banner').getByRole('link', { name: /^Ver pedido/ }).click()
})

Then('el área de contenido muestra el pedido', async ({ page }) => {
  await expect(page).toHaveURL(/\/pedido$/)
  await expect(page.getByRole('main')).toBeVisible()
})

Then('la barra superior y la barra lateral siguen visibles', async ({ page }) => {
  await expect(page.getByRole('banner')).toBeVisible()
  await expect(sidebar(page)).toBeVisible()
  await expect(sidebar(page).getByRole('link', { name: 'Menú' })).toBeVisible()
})

When('el usuario visita {string}', async ({ page }, path: string) => {
  await page.goto(path)
})

Then('ve la página de "no encontrado" dentro del layout con un enlace al catálogo', async ({ page }) => {
  const main = page.getByRole('main')
  await expect(main.getByText('Página no encontrada')).toBeVisible()
  await expect(main.getByRole('link', { name: 'Volver al catálogo' })).toHaveAttribute('href', '/')
  await expect(page.getByRole('banner')).toBeVisible()
})

Given('el viewport mide 1280 px y la barra lateral está expandida', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 })
  await page.goto('/')
  await expect(sidebar(page)).toBeVisible()
  expect((await asideBox(page)).width).toBeGreaterThan(200)
})

When('el usuario pulsa el botón de menú', async ({ page }) => {
  await menuButton(page).click()
})

Then('la barra lateral se cierra con una transición de 200 ms', async ({ page }) => {
  expect(await transitionDurationOf(page)).toBe('0.2s')
  await expect.poll(async () => (await asideBox(page)).width).toBe(0)
})

Then('al terminar, el enlace "Menú" no recibe el foco con el teclado', async ({ page }) => {
  const link = aside(page).getByRole('link', { name: 'Menú', includeHidden: true })
  const focused = await link.evaluate((element) => {
    ;(element as HTMLElement).focus()
    return document.activeElement === element
  })
  expect(focused).toBe(false)
})

Given('el viewport mide 375 px', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 800 })
  await page.goto('/')
  await expect(menuButton(page)).toBeVisible()
  const box = await asideBox(page)
  expect(box.x + box.width).toBeLessThanOrEqual(0)
})

When('el usuario abre el menú', async ({ page }) => {
  await menuButton(page).click()
})

Then(
  'el panel lateral entra deslizándose desde la izquierda con una transición de 200 ms',
  async ({ page }) => {
    expect(await transitionDurationOf(page)).toBe('0.2s')
    await expect.poll(async () => (await asideBox(page)).x).toBe(0)
    await expect(sidebar(page).getByRole('link', { name: 'Menú' })).toBeVisible()
  },
)
