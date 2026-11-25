import { vi } from 'vitest'
import axios from 'axios'
import { productosIniciales } from '../data/productosIniciales'
import { ROL_ADMINISTRADOR, ROL_CLIENTE } from '../data/roles'

export const productosApi = []
export const pedidosApi = []
export const correoAdministrador = 'administrador@example.test'
export const claveAdministrador = crypto.randomUUID()
const usuarios = new Map()
const tokens = new Map()
let siguienteId

function respuesta(status, datos) {
  const resultado = { status, data: structuredClone(datos) }
  if (status >= 400) throw new axios.AxiosError('Solicitud rechazada', undefined, undefined, undefined, resultado)
  return resultado
}

export function simularApi() {
  productosApi.splice(0, productosApi.length, ...structuredClone(productosIniciales))
  siguienteId = Math.max(...productosApi.map(({ id }) => id)) + 1
  usuarios.clear()
  pedidosApi.length = 0
  tokens.clear()
  usuarios.set(correoAdministrador, { id: 1, nombre: 'Administrador', rol: ROL_ADMINISTRADOR, descuento: 0, contrasena: claveAdministrador })
  vi.spyOn(axios, 'request').mockImplementation(async ({ url, method, data: body, headers, signal }) => {
    signal?.throwIfAborted()
    const { pathname } = new URL(url, 'http://localhost')
    const datos = body instanceof FormData ? undefined : body

    if (pathname === '/api/imagenes') {
      if (tokens.get(headers.Authorization)?.rol !== ROL_ADMINISTRADOR) return respuesta(403)
      if (method !== 'POST' || headers['Content-Type'] || !body.get('archivo')) return respuesta(400)
      return respuesta(201, { imagen: '/api/imagenes/12345678-1234-1234-1234-123456789abc.png' })
    }

    if (pathname === '/api/auth/registro') {
      if (usuarios.has(datos.correo)) return respuesta(409)
      const dominio = datos.correo.split('@')[1]
      const { contrasena, ...perfil } = {
        ...datos, id: usuarios.size + 1, rol: ROL_CLIENTE,
        descuento: ['duoc.cl', 'duocuc.cl'].includes(dominio) ? 20 : 0,
      }
      usuarios.set(datos.correo, { ...perfil, contrasena })
      return respuesta(201, perfil)
    }
    if (pathname === '/api/auth/login') {
      const cuenta = usuarios.get(datos.correo)
      if (!cuenta || cuenta.contrasena !== datos.contrasena) return respuesta(401)
      const { contrasena: _, ...usuario } = cuenta
      const token = `token-de-prueba-${usuario.id}`
      tokens.set(`Bearer ${token}`, cuenta)
      return respuesta(200, { usuario, token, tipoToken: 'Bearer', expiraEn: 3600 })
    }

    const cuenta = tokens.get(headers.Authorization)
    if (pathname === '/api/usuarios/me') {
      if (!cuenta) return respuesta(401)
      if (method === 'PUT') Object.assign(cuenta, { nombre: datos.nombre.trim(), apellido: datos.apellido.trim() })
      const { contrasena: _, ...perfil } = cuenta
      return respuesta(200, perfil)
    }
    if (pathname === '/api/pedidos' && method === 'POST') {
      if (!cuenta) return respuesta(401)
      if (cuenta.rol !== ROL_CLIENTE) return respuesta(403)
      const detalles = datos.productos.map(({ id, cantidad }, indice) => {
        const producto = productosApi.find((producto) => producto.id === id)
        return producto && cantidad > 0 && cantidad <= producto.stock
          ? { id: indice + 1, productoId: id, nombreProducto: producto.nombre, precioUnitario: producto.precio,
              cantidad, subtotal: producto.precio * cantidad }
          : null
      })
      if (!detalles.length || detalles.some((detalle) => !detalle)) return respuesta(409, { mensaje: 'Stock insuficiente.' })
      const subtotal = detalles.reduce((suma, detalle) => suma + detalle.subtotal, 0)
      const descuento = Math.round(subtotal * cuenta.descuento / 100)
      const pedido = { id: pedidosApi.length + 1, cliente: { id: cuenta.id, nombre: cuenta.nombre, apellido: cuenta.apellido },
        fecha: new Date().toISOString(), subtotal, descuento, total: subtotal - descuento, estado: 'PENDIENTE',
        pagado: false, detalles }
      detalles.forEach((detalle) => { productosApi.find((producto) => producto.id === detalle.productoId).stock -= detalle.cantidad })
      pedidosApi.push(pedido)
      return respuesta(201, pedido)
    }
    if (pathname === '/api/pedidos/mis-pedidos') {
      if (!cuenta) return respuesta(401)
      return respuesta(200, pedidosApi.filter((pedido) => pedido.cliente.id === cuenta.id))
    }
    if (/^\/api\/pedidos\/\d+$/.test(pathname)) {
      if (!cuenta) return respuesta(401)
      const pedido = pedidosApi.find((pedido) => pedido.id === Number(pathname.split('/').pop()))
      if (!pedido || (cuenta.rol !== ROL_ADMINISTRADOR && pedido.cliente.id !== cuenta.id)) return respuesta(404)
      return respuesta(200, pedido)
    }
    if (pathname.startsWith('/api/admin/')) {
      if (!cuenta) return respuesta(401)
      if (cuenta.rol !== ROL_ADMINISTRADOR) return respuesta(403)
      if (pathname === '/api/admin/pedidos') return respuesta(200, pedidosApi)
      if (pathname === '/api/admin/resumen') return respuesta(200, {
        productos: productosApi.length, usuarios: usuarios.size, pedidos: pedidosApi.length,
        pedidosPendientes: pedidosApi.filter((pedido) => pedido.estado === 'PENDIENTE').length,
        productosStockBajo: productosApi.filter((producto) => producto.stock <= 5).length,
      })
      const pedido = pedidosApi.find((pedido) => pedido.id === Number(pathname.split('/')[4]))
      if (!pedido) return respuesta(404)
      if (method === 'PATCH') {
        if (datos.estado === 'CANCELADO' && pedido.estado !== 'CANCELADO') {
          pedido.detalles.forEach((detalle) => {
            productosApi.find((producto) => producto.id === detalle.productoId).stock += detalle.cantidad
          })
        }
        pedido.estado = datos.estado
        return respuesta(200, pedido)
      }
    }
    const coincidencia = /^\/api\/productos(?:\/(\d+))?$/.exec(pathname)
    if (!coincidencia) return respuesta(404)
    const id = Number(coincidencia[1])
    const indice = productosApi.findIndex((producto) => producto.id === id)
    if (method === 'GET') return id
      ? indice === -1 ? respuesta(404) : respuesta(200, productosApi[indice])
      : respuesta(200, productosApi)

    const rol = cuenta?.rol
    if (!rol) return respuesta(401)
    if (rol !== ROL_ADMINISTRADOR) return respuesta(403)
    if (method === 'POST') {
      const producto = { ...datos, id: siguienteId++ }
      productosApi.push(producto)
      return respuesta(201, producto)
    }
    if (indice === -1) return respuesta(404)
    if (method === 'PUT') {
      productosApi[indice] = { ...datos, id }
      return respuesta(200, productosApi[indice])
    }
    if (method === 'DELETE') {
      productosApi.splice(indice, 1)
      return respuesta(204)
    }
    return respuesta(405)
  })
}
