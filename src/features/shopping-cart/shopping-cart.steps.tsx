import { describeFeature, loadFeature } from '@amiceli/vitest-cucumber'
import { act, screen, within } from '@testing-library/react'
import { expect } from 'vitest'
import { products } from '@/mocks/data/products'
import { scenarioHandlers } from '@/mocks/handlers'
import { server } from '@/mocks/server'
import { useCartStore } from '@/store/cartStore'
import { renderApp } from '@/test/renderApp'
import { resetTestState } from '@/test/resetTestState'

const feature = await loadFeature('./shopping-cart.feature')

const byName = (name: string) => products.find((product) => product.name === name)!
const hamburguesa = byName('Hamburguesa')
const ensalada = byName('Ensalada')

const lines = () => useCartStore.getState().items
const seed = (name: string, quantity: number) => useCartStore.getState().addItem(byName(name), quantity)
const seedHamburguesaYEnsalada = () => {
  seed('Hamburguesa', 2)
  seed('Ensalada', 1)
}

function expectHeader(count: string, total: string) {
  const banner = screen.getByRole('banner')
  expect(within(banner).getByTestId('order-count')).toHaveTextContent(count)
  expect(within(banner).getByTestId('order-total')).toHaveTextContent(total)
}

const cardOf = async (name: string) => {
  const list = await screen.findByRole('list', { name: 'Productos' })
  const card = within(list)
    .getAllByRole('listitem')
    .find((item) => within(item).queryByRole('link', { name }))
  if (!card) throw new Error(`No hay tarjeta para "${name}"`)
  return card
}

const orderLine = (name: string) => screen.getByRole('article', { name })

