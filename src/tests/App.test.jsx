import { render, screen, within, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { expect, test } from 'vitest'
import App from '../App'
import { iniciarSesion } from '../data/sesion'

function abrir(ruta = '/productos', admin = false) {
  if (admin) iniciarSesion('admin@tienda.cl', '123456')
  return render(<MemoryRouter initialEntries={[ruta]}><App /></MemoryRouter>)
}

test('agrega dos unidades, conserva el carrito al navegar y calcula la compra', async () => {
  const user = userEvent.setup()
  abrir()
  await user.click(screen.getByRole('button', { name: 'Agregar Catan al carrito' }))
  await user.click(screen.getByRole('button', { name: 'Agregar Catan al carrito' }))
  await user.click(screen.getByRole('link', { name: 'Carrito (2)' }))
  expect(screen.getByText('Cantidad: 2')).toBeInTheDocument()
  expect(screen.getByText('Subtotal: $59.980 CLP')).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: 'Comprar', exact: true }))
  expect(screen.getByText('¡Compra simulada realizada!')).toBeInTheDocument()
  expect(screen.getByText('$59.980 CLP')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Comprar', exact: true })).toBeDisabled()
  expect(screen.getByRole('link', { name: 'Carrito (0)' })).toBeInTheDocument()
})

test('carrito vacío impide comprar', () => {
  abrir('/carrito')
  expect(screen.getByRole('button', { name: 'Comprar', exact: true })).toBeDisabled()
})

test.each(['/admin/productos', '/admin/productos/nuevo', '/admin/productos/1/editar'])('bloquea %s para un cliente', (ruta) => {
  sessionStorage.setItem('usuarioSesion', JSON.stringify({ nombre: 'Cliente', correo: 'cliente@example.com', rol: 'cliente' }))
  abrir(ruta)
  expect(screen.getByText(/Debes iniciar sesión como administrador/)).toBeInTheDocument()
  expect(screen.queryByRole('link', { name: 'Administración', exact: true })).not.toBeInTheDocument()
})

test('edita sin duplicar y actualiza el precio del carrito y la persistencia', async () => {
  const user = userEvent.setup()
  const vista = abrir('/productos', true)
  await user.click(screen.getByRole('button', { name: 'Agregar Catan al carrito' }))
  await user.click(screen.getByRole('link', { name: 'Administración', exact: true }))
  await user.click(screen.getByRole('button', { name: 'Editar Catan', exact: true }))
  expect(screen.getByLabelText('Nombre', { exact: true })).toHaveValue('Catan')
  for (const [campo, valor] of Object.entries({ Nombre: 'Catan actualizado', Categoría: 'Mesa', 'Precio CLP': '45000', Descripción: 'Descripción nueva del juego', 'URL de la imagen': 'https://example.com/nueva.png', Stock: '4' })) {
    await user.clear(screen.getByLabelText(campo, { exact: true }))
    await user.type(screen.getByLabelText(campo, { exact: true }), valor)
  }
  await user.click(screen.getByRole('button', { name: 'Guardar producto' }))
  expect(screen.getByText('Producto actualizado correctamente.')).toBeInTheDocument()
  const guardados = JSON.parse(localStorage.getItem('levelup-productos-demo'))
  expect(guardados).toHaveLength(4)
  expect(guardados[0]).toMatchObject({ id: 1, nombre: 'Catan actualizado', precio: 45000, stock: 4, categoria: 'Mesa', imagen: 'https://example.com/nueva.png' })
  await user.click(screen.getByRole('link', { name: 'Carrito (1)' }))
  expect(screen.getByText('Subtotal: $45.000 CLP')).toBeInTheDocument()
  expect(screen.getByRole('heading', { name: 'Catan actualizado' })).toBeInTheDocument()
  vista.unmount()
  abrir()
  expect(screen.getByRole('img', { name: 'Catan actualizado' })).toHaveAttribute('src', 'https://example.com/nueva.png')
})

