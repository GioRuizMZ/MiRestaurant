import { describeFeature, loadFeature } from '@amiceli/vitest-cucumber'
import { screen, waitFor, within } from '@testing-library/react'
import { expect } from 'vitest'
import { SEARCH_DEBOUNCE_MS } from '@/hooks/useProductSearch'
import { products } from '@/mocks/data/products'
import { scenarioHandlers } from '@/mocks/handlers'
import { server } from '@/mocks/server'
import { renderApp } from '@/test/renderApp'
import { resetTestState } from '@/test/resetTestState'

const feature = await loadFeature('./product-search.feature')

const searchBox = () => within(screen.getByRole('banner')).getByRole('textbox', { name: 'Buscar productos' })
const productList = () => screen.findByRole('list', { name: 'Productos' })
const afterDebounce = () => new Promise((resolve) => setTimeout(resolve, SEARCH_DEBOUNCE_MS + 50))

async function cardNames(): Promise<string[]> {
  const items = within(await productList()).getAllByRole('listitem')
  return items.map((item) => within(item).getByRole('heading').textContent ?? '')
}

const threeProducts = () =>
  server.use(scenarioHandlers.productsList(products.filter((p) => ['Hamburguesa', 'Hot dog', 'Ensalada'].includes(p.name))))

describeFeature(feature, ({ Scenario, BeforeEachScenario, AfterEachScenario }) => {
  let app: ReturnType<typeof renderApp>

  BeforeEachScenario(() => resetTestState())
  AfterEachScenario(() => resetTestState())

  async function openMenuAndType(text: string) {
    app = renderApp('/')
    await productList()
    await app.user.type(searchBox(), text)
  }

  Scenario('Búsqueda visible en el pedido', ({ When, Then }) => {
    When('el usuario está en "/pedido"', () => {
      app = renderApp('/pedido')
    })
    Then('ve el campo de búsqueda en la barra superior', () => {
      expect(searchBox()).toHaveAttribute('placeholder', 'Buscar productos...')
    })
  })

  Scenario('Término corto', ({ Given, When, Then }) => {
    Given('el catálogo tiene "Hamburguesa", "Hot dog" y "Ensalada"', () => threeProducts())
    When('el usuario escribe "Ham"', async () => {
      await openMenuAndType('Ham')
      await afterDebounce()
    })
    Then('el catálogo sigue mostrando los 3 productos', async () => {
      expect(await cardNames()).toHaveLength(3)
    })
  })

  Scenario('Término suficiente', ({ Given, When, Then }) => {
    Given('el catálogo tiene "Hamburguesa", "Hot dog" y "Ensalada"', () => threeProducts())
    When('el usuario escribe "Hamb"', async () => {
      await openMenuAndType('Hamb')
    })
    Then('el catálogo muestra solo "Hamburguesa"', async () => {
      await waitFor(async () => expect(await cardNames()).toEqual(['Hamburguesa']))
    })
  })

  Scenario('Borrar hasta el umbral', ({ Given, When, Then }) => {
    Given('el catálogo está filtrado por "Hamb"', async () => {
      await openMenuAndType('Hamb')
      await waitFor(async () => expect(await cardNames()).toEqual(['Hamburguesa']))
    })
    When('el usuario borra hasta dejar "Ham"', async () => {
      await app.user.type(searchBox(), '{Backspace}')
      expect(searchBox()).toHaveValue('Ham')
    })
    Then('el catálogo vuelve a mostrar todos los productos', async () => {
      await waitFor(async () => expect(await cardNames()).toHaveLength(products.length))
    })
  })

  Scenario('Escritura continua', ({ When, Then }) => {
    When('el usuario escribe "Ensa" y deja de escribir', async () => {
      await openMenuAndType('Ensa')
    })
    Then('en menos de 300 ms el catálogo muestra solo "Ensalada"', async () => {
      await waitFor(async () => expect(await cardNames()).toEqual(['Ensalada']), { timeout: 300 })
    })
  })

  Scenario('Sin distinguir tildes ni mayúsculas', ({ Given, When, Then }) => {
    Given('existe el producto "Café americano"', () => {
      expect(products.some((p) => p.name === 'Café americano')).toBe(true)
    })
    When('el usuario escribe "CAFE"', async () => {
      await openMenuAndType('CAFE')
    })
    Then('el catálogo muestra "Café americano"', async () => {
      await waitFor(async () => expect(await cardNames()).toEqual(['Café americano']))
    })
  })

  Scenario('Coincidencia en medio del nombre', ({ Given, When, Then }) => {
    Given('existe el producto "Café americano"', () => {
      expect(products.some((p) => p.name === 'Café americano')).toBe(true)
    })
    When('el usuario escribe "amer"', async () => {
      await openMenuAndType('amer')
    })
    Then('el catálogo muestra "Café americano"', async () => {
      await waitFor(async () => expect(await cardNames()).toEqual(['Café americano']))
    })
  })

  Scenario('Ninguna coincidencia', ({ When, Then, And }) => {
    When('el usuario escribe "pizza" y ningún producto coincide', async () => {
      await openMenuAndType('pizza')
    })
    Then('ve el mensaje de que no hay productos para "pizza"', async () => {
      expect(await screen.findByText('No encontramos productos para "pizza"')).toBeInTheDocument()
      expect(screen.queryByRole('list', { name: 'Productos' })).not.toBeInTheDocument()
    })
    And('ve un botón "Limpiar búsqueda"', () => {
      expect(screen.getByRole('button', { name: 'Limpiar búsqueda' })).toBeInTheDocument()
    })
  })

  Scenario('Limpiar búsqueda', ({ Given, When, Then }) => {
    Given('se muestra el mensaje de sin resultados', async () => {
      await openMenuAndType('pizza')
      await screen.findByText('No encontramos productos para "pizza"')
    })
    When('el usuario pulsa "Limpiar búsqueda"', async () => {
      await app.user.click(screen.getByRole('button', { name: 'Limpiar búsqueda' }))
    })
    Then('el campo queda vacío y el catálogo muestra todos los productos', async () => {
      expect(searchBox()).toHaveValue('')
      await waitFor(async () => expect(await cardNames()).toHaveLength(products.length))
    })
  })

  Scenario('Buscar desde el detalle', ({ Given, When, Then }) => {
    Given('el usuario está en "/producto/7"', async () => {
      app = renderApp('/producto/7')
      await screen.findByRole('heading', { level: 1, name: 'Hamburguesa' })
    })
    When('escribe "Ensa"', async () => {
      await app.user.type(searchBox(), 'Ensa')
    })
    Then('la aplicación navega a "/" y muestra solo "Ensalada"', async () => {
      expect(app.router.state.location.pathname).toBe('/')
      await waitFor(async () => expect(await cardNames()).toEqual(['Ensalada']))
    })
  })
})
