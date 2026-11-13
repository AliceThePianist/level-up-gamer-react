import { render, screen, within, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { expect, test } from 'vitest'
import App from '../App'
import { iniciarSesion } from '../data/sesion'
import { claveAdministrador, correoAdministrador, productosApi } from './apiSimulada'

async function abrir(ruta = '/productos', admin = false) {
  if (admin) await iniciarSesion(correoAdministrador, claveAdministrador)
  return render(<MemoryRouter initialEntries={[ruta]}><App /></MemoryRouter>)
}

test('ajusta cantidades y separa el resumen de dos compras consecutivas', async () => {
  const user = userEvent.setup()
  await abrir()
  await user.click(await screen.findByRole('button', { name: 'Agregar Catan al carrito' }))
  await user.click(await screen.findByRole('button', { name: 'Agregar Catan al carrito' }))
  await user.click(screen.getByRole('link', { name: 'Carrito (2)' }))
  expect(screen.getByText('Cantidad: 2')).toBeInTheDocument()
  const disminuir = screen.getByRole('button', { name: 'Disminuir cantidad de Catan' })
  await user.click(disminuir)
  expect(disminuir).toBeDisabled()
  expect(screen.getByText('Subtotal: $29.990 CLP')).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: 'Aumentar cantidad de Catan' }))
  expect(screen.getByText('Subtotal: $59.980 CLP')).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: 'Guardar resumen', exact: true }))
  expect(screen.getByText('Resumen guardado')).toBeInTheDocument()
  expect(screen.getByText('$59.980 CLP')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Guardar resumen', exact: true })).toBeDisabled()
  expect(screen.getByRole('link', { name: 'Carrito (0)' })).toBeInTheDocument()
  await user.click(screen.getByRole('link', { name: 'Seguir explorando productos' }))
  await user.click(await screen.findByRole('button', { name: 'Agregar Catan al carrito' }))
  await user.click(screen.getByRole('link', { name: 'Carrito (1)' }))
  expect(screen.queryByText('Resumen guardado')).not.toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: 'Guardar resumen', exact: true }))
  expect(screen.getByText('$29.990 CLP')).toBeInTheDocument()
  expect(screen.queryByText('$59.980 CLP')).not.toBeInTheDocument()
})

test('carrito vacío impide comprar', async () => {
  await abrir('/carrito')
  expect(screen.getByRole('button', { name: 'Guardar resumen', exact: true })).toBeDisabled()
})

test.each(['/admin', '/admin/productos', '/admin/productos/nuevo', '/admin/productos/1/editar'])('bloquea %s para un cliente', async (ruta) => {
  sessionStorage.setItem('usuarioSesion', JSON.stringify({ nombre: 'Cliente', rol: 'CLIENTE', token: 'token-de-prueba', expiraEn: Date.now() + 60000 }))
  await abrir(ruta)
  expect(screen.getByText(/Tu cuenta no tiene acceso a la administración/)).toBeInTheDocument()
  expect(screen.queryByRole('link', { name: 'Administración', exact: true })).not.toBeInTheDocument()
})

test('edita sin duplicar y actualiza el precio del carrito y la persistencia', async () => {
  const user = userEvent.setup()
  const vista = await abrir('/productos', true)
  await user.click(await screen.findByRole('button', { name: 'Agregar Catan al carrito' }))
  await user.click(screen.getByRole('link', { name: 'Administración', exact: true }))
  await user.click(screen.getByRole('button', { name: 'Editar Catan', exact: true }))
  expect(await screen.findByLabelText('Nombre', { exact: true })).toHaveValue('Catan')
  for (const [campo, valor] of Object.entries({ Nombre: 'Catan actualizado', Categoría: 'Mesa', 'Precio CLP': '45000', Descripción: 'Descripción nueva del juego', Stock: '4' })) {
    await user.clear(screen.getByLabelText(campo, { exact: true }))
    await user.type(screen.getByLabelText(campo, { exact: true }), valor)
  }
  await user.upload(screen.getByLabelText('Imagen del producto'), new File(['imagen'], 'nueva.png', { type: 'image/png' }))
  expect(await screen.findByRole('img', { name: 'Vista previa de la imagen seleccionada' })).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: 'Guardar producto' }))
  expect(await screen.findByText('Producto actualizado.')).toBeInTheDocument()
  const guardados = productosApi
  expect(guardados).toHaveLength(4)
  expect(guardados[0]).toMatchObject({ id: 1, nombre: 'Catan actualizado', precio: 45000, stock: 4, categoria: 'Mesa', imagen: '/api/imagenes/12345678-1234-1234-1234-123456789abc.png' })
  await user.click(screen.getByRole('link', { name: 'Carrito (1)' }))
  expect(screen.getByText('Subtotal: $45.000 CLP')).toBeInTheDocument()
  expect(screen.getByRole('heading', { name: 'Catan actualizado' })).toBeInTheDocument()
  vista.unmount()
  await abrir()
  expect(await screen.findByRole('img', { name: 'Catan actualizado' })).toHaveAttribute('src', expect.stringContaining('/api/imagenes/12345678-1234-1234-1234-123456789abc.png'))
}, 15000)