test('edición conserva imagen original y rechaza precio y stock inválidos', async () => {
  const user = userEvent.setup()
  abrir('/admin/productos/1/editar', true)
  await user.clear(screen.getByLabelText('Precio CLP'))
  await user.type(screen.getByLabelText('Precio CLP'), '-1')
  await user.clear(screen.getByLabelText('Stock'))
  await user.type(screen.getByLabelText('Stock'), '-2')
  await user.click(screen.getByRole('button', { name: 'Guardar producto' }))
  expect(screen.getByText('Ingresa un precio mayor que cero.')).toBeInTheDocument()
  expect(screen.getByText('Ingresa un stock entero mayor o igual a cero.')).toBeInTheDocument()
  expect(localStorage.getItem('levelup-productos-demo')).toBeNull()
  await user.clear(screen.getByLabelText('Precio CLP'))
  await user.type(screen.getByLabelText('Precio CLP'), '29990')
  await user.clear(screen.getByLabelText('Stock'))
  await user.type(screen.getByLabelText('Stock'), '0')
  await user.click(screen.getByRole('button', { name: 'Guardar producto' }))
  expect(screen.getByText('Producto actualizado correctamente.')).toBeInTheDocument()
})

test('producto inexistente muestra aviso sin fallar', () => {
  abrir('/admin/productos/999/editar', true)
  expect(screen.getByText(/Producto no encontrado/)).toBeInTheDocument()
})

test('cerrar sesión retira acceso administrativo inmediatamente', async () => {
  const user = userEvent.setup()
  abrir('/admin/productos', true)
  await user.click(screen.getByRole('button', { name: 'Cerrar sesión' }))
  expect(screen.getByText(/Debes iniciar sesión como administrador/)).toBeInTheDocument()
  expect(sessionStorage.getItem('usuarioSesion')).toBeNull()
})

test('cancelar conserva el producto; confirmar actualiza catálogo y carrito', async () => {
  const user = userEvent.setup()
  abrir('/productos', true)
  await user.click(screen.getByRole('button', { name: 'Agregar Catan al carrito' }))
  await user.click(screen.getByRole('button', { name: 'Agregar PlayStation 5 al carrito' }))
  await user.click(screen.getByRole('link', { name: 'Administración', exact: true }))
  await user.click(screen.getByRole('button', { name: 'Eliminar Catan', exact: true }))
  await user.click(screen.getByRole('button', { name: 'Cancelar', exact: true }))
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  expect(screen.getByRole('button', { name: 'Eliminar Catan', exact: true })).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: 'Eliminar Catan', exact: true }))
  await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Confirmar eliminación' }))
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  expect(JSON.parse(localStorage.getItem('levelup-productos-demo'))).toHaveLength(3)
  await user.click(screen.getByRole('link', { name: 'Carrito (1)' }))
  expect(screen.queryByRole('heading', { name: 'Catan', exact: true })).not.toBeInTheDocument()
  expect(screen.getByText('Subtotal: $549.990 CLP')).toBeInTheDocument()
  await user.click(screen.getByRole('link', { name: 'Productos', exact: true }))
  expect(screen.queryByRole('button', { name: 'Agregar Catan al carrito' })).not.toBeInTheDocument()
})

test('crea un producto y lo conserva al montar nuevamente la aplicación', async () => {
  const user = userEvent.setup()
  const vista = abrir('/admin/productos/nuevo', true)
  for (const [campo, valor] of Object.entries({ Nombre: 'Teclado prueba', Categoría: 'Accesorios', 'Precio CLP': '19990', Descripción: 'Teclado ficticio para pruebas', 'URL de la imagen': 'https://example.com/teclado.png', Stock: '0' })) {
    await user.type(screen.getByLabelText(campo, { exact: true }), valor)
  }
  await user.click(screen.getByRole('button', { name: 'Guardar producto' }))
  expect(screen.getByText(/Producto agregado correctamente/)).toBeInTheDocument()
  const guardados = JSON.parse(localStorage.getItem('levelup-productos-demo'))
  expect(guardados).toHaveLength(5)
  expect(new Set(guardados.map(p => p.id)).size).toBe(5)
  vista.unmount()
  abrir()
  expect(screen.getByRole('heading', { name: 'Teclado prueba' })).toBeInTheDocument()
})
