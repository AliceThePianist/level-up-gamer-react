import axios from 'axios'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { expect, test, vi } from 'vitest'
import App from '../App'
import { registrarUsuario } from '../data/usuarios'
import { iniciarSesion } from '../data/sesion'
import { solicitar } from '../data/api'
import { claveAdministrador, correoAdministrador, productosApi } from './apiSimulada'

test('el administrador consulta pedidos y confirma la cancelación antes de devolver stock', async () => {
  const user = userEvent.setup()
  await registrarUsuario({ nombre: 'Cliente', apellido: 'Local', rut: '11111111-1', fechaNacimiento: '2000-01-01', correo: 'cliente@example.test', contrasena: 'ClaveLocalDePrueba' })
  const cliente = await iniciarSesion('cliente@example.test', 'ClaveLocalDePrueba')
  await solicitar('/api/pedidos', { metodo: 'POST', token: cliente.token, datos: { productos: [{ id: 1, cantidad: 2 }] } })
  await iniciarSesion(correoAdministrador, claveAdministrador)
  render(<MemoryRouter initialEntries={['/admin/pedidos']}><App /></MemoryRouter>)
  await user.click(await screen.findByRole('link', { name: 'Ver pedido #1' }))
  expect(await screen.findByRole('heading', { name: 'Pedido #1' })).toBeInTheDocument()
  await user.selectOptions(screen.getByLabelText('Nuevo estado'), 'CANCELADO')
  await user.click(screen.getByRole('button', { name: 'Actualizar estado' }))
  expect(await screen.findByRole('dialog')).toBeInTheDocument()
  expect(productosApi[0].stock).toBe(8)
  await user.click(screen.getByRole('button', { name: 'Confirmar cancelación' }))
  expect(await screen.findByText('Estado actualizado.')).toBeInTheDocument()
  expect(productosApi[0].stock).toBe(10)
  expect(screen.queryByLabelText('Nuevo estado')).not.toBeInTheDocument()
  await user.click(screen.getByRole('link', { name: 'Resumen', exact: true }))
  expect(await screen.findByRole('heading', { name: 'Resumen administrativo' })).toBeInTheDocument()
  expect(await screen.findByRole('heading', { name: 'Productos con 5 unidades o menos' })).toBeInTheDocument()
}, 20000)

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
  vi.mocked(axios.request).mockRejectedValueOnce(new axios.AxiosError('Stock insuficiente', undefined, undefined, undefined, { status: 409, data: { mensaje: 'Stock insuficiente para Catan.' } }))
  await user.click(screen.getByRole('button', { name: 'Registrar pedido' }))
  expect(await screen.findByText(/Stock insuficiente para Catan/)).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'Carrito (1)' })).toBeInTheDocument()
  expect(screen.queryByText('Pedido registrado')).not.toBeInTheDocument()
  const [llamada] = vi.mocked(axios.request).mock.calls.find(([config]) => config.url === '/api/pedidos')
  expect(llamada.data).toEqual({ productos: [{ id: 1, cantidad: 1 }] })
  expect(llamada.headers.Authorization).toMatch(/^Bearer /)
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
