import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { expect, test, vi } from 'vitest'
import App from '../App'
import { iniciarSesion } from '../data/sesion'
import { claveAdministrador, correoAdministrador } from './apiSimulada'

test('registro completo permite iniciar sesión y conserva el perfil tras recargar', async () => {
  const user = userEvent.setup()
  const vista = render(<MemoryRouter initialEntries={['/registro']}><App /></MemoryRouter>)
  for (const [campo, valor] of Object.entries({ Nombre: 'Alumno', Apellido: 'Ficticio', RUT: '11111111-1', 'Correo electrónico': 'alumno@duoc.cl', 'Contraseña': 'Ficticia123!', 'Confirmar contraseña': 'Ficticia123!' })) {
    await user.type(screen.getByLabelText(campo, { exact: true }), valor)
  }
  fireEvent.change(screen.getByLabelText('Fecha de nacimiento'), { target: { value: '2000-01-01' } })
  await user.click(screen.getByRole('button', { name: 'Registrarme' }))
  expect(await screen.findByText(/Tu cuenta está lista.*20% de descuento Duoc/)).toBeInTheDocument()
  await user.click(screen.getByRole('link', { name: 'Iniciar sesión', exact: true }))
  await user.type(screen.getByLabelText('Correo electrónico'), 'alumno@duoc.cl')
  await user.type(screen.getByLabelText('Contraseña'), 'Ficticia123!')
  await user.click(screen.getByRole('button', { name: 'Ingresar' }))
  expect(await screen.findByText('Hola, Alumno')).toBeInTheDocument()
  expect(await screen.findByRole('heading', { name: /Desafía tus límites/ })).toBeInTheDocument()
  vista.unmount()
  render(<MemoryRouter><App /></MemoryRouter>)
  expect(await screen.findByText('Hola, Alumno')).toBeInTheDocument()
  expect(JSON.parse(sessionStorage.getItem('usuarioSesion'))).not.toHaveProperty('contrasena')
}, 15000)

test('login muestra errores de campos y credenciales sin crear sesión', async () => {
  const user = userEvent.setup()
  render(<MemoryRouter initialEntries={['/login']}><App /></MemoryRouter>)
  await user.click(screen.getByRole('button', { name: 'Ingresar' }))
  expect(screen.getByText('Ingresa un correo electrónico válido.')).toBeInTheDocument()
  expect(screen.getByText(/Ingresa tu contraseña de al menos/)).toBeInTheDocument()
  await user.type(screen.getByLabelText('Correo electrónico'), 'nadie@example.com')
  await user.type(screen.getByLabelText('Contraseña'), 'Incorrecta123')
  await user.click(screen.getByRole('button', { name: 'Ingresar' }))
  expect(await screen.findByText('Correo o contraseña incorrectos.')).toBeInTheDocument()
  expect(sessionStorage.getItem('usuarioSesion')).toBeNull()
})

test('fallo de la API durante eliminación conserva catálogo y muestra error', async () => {
  const user = userEvent.setup()
  await iniciarSesion(correoAdministrador, claveAdministrador)
  render(<MemoryRouter initialEntries={['/admin/productos']}><App /></MemoryRouter>)
  await user.click(await screen.findByRole('button', { name: 'Eliminar Catan', exact: true }))
  vi.mocked(fetch).mockRejectedValueOnce(new TypeError('Sin conexión'))
  await user.click(screen.getByRole('button', { name: 'Confirmar eliminación' }))
  expect(await screen.findByText(/No se pudo conectar con el servidor/)).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Eliminar Catan', exact: true })).toBeInTheDocument()
})