test('edición conserva imagen original y rechaza precio y stock inválidos', async () => {
  const user = userEvent.setup()
  await abrir('/admin/productos/1/editar', true)
  await user.clear(await screen.findByLabelText('Precio CLP'))
  await user.type(screen.getByLabelText('Precio CLP'), '-1')
  await user.clear(screen.getByLabelText('Stock'))
  await user.type(screen.getByLabelText('Stock'), '-2')
  await user.click(screen.getByRole('button', { name: 'Guardar producto' }))
  expect(screen.getByText('Ingresa un precio mayor que cero.')).toBeInTheDocument()
  expect(screen.getByText('Ingresa un stock entero mayor o igual a cero.')).toBeInTheDocument()
  expect(productosApi[0]).toMatchObject({ precio: 29990, stock: 10 })
  await user.clear(await screen.findByLabelText('Precio CLP'))
  await user.type(screen.getByLabelText('Precio CLP'), '29990')
  await user.clear(screen.getByLabelText('Stock'))
  await user.type(screen.getByLabelText('Stock'), '0')
  await user.click(screen.getByRole('button', { name: 'Guardar producto' }))
  expect(await screen.findByText('Producto actualizado.')).toBeInTheDocument()
  expect(productosApi[0].imagen).toBe('/catalogo/catan.jpg')
})

test('producto inexistente muestra aviso sin fallar', async () => {
  await abrir('/admin/productos/999/editar', true)
  expect(await screen.findByText(/Producto no encontrado/)).toBeInTheDocument()
})

test('cerrar sesión retira acceso administrativo inmediatamente', async () => {
  const user = userEvent.setup()
  await abrir('/admin/productos', true)
  await user.click(screen.getByRole('button', { name: 'Cerrar sesión' }))
  expect(screen.getByText(/Debes iniciar sesión como administrador/)).toBeInTheDocument()
  expect(sessionStorage.getItem('usuarioSesion')).toBeNull()
})

test('cancelar conserva el producto; confirmar actualiza catálogo y carrito', async () => {
  const user = userEvent.setup()
  await abrir('/productos', true)
  await user.click(await screen.findByRole('button', { name: 'Agregar Catan al carrito' }))
  await user.click(screen.getByRole('button', { name: 'Agregar PlayStation 5 al carrito' }))
  await user.click(screen.getByRole('link', { name: 'Administración', exact: true }))
  await user.click(screen.getByRole('button', { name: 'Eliminar Catan', exact: true }))
  await user.click(screen.getByRole('button', { name: 'Cancelar', exact: true }))
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  expect(screen.getByRole('button', { name: 'Eliminar Catan', exact: true })).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: 'Eliminar Catan', exact: true }))
  await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Confirmar eliminación' }))
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  expect(productosApi).toHaveLength(3)
  await user.click(screen.getByRole('link', { name: 'Carrito (1)' }))
  expect(screen.queryByRole('heading', { name: 'Catan', exact: true })).not.toBeInTheDocument()
  expect(screen.getByText('Subtotal: $549.990 CLP')).toBeInTheDocument()
  await user.click(screen.getByRole('link', { name: 'Productos', exact: true }))
  expect(screen.queryByRole('button', { name: 'Agregar Catan al carrito' })).not.toBeInTheDocument()
})

test('crea un producto y lo conserva al montar nuevamente la aplicación', async () => {
  const user = userEvent.setup()
  const vista = await abrir('/admin/productos/nuevo', true)
  for (const [campo, valor] of Object.entries({ Nombre: 'Teclado prueba', Categoría: 'Accesorios', 'Precio CLP': '19990', Descripción: 'Teclado ficticio para pruebas', Stock: '0' })) {
    await user.type(screen.getByLabelText(campo, { exact: true }), valor)
  }
  await user.click(screen.getByRole('button', { name: 'Guardar producto' }))
  expect(screen.getByText('Selecciona una imagen del producto.')).toBeInTheDocument()
  await user.upload(screen.getByLabelText('Imagen del producto'), new File(['imagen'], 'teclado.png', { type: 'image/png' }))
  await user.click(screen.getByRole('button', { name: 'Guardar producto' }))
  expect(await screen.findByText('Producto agregado al catálogo.')).toBeInTheDocument()
  const guardados = productosApi
  expect(guardados).toHaveLength(5)
  expect(new Set(guardados.map(p => p.id)).size).toBe(5)
  vista.unmount()
  await abrir()
  expect(await screen.findByRole('heading', { name: 'Teclado prueba' })).toBeInTheDocument()
})
