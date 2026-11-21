import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { expect, test, vi } from 'vitest'
import App from '../App'
import { registrarUsuario } from '../data/usuarios'
import { iniciarSesion } from '../data/sesion'


async function abrirCliente(ruta) {
  await registrarUsuario({ nombre: 'Cliente', apellido: 'Local', rut: '11111111-1', fechaNacimiento: '2000-01-01', correo: 'cliente@example.test', contrasena: 'ClaveLocalDePrueba' })
  await iniciarSesion('cliente@example.test', 'ClaveLocalDePrueba')
  return render(<MemoryRouter initialEntries={[ruta]}><App /></MemoryRouter>)
}

test('un pedido rechazado conserva el carrito y solo envía identificadores y cantidades', async () => {
  const user = userEvent.setup()
  await abrirCliente('/productos')
  await user.click(await screen.findByRole('button', { name: 'Agregar Catan al carrito' }))
  await user.click(screen.getByRole('link', { name: 'Carrito (1)' }))
  vi.mocked(fetch).mockResolvedValueOnce({ ok: false, status: 409, json: async () => ({ mensaje: 'Stock insuficiente para Catan.' }) })
  await user.click(screen.getByRole('button', { name: 'Registrar pedido' }))
  expect(await screen.findByText(/Stock insuficiente para Catan/)).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'Carrito (1)' })).toBeInTheDocument()
  expect(screen.queryByText('Pedido registrado')).not.toBeInTheDocument()
  const llamada = vi.mocked(fetch).mock.calls.find(([url]) => url.endsWith('/api/pedidos'))
  expect(JSON.parse(llamada[1].body)).toEqual({ productos: [{ id: 1, cantidad: 1 }] })
  expect(llamada[1].headers.Authorization).toMatch(/^Bearer /)
  await user.click(screen.getByRole('button', { name: 'Registrar pedido' }))
  expect(await screen.findByText('Pedido registrado')).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'Carrito (0)' })).toBeInTheDocument()
}, 20000)

test('Mi cuenta actualiza el nombre en React y conserva los identificadores y la sesión mínima', async () => {
  const user = userEvent.setup()
  const vista = await abrirCliente('/mi-cuenta')
  const nombre = await screen.findByLabelText('Nombre')
  await user.clear(nombre)
  await user.type(nombre, 'Cliente Actualizado')
  await user.click(screen.getByRole('button', { name: 'Guardar datos' }))
  expect(await screen.findByText('Tus datos se actualizaron.')).toBeInTheDocument()
  expect(screen.getByText('Hola, Cliente Actualizado')).toBeInTheDocument()
  expect(screen.getByText('Correo: cliente@example.test')).toBeInTheDocument()
  const guardado = JSON.parse(sessionStorage.getItem('usuarioSesion'))
  expect(guardado.nombre).toBe('Cliente Actualizado')
  expect(guardado).not.toHaveProperty('contrasena')
  expect(guardado).not.toHaveProperty('rut')
  vista.unmount()
  render(<MemoryRouter initialEntries={['/mi-cuenta']}><App /></MemoryRouter>)
  expect(await screen.findByLabelText('Nombre')).toHaveValue('Cliente Actualizado')
}, 20000)
