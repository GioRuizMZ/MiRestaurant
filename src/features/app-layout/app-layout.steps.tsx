import { describeFeature, loadFeature } from '@amiceli/vitest-cucumber'
import { act, screen, within } from '@testing-library/react'
import { expect } from 'vitest'
import { resetUiStore } from '@/store/uiStore'
import { renderApp } from '@/test/renderApp'
import { resetTestState } from '@/test/resetTestState'
import { setViewportWidth } from '@/test/viewport'

const feature = await loadFeature('./app-layout.feature')

const topBar = () => screen.getByRole('banner')
const sidebarNav = () => screen.queryByRole('navigation', { name: 'Navegación principal' })
const mainArea = () => screen.getByRole('main')

describeFeature(feature, ({ Scenario, BeforeEachScenario, AfterEachScenario }) => {
  let app: ReturnType<typeof renderApp>

  BeforeEachScenario(() => resetTestState())
  AfterEachScenario(() => resetTestState())

  Scenario('Navegar entre pantallas', ({ Given, When, Then, And }) => {
    let topBarBefore: HTMLElement
    let sidebarBefore: HTMLElement | null

    Given('el usuario está en el catálogo', () => {
      app = renderApp('/')
      topBarBefore = topBar()
      sidebarBefore = sidebarNav()
    })
    When('abre el detalle de un producto', async () => {
      await act(() => app.router.navigate('/producto/7'))
    })
    Then('el área de contenido muestra el detalle', () => {
      expect(app.router.state.location.pathname).toBe('/producto/7')
      expect(within(mainArea()).queryByText('Página no encontrada')).not.toBeInTheDocument()
    })
    And('la barra superior y la barra lateral siguen visibles sin volver a montarse', () => {
      expect(topBar()).toBe(topBarBefore)
      expect(sidebarNav()).toBe(sidebarBefore)
      expect(sidebarNav()).toBeVisible()
    })
  })

  Scenario('Acceso al pedido', ({ Given, When, Then }) => {
    let topBarBefore: HTMLElement

    Given('el usuario está en el menú principal', () => {
      app = renderApp('/')
      topBarBefore = topBar()
    })
    When('pulsa el resumen del pedido en la barra superior', async () => {
      await app.user.click(within(topBar()).getByRole('link', { name: /^Ver pedido/ }))
    })
    Then('la aplicación navega a "/pedido" dentro del mismo layout', () => {
      expect(app.router.state.location.pathname).toBe('/pedido')
      expect(topBar()).toBe(topBarBefore)
      expect(within(mainArea()).queryByText('Página no encontrada')).not.toBeInTheDocument()
    })
  })

  Scenario('Volver al inicio', ({ Given, When, Then }) => {
    Given('el usuario está en el pedido', () => {
      app = renderApp('/pedido')
    })
    When('el usuario hace click en el logo', async () => {
      await app.user.click(screen.getByRole('link', { name: 'MiRestaurant, ir al catálogo' }))
    })
    Then('la aplicación navega al catálogo', () => {
      expect(app.router.state.location.pathname).toBe('/')
    })
  })

  Scenario('Ruta activa', ({ When, Then, And }) => {
    When('el usuario está en el menú principal', () => {
      app = renderApp('/')
    })
    Then('el enlace "Menú" de la barra lateral aparece resaltado', () => {
      expect(within(sidebarNav()!).getByRole('link', { name: 'Menú' })).toHaveAttribute('aria-current', 'page')
    })
    And('la barra lateral no tiene un enlace "Pedido"', () => {
      expect(within(sidebarNav()!).queryByRole('link', { name: /pedido/i })).not.toBeInTheDocument()
    })
  })

  Scenario('Colapsar en escritorio', ({ Given, When, Then }) => {
    Given('el viewport mide 1280 px y la barra lateral está expandida', () => {
      setViewportWidth(1280)
      resetUiStore()
      app = renderApp('/')
      expect(sidebarNav()).toBeVisible()
    })
    When('el usuario pulsa el botón de menú', async () => {
      await app.user.click(screen.getByRole('button', { name: 'Menú' }))
    })
    Then('la barra lateral se colapsa y el contenido ocupa el espacio liberado', () => {
      expect(sidebarNav()).not.toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Menú' })).toHaveAttribute('aria-expanded', 'false')
      expect(mainArea()).toBeVisible()
    })
  })

  Scenario('Móvil', ({ Given, When, Then }) => {
    Given('el viewport mide 375 px y el usuario está en el pedido', () => {
      setViewportWidth(375)
      resetUiStore()
      app = renderApp('/pedido')
      expect(sidebarNav()).not.toBeInTheDocument()
    })
    When('el usuario abre el menú y elige "Menú"', async () => {
      await app.user.click(screen.getByRole('button', { name: 'Menú' }))
      await app.user.click(within(sidebarNav()!).getByRole('link', { name: 'Menú' }))
    })
    Then('la aplicación navega al menú principal y el panel lateral se cierra', () => {
      expect(app.router.state.location.pathname).toBe('/')
      expect(sidebarNav()).not.toBeInTheDocument()
    })
  })

  Scenario('Ruta inexistente', ({ When, Then }) => {
    When('el usuario visita "/no-existe"', () => {
      app = renderApp('/no-existe')
    })
    Then('ve la página de "no encontrado" dentro del layout con un enlace al catálogo', () => {
      expect(within(mainArea()).getByText('Página no encontrada')).toBeInTheDocument()
      expect(within(mainArea()).getByRole('link', { name: 'Volver al catálogo' })).toHaveAttribute('href', '/')
      expect(topBar()).toBeInTheDocument()
    })
  })
})
