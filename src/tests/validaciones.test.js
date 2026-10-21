import { expect, test } from 'vitest'
import { validarRegistro } from '../utils/validarRegistro'
import { validarProducto } from '../utils/validarProducto'
import { registrarUsuario, obtenerUsuarios } from '../data/usuarios'
import { iniciarSesion, leerSesion, eliminarSesion } from '../data/sesion'
import { cargarProductos, guardarProductos } from '../data/productos'

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
test('registro conserva beneficio Duoc y no guarda confirmación', () => {
  registrarUsuario(formulario)
  expect(obtenerUsuarios()[0]).toMatchObject({ descuento: 20, contrasena: 'Ficticia123!' })
  expect(obtenerUsuarios()[0]).not.toHaveProperty('confirmacion')
})
test('rechaza duplicados sin distinguir mayúsculas ni espacios', () => {
  registrarUsuario(formulario)
  expect(registrarUsuario({ ...formulario, correo: ' PRUEBA@DUOCUC.CL ' })).toHaveProperty('error')
  expect(obtenerUsuarios()).toHaveLength(1)
})
test('dominio similar no recibe beneficio Duoc', () => {
  expect(registrarUsuario({ ...formulario, correo: 'prueba@duocuc.cl.example.com' }).usuario.descuento).toBe(0)
})
test('login persiste perfil sin contraseña y logout conserva usuarios', () => {
  registrarUsuario(formulario)
  expect(iniciarSesion(formulario.correo, formulario.contrasena).rol).toBe('cliente')
  expect(leerSesion().nombre).toBe('Prueba')
  expect(JSON.parse(sessionStorage.getItem('usuarioSesion'))).not.toHaveProperty('contrasena')
  eliminarSesion()
  expect(leerSesion()).toBeNull()
  expect(obtenerUsuarios()).toHaveLength(1)
})
test('rechaza contraseña incorrecta y correo inexistente', () => {
  registrarUsuario(formulario)
  expect(iniciarSesion(formulario.correo, 'Incorrecta')).toBeNull()
  expect(iniciarSesion('nadie@example.com', formulario.contrasena)).toBeNull()
})
test('admin demostrativo recibe rol sin guardar contraseña', () => {
  expect(iniciarSesion('admin@tienda.cl', '123456').rol).toBe('admin')
  expect(leerSesion()).not.toHaveProperty('contrasena')
})
test('producto válido acepta stock cero', () => expect(validarProducto(producto)).toEqual({}))
test.each(['', '-1', '0', 'Infinity', 'abc'])('rechaza precio %s', precio => {
  expect(validarProducto({ ...producto, precio })).toHaveProperty('precio')
})
test.each(['', '-1', '1.5', 'Infinity', 'abc'])('rechaza stock %s', stock => {
  expect(validarProducto({ ...producto, stock })).toHaveProperty('stock')
})
test('rechaza URL de imagen ejecutable', () => {
  expect(validarProducto({ ...producto, imagen: 'javascript:alert(1)' })).toHaveProperty('imagen')
})
test('catálogo vacío persiste sin restaurar productos eliminados', () => {
  guardarProductos([])
  expect(cargarProductos()).toEqual({ productos: [], error: '' })
})
test('catálogo corrupto informa error sin sobrescribirlo', () => {
  localStorage.setItem('levelup-productos-demo', '{invalido')
  expect(cargarProductos().error).not.toBe('')
  expect(localStorage.getItem('levelup-productos-demo')).toBe('{invalido')
})
