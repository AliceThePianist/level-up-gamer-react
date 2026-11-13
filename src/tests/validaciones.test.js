import { expect, test, vi } from 'vitest'
import { validarRegistro } from '../utils/validarRegistro'
import { validarImagen, validarProducto } from '../utils/validarProducto'
import { registrarUsuario } from '../data/usuarios'
import { iniciarSesion, leerSesion, eliminarSesion } from '../data/sesion'
import { cargarProductos } from '../data/productos'
import { claveAdministrador, correoAdministrador, productosApi } from './apiSimulada'

const formulario = { nombre: 'Prueba', apellido: 'Académica', rut: '11111111-1', fechaNacimiento: '2000-01-01', correo: 'prueba@duocuc.cl', contrasena: 'Ficticia123!', confirmacion: 'Ficticia123!' }
const hoy = new Date(2026, 9, 21)
const producto = { nombre: 'Teclado', categoria: 'Accesorios', descripcion: 'Teclado de prueba', imagen: 'https://example.com/imagen.png', precio: '1000', stock: '0' }

test('registro válido y mayoría de edad exacta', () => {
  expect(validarRegistro({ ...formulario, fechaNacimiento: '2008-10-21' }, hoy)).toEqual({})
})
test('rechaza a quien cumple 18 mañana', () => {
  expect(validarRegistro({ ...formulario, fechaNacimiento: '2008-10-22' }, hoy)).toHaveProperty('fechaNacimiento')
})
test.each(['2027-01-01', '2000-02-30', ''])('rechaza nacimiento inválido %s', fechaNacimiento => {
  expect(validarRegistro({ ...formulario, fechaNacimiento }, hoy)).toHaveProperty('fechaNacimiento')
})
test('rechaza formulario vacío', () => {
  expect(Object.keys(validarRegistro(Object.fromEntries(Object.keys(formulario).map(k => [k, ''])), hoy))).toHaveLength(7)
})
test('rechaza correo incorrecto y contraseñas distintas', () => {
  expect(validarRegistro({ ...formulario, correo: 'sin-arroba', confirmacion: 'OtraClave' }, hoy)).toMatchObject({ correo: expect.any(String), confirmacion: expect.any(String) })
})
test('envía el registro sin rol ni confirmación y usa el beneficio de la API', async () => {
  const usuario = await registrarUsuario({ ...formulario, rol: 'ADMINISTRADOR' })
  expect(usuario).toMatchObject({ rol: 'CLIENTE', descuento: 20 })
  const enviado = JSON.parse(vi.mocked(fetch).mock.calls[0][1].body)
  expect(enviado).not.toHaveProperty('rol')
  expect(enviado).not.toHaveProperty('confirmacion')
  expect(localStorage.getItem('levelup-usuarios-demo')).toBeNull()
})
test('rechaza duplicados sin distinguir mayúsculas ni espacios', async () => {
  await registrarUsuario(formulario)
  await expect(registrarUsuario({ ...formulario, correo: ' PRUEBA@DUOCUC.CL ' })).rejects.toMatchObject({ status: 409 })
})
test('dominio similar no recibe beneficio Duoc', async () => {
  const usuario = await registrarUsuario({ ...formulario, correo: 'prueba@duocuc.cl.example.com' })
  expect(usuario.descuento).toBe(0)
})
test('login persiste perfil sin contraseña y logout conserva usuarios', async () => {
  await registrarUsuario(formulario)
  expect((await iniciarSesion(formulario.correo, formulario.contrasena)).rol).toBe('CLIENTE')
  expect(leerSesion().nombre).toBe('Prueba')
  expect(JSON.parse(sessionStorage.getItem('usuarioSesion'))).not.toHaveProperty('contrasena')
  eliminarSesion()
  expect(leerSesion()).toBeNull()
  expect((await iniciarSesion(formulario.correo, formulario.contrasena)).nombre).toBe('Prueba')
})
test('rechaza contraseña incorrecta y correo inexistente', async () => {
  await registrarUsuario(formulario)
  await expect(iniciarSesion(formulario.correo, 'Incorrecta')).rejects.toMatchObject({ status: 401 })
  await expect(iniciarSesion('nadie@example.com', formulario.contrasena)).rejects.toMatchObject({ status: 401 })
})
test('conserva el rol administrador devuelto por la API y descarta sesiones vencidas', async () => {
  const sesion = await iniciarSesion(correoAdministrador, claveAdministrador)
  expect(sesion.rol).toBe('ADMINISTRADOR')
  expect(leerSesion()).not.toHaveProperty('contrasena')
  sessionStorage.setItem('usuarioSesion', JSON.stringify({ ...sesion, expiraEn: Date.now() - 1000 }))
  expect(leerSesion()).toBeNull()
  expect(sessionStorage.getItem('usuarioSesion')).toBeNull()
})
test('producto válido acepta stock cero', () => expect(validarProducto(producto)).toEqual({}))
test.each(['', '-1', '0', 'Infinity', 'abc'])('rechaza precio %s', precio => {
  expect(validarProducto({ ...producto, precio })).toHaveProperty('precio')
})
test.each(['', '-1', '1.5', 'Infinity', 'abc'])('rechaza stock %s', stock => {
  expect(validarProducto({ ...producto, stock })).toHaveProperty('stock')
})
test('valida formato y tamaño de los archivos antes de enviarlos', () => {
  expect(validarImagen(new File(['imagen'], 'control.png', { type: 'image/png' }))).toBe('')
  expect(validarImagen(new File(['imagen'], 'control.svg', { type: 'image/svg+xml' }))).toMatch(/JPG, PNG o WebP/)
  expect(validarImagen({ name: 'control.webp', type: 'image/webp', size: 5 * 1024 * 1024 + 1 })).toMatch(/5 MB/)
})
test('catálogo vacío de la API no restaura productos locales', async () => {
  productosApi.length = 0
  localStorage.setItem('levelup-productos-demo', '[{"id":123}]')
  await expect(cargarProductos()).resolves.toEqual([])
})
test('error de red informa que el servidor no está disponible', async () => {
  vi.mocked(fetch).mockRejectedValueOnce(new TypeError('Sin conexión'))
  await expect(cargarProductos()).rejects.toThrow('No se pudo conectar con el servidor.')
})