describeFeature(feature, ({ Scenario, BeforeEachScenario, AfterEachScenario }) => {
  let app: ReturnType<typeof renderApp>

  BeforeEachScenario(() => resetTestState())
  AfterEachScenario(() => resetTestState())

  Scenario('Primer producto', ({ Given, When, Then }) => {
    Given('el pedido está vacío', () => {
      expect(lines()).toEqual([])
    })
    When('el usuario agrega 1 "Hamburguesa" desde el menú principal', async () => {
      app = renderApp('/')
      await app.user.click(within(await cardOf('Hamburguesa')).getByRole('button', { name: /agregar/i }))
    })
    Then('el pedido tiene una línea "Hamburguesa" con cantidad 1', () => {
      expect(lines()).toEqual([
        { id: 7, sku: 'PLT-007', name: 'Hamburguesa', image: hamburguesa.image, price: 12.5, quantity: 1 },
      ])
    })
  })

  Scenario('Agregar el mismo producto dos veces', ({ Given, When, Then }) => {
    Given('el pedido tiene 1 "Hamburguesa"', () => {
      seed('Hamburguesa', 1)
    })
    When('el usuario agrega otra vez 1 "Hamburguesa" desde el menú principal', async () => {
      app = renderApp('/')
      await app.user.click(within(await cardOf('Hamburguesa')).getByRole('button', { name: /agregar/i }))
    })
    Then('el pedido tiene una sola línea "Hamburguesa" con cantidad 2', () => {
      expect(lines()).toHaveLength(1)
      expect(lines()[0]).toMatchObject({ name: 'Hamburguesa', quantity: 2 })
    })
  })

  Scenario('Agregar el mismo producto desde el detalle', ({ Given, When, Then }) => {
    Given('el pedido tiene 2 "Hamburguesa"', () => {
      seed('Hamburguesa', 2)
    })
    When('el usuario elige cantidad 3 en el detalle y pulsa "Agregar al pedido"', async () => {
      app = renderApp('/producto/7')
      await screen.findByRole('heading', { level: 1, name: 'Hamburguesa' })
      await app.user.click(screen.getByRole('button', { name: 'Aumentar cantidad' }))
      await app.user.click(screen.getByRole('button', { name: 'Aumentar cantidad' }))
      await app.user.click(screen.getByRole('button', { name: 'Agregar al pedido' }))
    })
    Then('el pedido tiene una sola línea "Hamburguesa" con cantidad 5', () => {
      expect(lines()).toHaveLength(1)
      expect(lines()[0]).toMatchObject({ name: 'Hamburguesa', quantity: 5 })
    })
  })

  Scenario('Resumen en el menú y en el detalle', ({ Given, When, Then }) => {
    let enMenu: [string, string]
    Given('el pedido tiene 2 "Hamburguesa" a $12.50 y 1 "Ensalada" a $8.00', () => {
      seedHamburguesaYEnsalada()
    })
    When('el usuario está en el menú principal y después abre "/producto/7"', async () => {
      app = renderApp('/')
      await cardOf('Hamburguesa')
      const banner = screen.getByRole('banner')
      enMenu = [
        within(banner).getByTestId('order-count').textContent ?? '',
        within(banner).getByTestId('order-total').textContent ?? '',
      ]
      await app.user.click(screen.getByRole('link', { name: 'Hamburguesa' }))
      await screen.findByRole('heading', { level: 1, name: 'Hamburguesa' })
    })
    Then('en las dos pantallas el encabezado muestra "3 productos" y "$33.00"', () => {
      expect(enMenu).toEqual(['3 productos', '$33.00'])
      expect(app.router.state.location.pathname).toBe('/producto/7')
      expectHeader('3 productos', '$33.00')
    })
  })

  Scenario('Pedido vacío en el encabezado', ({ Given, When, Then }) => {
    Given('el pedido está vacío', () => {
      expect(lines()).toEqual([])
    })
    When('el usuario abre el menú principal', () => {
      app = renderApp('/')
    })
    Then('el encabezado muestra "0 productos" y "$0.00"', () => {
      expectHeader('0 productos', '$0.00')
    })
  })

  Scenario('Encabezado actualizado al agregar', ({ Given, When, Then }) => {
    Given('el pedido tiene 2 "Hamburguesa" a $12.50', () => {
      seed('Hamburguesa', 2)
      app = renderApp('/')
      expectHeader('2 productos', '$25.00')
    })
    When('el usuario pulsa "Agregar" en la tarjeta de "Ensalada"', async () => {
      await app.user.click(within(await cardOf('Ensalada')).getByRole('button', { name: /agregar/i }))
    })
    Then('el encabezado muestra "3 productos" y "$33.00" sin recargar la página', () => {
      expectHeader('3 productos', '$33.00')
      expect(app.router.state.location.pathname).toBe('/')
    })
  })

  Scenario('Navegar sin perder el pedido', ({ Given, When, Then }) => {
    Given('el usuario agregó 2 "Hamburguesa" desde "/producto/7"', async () => {
      app = renderApp('/producto/7')
      await screen.findByRole('heading', { level: 1, name: 'Hamburguesa' })
      await app.user.click(screen.getByRole('button', { name: 'Aumentar cantidad' }))
      await app.user.click(screen.getByRole('button', { name: 'Agregar al pedido' }))
    })
    When('vuelve al menú principal y abre el detalle de "Ensalada"', async () => {
      await app.user.click(screen.getByRole('link', { name: 'Volver al menú principal' }))
      await app.user.click(within(await cardOf('Ensalada')).getByRole('link', { name: 'Ensalada' }))
      await screen.findByRole('heading', { level: 1, name: 'Ensalada' })
    })
    Then('el encabezado sigue mostrando "2 productos" y "$25.00"', () => {
      expect(app.router.state.location.pathname).toBe(`/producto/${ensalada.id}`)
      expectHeader('2 productos', '$25.00')
    })
  })

  Scenario('Abrir el pedido desde el encabezado', ({ When, Then }) => {
    When('el usuario pulsa el resumen del pedido en el encabezado', async () => {
      app = renderApp('/')
      await app.user.click(within(screen.getByRole('banner')).getByRole('link', { name: /^Ver pedido/ }))
    })
    Then('la aplicación navega a "/pedido"', () => {
      expect(app.router.state.location.pathname).toBe('/pedido')
      expect(screen.getByRole('heading', { level: 1, name: 'Tu pedido' })).toBeInTheDocument()
    })
  })

  Scenario('Ver el pedido', ({ Given, When, Then, And }) => {
    Given('el pedido tiene 2 "Hamburguesa" a $12.50 y 1 "Ensalada" a $8.00', () => {
      seedHamburguesaYEnsalada()
    })
    When('el usuario abre "/pedido"', () => {
      app = renderApp('/pedido')
    })
    Then('ve el subtotal $25.00 para "Hamburguesa" y $8.00 para "Ensalada"', () => {
      expect(within(orderLine('Hamburguesa')).getByTestId('line-subtotal')).toHaveTextContent('$25.00')
      expect(within(orderLine('Ensalada')).getByTestId('line-subtotal')).toHaveTextContent('$8.00')
    })
    And('ve el total $33.00 y 3 productos', () => {
      expect(screen.getByTestId('summary-total')).toHaveTextContent('$33.00')
      expect(screen.getByTestId('summary-count')).toHaveTextContent('3 productos')
    })
  })

  Scenario('Aumentar cantidad', ({ Given, When, Then }) => {
    Given('la línea "Ensalada" tiene cantidad 1', () => {
      seed('Ensalada', 1)
      app = renderApp('/pedido')
    })
    When('el usuario pulsa aumentar en esa línea', async () => {
      await app.user.click(screen.getByRole('button', { name: 'Aumentar cantidad de Ensalada' }))
    })
    Then('la línea tiene cantidad 2 y los totales se recalculan', () => {
      expect(within(orderLine('Ensalada')).getByTestId('quantity-value')).toHaveTextContent('2')
      expect(screen.getByTestId('summary-total')).toHaveTextContent('$16.00')
      expectHeader('2 productos', '$16.00')
    })
  })

  Scenario('Disminuir desde 1', ({ Given, When, Then }) => {
    Given('la línea "Ensalada" tiene cantidad 1', () => {
      seed('Hamburguesa', 1)
      seed('Ensalada', 1)
      app = renderApp('/pedido')
    })
    When('el usuario pulsa disminuir en esa línea', async () => {
      await app.user.click(screen.getByRole('button', { name: 'Disminuir cantidad de Ensalada' }))
    })
    Then('la línea "Ensalada" desaparece del pedido', () => {
      expect(screen.queryByRole('article', { name: 'Ensalada' })).not.toBeInTheDocument()
      expect(lines().map((line) => line.name)).toEqual(['Hamburguesa'])
    })
  })

  Scenario('Quitar línea', ({ Given, When, Then }) => {
    Given('el pedido tiene 2 "Hamburguesa" a $12.50 y 1 "Ensalada" a $8.00', () => {
      seedHamburguesaYEnsalada()
      app = renderApp('/pedido')
    })
    When('el usuario pulsa "Quitar" en la línea "Hamburguesa"', async () => {
      await app.user.click(screen.getByRole('button', { name: 'Quitar Hamburguesa' }))
    })
    Then('la línea desaparece y los totales se recalculan', () => {
      expect(screen.queryByRole('article', { name: 'Hamburguesa' })).not.toBeInTheDocument()
      expect(screen.getByTestId('summary-total')).toHaveTextContent('$8.00')
      expectHeader('1 producto', '$8.00')
    })
  })

  Scenario('Vaciar pedido', ({ Given, When, Then }) => {
    Given('el pedido tiene productos', () => {
      seedHamburguesaYEnsalada()
      app = renderApp('/pedido')
    })
    When('el usuario pulsa "Vaciar pedido" y confirma', async () => {
      await app.user.click(screen.getByRole('button', { name: 'Vaciar pedido' }))
      await app.user.click(screen.getByRole('button', { name: 'Sí, vaciar' }))
    })
    Then('el pedido queda vacío', () => {
      expect(lines()).toEqual([])
      expect(screen.getByText('Tu pedido está vacío')).toBeInTheDocument()
      expectHeader('0 productos', '$0.00')
    })
  })

  Scenario('Cancelar vaciado', ({ Given, When, Then }) => {
    Given('el pedido tiene productos', () => {
      seedHamburguesaYEnsalada()
      app = renderApp('/pedido')
    })
    When('el usuario pulsa "Vaciar pedido" y cancela', async () => {
      await app.user.click(screen.getByRole('button', { name: 'Vaciar pedido' }))
      await app.user.click(screen.getByRole('button', { name: 'Cancelar' }))
    })
    Then('el pedido conserva todas sus líneas', () => {
      expect(lines()).toHaveLength(2)
      expect(screen.getAllByRole('article')).toHaveLength(2)
    })
  })

  Scenario('Abrir pedido vacío', ({ Given, When, Then }) => {
    Given('el pedido está vacío', () => {
      expect(lines()).toEqual([])
    })
    When('el usuario abre "/pedido"', () => {
      app = renderApp('/pedido')
    })
    Then('ve "Tu pedido está vacío" y un enlace "Ver el menú"', () => {
      expect(screen.getByText('Tu pedido está vacío')).toBeInTheDocument()
      expect(screen.getByRole('link', { name: 'Ver el menú' })).toHaveAttribute('href', '/')
    })
  })

  Scenario('Pedido sin conexión a la API', ({ Given, When, Then }) => {
    Given('el pedido tiene 1 "Hamburguesa" y la API no responde', () => {
      seed('Hamburguesa', 1)
      server.use(scenarioHandlers.networkError())
    })
    When('el usuario abre "/pedido"', () => {
      app = renderApp('/pedido')
    })
    Then('ve la línea "Hamburguesa" con su precio y los totales correctos', async () => {
      await act(() => Promise.resolve())
      const line = orderLine('Hamburguesa')
      expect(within(line).getByTestId('line-subtotal')).toHaveTextContent('$12.50')
      expect(screen.getByTestId('summary-total')).toHaveTextContent('$12.50')
      expectHeader('1 producto', '$12.50')
    })
  })
})
