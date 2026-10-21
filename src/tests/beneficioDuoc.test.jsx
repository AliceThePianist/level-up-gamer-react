import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { expect, test } from 'vitest'
import App from '../App'
import { registrarUsuario } from '../data/usuarios'
import { iniciarSesion } from '../data/sesion'

function preparar(correo) {
  if (correo) {
    registrarUsuario({ nombre: 'Cliente', apellido: 'Ficticio', rut: '11111111-1', fechaNacimiento: '2000-01-01', correo, contrasena: 'Ficticia123!' })
    iniciarSesion(correo, 'Ficticia123!')
  }
  render(<MemoryRouter initialEntries={['/productos']}><App /></MemoryRouter>)
}

test.each(['alumno@duoc.cl', 'alumno@duocuc.cl'])('aplica 20%% a %s y conserva el total al comprar', async correo => {
  const user = userEvent.setup()
  preparar(correo)
  await user.click(screen.getByRole('button', { name: 'Agregar Catan al carrito' }))
  await user.click(screen.getByRole('link', { name: 'Carrito (1)' }))
  expect(screen.getByText('Subtotal de compra: $29.990 CLP')).toBeInTheDocument()
  expect(screen.getByText('Descuento Duoc (20%): $5.998 CLP')).toBeInTheDocument()
  expect(screen.getByText(/Total: \$23.992/)).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: 'Comprar', exact: true }))
  expect(screen.getByText('$23.992 CLP')).toBeInTheDocument()
  expect(screen.getByText('Beneficio Duoc aplicado: $5.998 CLP')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Comprar', exact: true })).toBeDisabled()
})

test.each([null, 'cliente@example.com', 'alumno@duoc.cl.example.com'])('no aplica descuento a %s', async correo => {
  const user = userEvent.setup()
  preparar(correo)
  await user.click(screen.getByRole('button', { name: 'Agregar Catan al carrito' }))
  await user.click(screen.getByRole('link', { name: 'Carrito (1)' }))
  expect(screen.getByText('Descuento: $0 CLP')).toBeInTheDocument()
  expect(screen.getByText(/Total: \$29.990/)).toBeInTheDocument()
})

test('cerrar sesión retira el beneficio sin perder los productos del carrito', async () => {
  const user = userEvent.setup()
  preparar('alumno@duoc.cl')
  await user.click(screen.getByRole('button', { name: 'Agregar Catan al carrito' }))
  await user.click(screen.getByRole('link', { name: 'Carrito (1)' }))
  await user.click(screen.getByRole('button', { name: 'Cerrar sesión' }))
  expect(screen.getByText('Descuento: $0 CLP')).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'Carrito (1)' })).toBeInTheDocument()
})
