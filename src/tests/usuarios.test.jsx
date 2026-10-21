import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { expect, test, vi } from 'vitest'
import App from '../App'

test('registro completo permite iniciar sesión y conserva el perfil tras recargar', async () => {
  const user = userEvent.setup()
  const vista = render(<MemoryRouter initialEntries={['/registro']}><App /></MemoryRouter>)
  for (const [campo, valor] of Object.entries({ Nombre: 'Alumno', Apellido: 'Ficticio', RUT: '11111111-1', 'Correo electrónico': 'alumno@duoc.cl', 'Contraseña de prueba': 'Ficticia123!', 'Confirmar contraseña de prueba': 'Ficticia123!' })) {
    await user.type(screen.getByLabelText(campo, { exact: true }), valor)
  }
  fireEvent.change(screen.getByLabelText('Fecha de nacimiento'), { target: { value: '2000-01-01' } })
  await user.click(screen.getByRole('button', { name: 'Registrarme' }))
  expect(screen.getByText(/Registro de demostración exitoso. Beneficio Duoc/)).toBeInTheDocument()
  await user.click(screen.getByRole('link', { name: 'Iniciar sesión', exact: true }))
  await user.type(screen.getByLabelText('Correo electrónico'), 'alumno@duoc.cl')
  await user.type(screen.getByLabelText('Contraseña ficticia'), 'Ficticia123!')
  await user.click(screen.getByRole('button', { name: 'Ingresar' }))
  expect(screen.getByText('Hola, Alumno')).toBeInTheDocument()
  expect(screen.getByRole('heading', { name: /Desafía tus límites/ })).toBeInTheDocument()
  vista.unmount()
  render(<MemoryRouter><App /></MemoryRouter>)
  expect(screen.getByText('Hola, Alumno')).toBeInTheDocument()
  expect(JSON.parse(sessionStorage.getItem('usuarioSesion'))).not.toHaveProperty('contrasena')
}, 15000)

test('login muestra errores de campos y credenciales sin crear sesión', async () => {
  const user = userEvent.setup()
  render(<MemoryRouter initialEntries={['/login']}><App /></MemoryRouter>)
  await user.click(screen.getByRole('button', { name: 'Ingresar' }))
  expect(screen.getByText('Ingresa un correo electrónico válido.')).toBeInTheDocument()
  expect(screen.getByText(/Ingresa tu contraseña ficticia de al menos/)).toBeInTheDocument()
  await user.type(screen.getByLabelText('Correo electrónico'), 'nadie@example.com')
  await user.type(screen.getByLabelText('Contraseña ficticia'), 'Incorrecta123')
  await user.click(screen.getByRole('button', { name: 'Ingresar' }))
  expect(screen.getByText('Correo o contraseña incorrectos.')).toBeInTheDocument()
  expect(sessionStorage.getItem('usuarioSesion')).toBeNull()
})

test('fallo de almacenamiento durante eliminación conserva catálogo y muestra error', async () => {
  const user = userEvent.setup()
  sessionStorage.setItem('usuarioSesion', JSON.stringify({ nombre: 'Administrador', correo: 'admin@tienda.cl', rol: 'admin' }))
  render(<MemoryRouter initialEntries={['/admin/productos']}><App /></MemoryRouter>)
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('Almacenamiento bloqueado') })
  await user.click(screen.getByRole('button', { name: 'Eliminar Catan', exact: true }))
  await user.click(screen.getByRole('button', { name: 'Confirmar eliminación' }))
  expect(screen.getByText(/No se pudo eliminar el producto/)).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Eliminar Catan', exact: true })).toBeInTheDocument()
})
