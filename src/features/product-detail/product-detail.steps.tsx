import { describeFeature, loadFeature } from '@amiceli/vitest-cucumber'
import { screen, within } from '@testing-library/react'
import { expect } from 'vitest'
import { products } from '@/mocks/data/products'
import { scenarioHandlers } from '@/mocks/handlers'
import { server } from '@/mocks/server'
import { useCartStore } from '@/store/cartStore'
import { renderApp } from '@/test/renderApp'
import { resetTestState } from '@/test/resetTestState'

const feature = await loadFeature('./product-detail.feature')

const hamburguesa = products.find((product) => product.id === 7)!
const BACK_LABEL = 'Volver al menú principal'

const productTitle = (name: string) => screen.findByRole('heading', { level: 1, name })
const quantityValue = () => screen.getByTestId('quantity-value')

/** Pulsa "Aumentar cantidad" hasta llegar a `target` (empieza en 1). */
async function increaseQuantityTo(app: ReturnType<typeof renderApp>, target: number) {
  for (let current = 1; current < target; current += 1) {
    await app.user.click(screen.getByRole('button', { name: 'Aumentar cantidad' }))
  }
  expect(quantityValue()).toHaveTextContent(String(target))
}

describeFeature(feature, ({ Scenario, BeforeEachScenario, AfterEachScenario }) => {
  let app: ReturnType<typeof renderApp>

  BeforeEachScenario(() => resetTestState())
  AfterEachScenario(() => resetTestState())

  Scenario('Ver detalle', ({ Given, When, Then }) => {
    Given('existe el producto id 7 "Hamburguesa", SKU "PLT-007", precio 12.50, con imagen y descripción', () => {
      expect(hamburguesa).toMatchObject({ name: 'Hamburguesa', sku: 'PLT-007', price: 12.5 })
      expect(hamburguesa.image).not.toBe('')
      expect(hamburguesa.description).not.toBe('')
    })
    When('el usuario abre "/producto/7"', () => {
      app = renderApp('/producto/7')
    })
    Then(
      've la imagen de "Hamburguesa", el nombre "Hamburguesa", su descripción, el precio "$12.50" y el SKU "PLT-007"',
      async () => {
        await productTitle('Hamburguesa')
        expect(screen.getByRole('img', { name: 'Hamburguesa' })).toHaveAttribute('src', hamburguesa.image)
        expect(screen.getByText(hamburguesa.description)).toBeInTheDocument()
        expect(screen.getByText('$12.50')).toBeInTheDocument()
        expect(screen.getByText('PLT-007')).toBeInTheDocument()
      },
    )
  })

  Scenario('Producto sin imagen', ({ Given, When, Then, And }) => {
    Given('el producto id 7 "Hamburguesa" no tiene imagen', () => {
      server.use(scenarioHandlers.productsList([{ ...hamburguesa, image: '' }]))
    })
    When('el usuario abre "/producto/7"', () => {
      app = renderApp('/producto/7')
    })
    Then('ve un fondo neutro en el lugar de la imagen', async () => {
      await productTitle('Hamburguesa')
      const image = screen.getByRole('img', { name: 'Hamburguesa' })
      expect(image.tagName).toBe('DIV')
      expect(image).toHaveAttribute('data-testid', 'image-fallback')
    })
    And('ve el nombre, la descripción, el precio y el SKU', () => {
      expect(screen.getByRole('heading', { level: 1, name: 'Hamburguesa' })).toBeInTheDocument()
      expect(screen.getByText(hamburguesa.description)).toBeInTheDocument()
      expect(screen.getByText('$12.50')).toBeInTheDocument()
      expect(screen.getByText('PLT-007')).toBeInTheDocument()
    })
  })

  Scenario('Agregar varias unidades', ({ Given, When, Then, And }) => {
    Given('el carrito está vacío y el usuario está en "/producto/7"', async () => {
      expect(useCartStore.getState().items).toEqual([])
      app = renderApp('/producto/7')
      await productTitle('Hamburguesa')
    })
    When('aumenta la cantidad a 3 y pulsa "Agregar al carrito"', async () => {
      await increaseQuantityTo(app, 3)
      await app.user.click(screen.getByRole('button', { name: 'Agregar al carrito' }))
    })
    Then('el carrito tiene 3 unidades de "Hamburguesa" y el indicador de la barra superior muestra "3"', () => {
      expect(useCartStore.getState().items).toEqual([
        { id: 7, sku: 'PLT-007', name: 'Hamburguesa', price: 12.5, quantity: 3 },
      ])
      expect(screen.getByTestId('cart-count')).toHaveTextContent('3')
    })
    And('ve el aviso "Agregado al carrito: 3 × Hamburguesa" y el contador vuelve a 1', () => {
      expect(screen.getByText('Agregado al carrito: 3 × Hamburguesa')).toBeInTheDocument()
      expect(quantityValue()).toHaveTextContent('1')
    })
  })

  Scenario('Sumar a un producto que ya está en el carrito', ({ Given, When, Then }) => {
    Given('el carrito ya tiene 1 unidad de "Hamburguesa" y el usuario está en "/producto/7"', async () => {
      useCartStore.getState().addItem(hamburguesa, 1)
      app = renderApp('/producto/7')
      await productTitle('Hamburguesa')
    })
    When('aumenta la cantidad a 2 y pulsa "Agregar al carrito"', async () => {
      await increaseQuantityTo(app, 2)
      await app.user.click(screen.getByRole('button', { name: 'Agregar al carrito' }))
    })
    Then('el carrito tiene 3 unidades de "Hamburguesa" en una sola línea', () => {
      const items = useCartStore.getState().items
      expect(items).toHaveLength(1)
      expect(items[0]).toMatchObject({ id: 7, quantity: 3 })
    })
  })

  Scenario('Cantidad mínima', ({ Given, When, Then }) => {
    Given('el usuario está en "/producto/7" con la cantidad en 1', async () => {
      app = renderApp('/producto/7')
      await productTitle('Hamburguesa')
      expect(quantityValue()).toHaveTextContent('1')
    })
    When('intenta disminuir la cantidad', async () => {
      await app.user.click(screen.getByRole('button', { name: 'Disminuir cantidad' }))
    })
    Then('la cantidad sigue en 1 y el botón "Disminuir cantidad" está deshabilitado', () => {
      expect(quantityValue()).toHaveTextContent('1')
      expect(screen.getByRole('button', { name: 'Disminuir cantidad' })).toBeDisabled()
    })
  })

  Scenario('Volver al menú principal', ({ Given, When, Then }) => {
    Given('el usuario está en "/producto/7"', async () => {
      app = renderApp('/producto/7')
      await productTitle('Hamburguesa')
    })
    When('pulsa "Volver al menú principal"', async () => {
      await app.user.click(screen.getByRole('link', { name: BACK_LABEL }))
    })
    Then('la aplicación navega a "/" y ve el menú principal', async () => {
      expect(app.router.state.location.pathname).toBe('/')
      expect(await screen.findByRole('heading', { level: 1, name: 'Menú principal' })).toBeInTheDocument()
    })
  })

  Scenario('Abrir el detalle por URL', ({ Given, When, Then }) => {
    Given('el usuario no visitó el menú principal', () => {
      // Cada escenario usa un QueryClient nuevo: la caché del listado empieza vacía.
    })
    When('abre "/producto/7" directamente', () => {
      app = renderApp('/producto/7')
      expect(app.queryClient.getQueryData(['products'])).toBeUndefined()
    })
    Then('ve el detalle de "Hamburguesa"', async () => {
      expect(await productTitle('Hamburguesa')).toBeInTheDocument()
      expect(app.router.state.location.pathname).toBe('/producto/7')
    })
  })

  Scenario('Venir desde el menú principal', ({ Given, When, Then }) => {
    Given('el menú principal ya mostró "Hamburguesa"', async () => {
      app = renderApp('/')
      await screen.findByRole('link', { name: 'Hamburguesa' })
    })
    When('el usuario hace click en su tarjeta', async () => {
      await app.user.click(screen.getByRole('link', { name: 'Hamburguesa' }))
    })
    Then('ve el nombre, el precio y el SKU sin indicador de carga', () => {
      expect(app.router.state.location.pathname).toBe('/producto/7')
      expect(screen.queryByRole('status', { name: 'Cargando producto' })).not.toBeInTheDocument()
      expect(screen.getByRole('heading', { level: 1, name: 'Hamburguesa' })).toBeInTheDocument()
      expect(screen.getByText('$12.50')).toBeInTheDocument()
      expect(screen.getByText('PLT-007')).toBeInTheDocument()
    })
  })

  Scenario('Id inexistente', ({ Given, When, Then }) => {
    Given('no existe un producto con id 999', () => {
      expect(products.some((product) => product.id === 999)).toBe(false)
    })
    When('el usuario abre "/producto/999"', () => {
      app = renderApp('/producto/999')
    })
    Then('ve "Producto no encontrado" y el botón "Volver al menú principal"', async () => {
      expect(await screen.findByText('Producto no encontrado')).toBeInTheDocument()
      expect(screen.getByRole('link', { name: BACK_LABEL })).toHaveAttribute('href', '/')
    })
  })

  Scenario('Id no válido', ({ When, Then }) => {
    When('el usuario abre "/producto/abc"', () => {
      app = renderApp('/producto/abc')
    })
    Then('ve "Producto no encontrado" y el botón "Volver al menú principal"', () => {
      expect(screen.getByText('Producto no encontrado')).toBeInTheDocument()
      expect(screen.getByRole('link', { name: BACK_LABEL })).toHaveAttribute('href', '/')
      expect(screen.queryByRole('status', { name: 'Cargando producto' })).not.toBeInTheDocument()
    })
  })

  Scenario('Carga del detalle', ({ When, Then }) => {
    When('el usuario abre "/producto/7" y la API todavía no responde', () => {
      server.use(scenarioHandlers.productsPending())
      app = renderApp('/producto/7')
    })
    Then('ve un skeleton del detalle', () => {
      expect(screen.getByRole('status', { name: 'Cargando producto' })).toBeInTheDocument()
      expect(screen.queryByRole('heading', { level: 1 })).not.toBeInTheDocument()
    })
  })

  Scenario('Error de servidor', ({ Given, When, Then }) => {
    Given('la API responde con error 500', () => {
      server.use(scenarioHandlers.productsError(500))
    })
    When('el usuario abre "/producto/7"', () => {
      app = renderApp('/producto/7')
    })
    Then('ve el mensaje "No pudimos cargar el producto" y el botón "Reintentar"', async () => {
      const alert = await screen.findByRole('alert')
      expect(alert).toHaveTextContent('No pudimos cargar el producto')
      expect(within(alert).getByRole('button', { name: 'Reintentar' })).toBeInTheDocument()
    })
  })
})
