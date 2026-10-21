import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { expect, test } from 'vitest'
import App from '../App'
import { productosIniciales } from '../data/productosIniciales'
import { guardarProductos } from '../data/productos'
import { iniciarSesion } from '../data/sesion'

function abrir(ruta = '/productos', stock = 2) {
  guardarProductos(productosIniciales.map(p => p.id === 1 ? { ...p, stock } : p))
  return render(<MemoryRouter initialEntries={[ruta]}><App /></MemoryRouter>)
}

test('el enlace abre el detalle con todos los datos y permite volver', async () => {
  const user = userEvent.setup()
  abrir()
  await user.click(screen.getByRole('link', { name: 'Ver detalle de Catan' }))
  expect(screen.getByRole('heading', { level: 1, name: 'Catan' })).toBeInTheDocument()
  expect(screen.getByRole('img', { name: 'Catan' })).toBeInTheDocument()
  expect(screen.getByText('Juegos de Mesa')).toBeInTheDocument()
  expect(screen.getByText(productosIniciales[0].descripcion)).toBeInTheDocument()
  expect(screen.getByText('Stock disponible: 2')).toBeInTheDocument()
  await user.click(screen.getByRole('link', { name: 'Volver al catálogo' }))
  expect(screen.getByRole('heading', { name: 'Catálogo de productos' })).toBeInTheDocument()
})

test.each(['/producto/999', '/producto/'])('detalle inexistente %s informa sin fallar', ruta => {
  abrir(ruta)
  expect(screen.getByRole('heading', { name: 'Producto no encontrado' })).toBeInTheDocument()
})

test('stock cero bloquea agregar desde catálogo y detalle', async () => {
  const user = userEvent.setup()
  abrir('/productos', 0)
  expect(screen.getByRole('button', { name: 'Agregar Catan al carrito' })).toBeDisabled()
  await user.click(screen.getByRole('link', { name: 'Ver detalle de Catan' }))
  expect(screen.getByText('Sin stock')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Agregar Catan al carrito' })).toBeDisabled()
})

test('catálogo y detalle comparten límite de unidades disponibles', async () => {
  const user = userEvent.setup()
  abrir()
  await user.click(screen.getByRole('button', { name: 'Agregar Catan al carrito' }))
  await user.click(screen.getByRole('link', { name: 'Ver detalle de Catan' }))
  await user.click(screen.getByRole('button', { name: 'Agregar Catan al carrito' }))
  expect(screen.getByRole('button', { name: 'Agregar Catan al carrito' })).toBeDisabled()
  await user.click(screen.getByRole('link', { name: 'Carrito (2)' }))
  expect(screen.getByText('Cantidad: 2')).toBeInTheDocument()
  expect(screen.getByText('Subtotal: $59.980 CLP')).toBeInTheDocument()
})

test('reducir stock ajusta el carrito y stock cero retira el producto', async () => {
  const user = userEvent.setup()
  iniciarSesion('admin@tienda.cl', '123456')
  abrir()
  await user.click(screen.getByRole('button', { name: 'Agregar Catan al carrito' }))
  await user.click(screen.getByRole('button', { name: 'Agregar Catan al carrito' }))
  await user.click(screen.getByRole('link', { name: 'Administración', exact: true }))
  await user.click(screen.getByRole('button', { name: 'Editar Catan' }))
  await user.clear(screen.getByLabelText('Stock'))
  await user.type(screen.getByLabelText('Stock'), '1')
  await user.click(screen.getByRole('button', { name: 'Guardar producto' }))
  expect(screen.getByRole('link', { name: 'Carrito (1)' })).toBeInTheDocument()
  expect(screen.getByText('Se ajustaron las cantidades del carrito al stock disponible.')).toBeInTheDocument()
  await user.clear(screen.getByLabelText('Stock'))
  await user.type(screen.getByLabelText('Stock'), '0')
  await user.click(screen.getByRole('button', { name: 'Guardar producto' }))
  await user.click(screen.getByRole('link', { name: 'Carrito (0)' }))
  expect(screen.getByRole('button', { name: 'Comprar', exact: true })).toBeDisabled()
})
