import { describeFeature, loadFeature } from '@amiceli/vitest-cucumber'
import { screen, within } from '@testing-library/react'
import { expect } from 'vitest'
import { scenarioHandlers } from '@/mocks/handlers'
import { products } from '@/mocks/data/products'
import { server } from '@/mocks/server'
import { useCartStore } from '@/store/cartStore'
import { renderApp } from '@/test/renderApp'
import { resetTestState } from '@/test/resetTestState'
import type { Product } from '@/types/product'

const feature = await loadFeature('./product-catalog.feature')

function productsNamed(...names: string[]): Product[] {
  return names.map((name, index) => ({
    id: 100 + index,
    sku: `SKU-${index}`,
    name,
    description: '',
    price: 10 + index,
  }))
}

const productList = () => screen.findByRole('list', { name: 'Productos' })

async function cardNames(): Promise<string[]> {
  const items = within(await productList()).getAllByRole('listitem')
  return items.map((item) => within(item).getByRole('heading').textContent ?? '')
}

async function cardOf(name: string): Promise<HTMLElement> {
  const items = within(await productList()).getAllByRole('listitem')
  const card = items.find((item) => within(item).queryByRole('link', { name }))
  if (!card) throw new Error(`No hay tarjeta para "${name}"`)
  return card
}

