import { expect } from '@playwright/test'
import { Given, Then, When } from './fixtures'

const sidebar = (page: import('@playwright/test').Page) =>
  page.getByRole('navigation', { name: 'Navegación principal' })

Given('el usuario está en el catálogo', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('banner')).toBeVisible()
})

When('abre el carrito desde la barra lateral', async ({ page }) => {
  await sidebar(page).getByRole('link', { name: 'Carrito' }).click()
})

Then('el área de contenido muestra el carrito', async ({ page }) => {
  await expect(page).toHaveURL(/\/cart$/)
  await expect(page.getByRole('main')).toBeVisible()
})

Then('la barra superior y la barra lateral siguen visibles', async ({ page }) => {
  await expect(page.getByRole('banner')).toBeVisible()
  await expect(sidebar(page)).toBeVisible()
  await expect(sidebar(page).getByRole('link', { name: 'Carrito' })).toHaveAttribute('aria-current', 'page')
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