describeFeature(feature, ({ Scenario, BeforeEachScenario, AfterEachScenario }) => {
  let app: ReturnType<typeof renderApp>

  BeforeEachScenario(() => resetTestState())
  AfterEachScenario(() => resetTestState())

  Scenario('Menú con productos', ({ Given, When, Then }) => {
    Given('la API devuelve 3 productos', () => {
      server.use(scenarioHandlers.productsList(products.slice(0, 3)))
    })
    When('el usuario abre la pantalla principal', () => {
      app = renderApp('/')
    })
    Then('ve el título "Menú principal" y 3 tarjetas, cada una con imagen, nombre y precio', async () => {
      expect(screen.getByRole('heading', { level: 1, name: 'Menú principal' })).toBeInTheDocument()
      const items = within(await productList()).getAllByRole('listitem')
      expect(items).toHaveLength(3)
      for (const item of items) {
        expect(within(item).getByRole('img')).toBeInTheDocument()
        expect(within(item).getByRole('heading')).not.toBeEmptyDOMElement()
        expect(within(item).getByText(/^\$\d+\.\d{2}$/)).toBeInTheDocument()
      }
    })
  })

  Scenario('Orden A a Z', ({ Given, When, Then }) => {
    Given('la API devuelve "Hot dog", "Hamburguesa", "Ensalada", "Coca-Cola" y "Café americano" en ese orden', () => {
      server.use(
        scenarioHandlers.productsList(productsNamed('Hot dog', 'Hamburguesa', 'Ensalada', 'Coca-Cola', 'Café americano')),
      )
    })
    When('el usuario abre la pantalla principal', () => {
      app = renderApp('/')
    })
    Then('ve las tarjetas en el orden "Café americano", "Coca-Cola", "Ensalada", "Hamburguesa", "Hot dog"', async () => {
      expect(await cardNames()).toEqual(['Café americano', 'Coca-Cola', 'Ensalada', 'Hamburguesa', 'Hot dog'])
    })
  })

  Scenario('Orden sin distinguir mayúsculas ni tildes', ({ Given, When, Then }) => {
    Given('la API devuelve "Ñoquis", "agua mineral", "Éclair" y "Burrito"', () => {
      server.use(scenarioHandlers.productsList(productsNamed('Ñoquis', 'agua mineral', 'Éclair', 'Burrito')))
    })
    When('el usuario abre la pantalla principal', () => {
      app = renderApp('/')
    })
    Then('ve las tarjetas en el orden "agua mineral", "Burrito", "Éclair", "Ñoquis"', async () => {
      expect(await cardNames()).toEqual(['agua mineral', 'Burrito', 'Éclair', 'Ñoquis'])
    })
  })

  Scenario('Placeholder con inicial', ({ Given, When, Then, And }) => {
    let card: HTMLElement

    Given('la API devuelve el producto "Hamburguesa" sin imagen', () => {
      server.use(scenarioHandlers.productsList([products[0]]))
    })
    When('el usuario ve su tarjeta', async () => {
      app = renderApp('/')
      card = await cardOf('Hamburguesa')
    })
    Then('el área de imagen muestra la letra "H" sobre un fondo neutro', () => {
      const image = within(card).getByRole('img')
      expect(image.tagName).not.toBe('IMG')
      expect(image).toHaveTextContent(/^H$/)
      expect(image.className).toContain('bg-primary-50')
    })
    And('el área de imagen tiene el texto alternativo "Hamburguesa"', () => {
      expect(within(card).getByRole('img', { name: 'Hamburguesa' })).toBeInTheDocument()
    })
  })

  Scenario('Carga inicial', ({ When, Then }) => {
    When('el usuario abre la pantalla principal y la API todavía no responde', () => {
      server.use(scenarioHandlers.productsPending())
      app = renderApp('/')
    })
    Then('ve tarjetas skeleton en lugar de productos', () => {
      expect(screen.getByRole('status', { name: 'Cargando productos' })).toBeInTheDocument()
      expect(screen.getAllByTestId('product-skeleton').length).toBeGreaterThan(0)
      expect(screen.queryByRole('list', { name: 'Productos' })).not.toBeInTheDocument()
    })
  })

  Scenario('API caída', ({ Given, When, Then }) => {
    Given('la API responde con error 500', () => {
      server.use(scenarioHandlers.productsError(500))
    })
    When('el usuario abre la pantalla principal', () => {
      app = renderApp('/')
    })
    Then('ve el mensaje "No pudimos cargar los productos" y el botón "Reintentar"', async () => {
      const alert = await screen.findByRole('alert')
      expect(alert).toHaveTextContent('No pudimos cargar los productos')
      expect(within(alert).getByRole('button', { name: 'Reintentar' })).toBeInTheDocument()
    })
  })

  Scenario('Reintentar tras el error', ({ Given, When, Then }) => {
    Given('se muestra el error de carga y la API ya responde correctamente', async () => {
      server.use(scenarioHandlers.productsError(500))
      app = renderApp('/')
      await screen.findByRole('alert')
      server.resetHandlers()
    })
    When('el usuario pulsa "Reintentar"', async () => {
      await app.user.click(screen.getByRole('button', { name: 'Reintentar' }))
    })
    Then('ve las tarjetas de los productos', async () => {
      expect(within(await productList()).getAllByRole('listitem')).toHaveLength(products.length)
      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    })
  })

  Scenario('Sin productos', ({ Given, When, Then }) => {
    Given('la API devuelve una lista vacía', () => {
      server.use(scenarioHandlers.productsList([]))
    })
    When('el usuario abre la pantalla principal', () => {
      app = renderApp('/')
    })
    Then('ve el mensaje "No hay productos disponibles"', async () => {
      expect(await screen.findByText('No hay productos disponibles')).toBeInTheDocument()
    })
  })

  Scenario('Abrir detalle', ({ When, Then }) => {
    When('el usuario hace click en la tarjeta de "Hamburguesa" (id 7)', async () => {
      app = renderApp('/')
      const card = await cardOf('Hamburguesa')
      await app.user.click(within(card).getByRole('link', { name: 'Hamburguesa' }))
    })
    Then('la aplicación navega a "/products/7"', () => {
      expect(app.router.state.location.pathname).toBe('/products/7')
    })
  })

  Scenario('Agregar desde la tarjeta', ({ Given, When, Then, And }) => {
    Given('el carrito está vacío', () => {
      expect(useCartStore.getState().items).toEqual([])
      app = renderApp('/')
    })
    When('el usuario pulsa "Agregar" en la tarjeta de "Hamburguesa"', async () => {
      const card = await cardOf('Hamburguesa')
      await app.user.click(within(card).getByRole('button', { name: /agregar/i }))
    })
    Then('el carrito tiene 1 unidad de "Hamburguesa" y el indicador de la barra superior muestra "1"', () => {
      expect(useCartStore.getState().items).toEqual([
        { id: 7, sku: 'PLT-007', name: 'Hamburguesa', price: 12.5, quantity: 1 },
      ])
      expect(screen.getByTestId('cart-count')).toHaveTextContent('1')
    })
    And('el usuario sigue en la pantalla principal', () => {
      expect(app.router.state.location.pathname).toBe('/')
    })
  })
})
