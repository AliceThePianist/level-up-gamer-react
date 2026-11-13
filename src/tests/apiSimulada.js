import { vi } from 'vitest'
import { productosIniciales } from '../data/productosIniciales'
import { ROL_ADMINISTRADOR, ROL_CLIENTE } from '../data/roles'

export const productosApi = []
export const correoAdministrador = 'administrador@example.test'
export const claveAdministrador = crypto.randomUUID()
const usuarios = new Map()
const tokens = new Map()
let siguienteId

function respuesta(status, datos) {
  return { status, ok: status >= 200 && status < 300, json: async () => structuredClone(datos) }
}

export function simularApi() {
  productosApi.splice(0, productosApi.length, ...structuredClone(productosIniciales))
  siguienteId = Math.max(...productosApi.map(({ id }) => id)) + 1
  usuarios.clear()
  tokens.clear()
  usuarios.set(correoAdministrador, { id: 1, nombre: 'Administrador', rol: ROL_ADMINISTRADOR, descuento: 0, contrasena: claveAdministrador })
  vi.stubGlobal('fetch', vi.fn(async (url, { method, body, headers, signal }) => {
    signal?.throwIfAborted()
    const { pathname } = new URL(url)
    const datos = typeof body === 'string' ? JSON.parse(body) : undefined

    if (pathname === '/api/imagenes') {
      if (tokens.get(headers.Authorization) !== ROL_ADMINISTRADOR) return respuesta(403)
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
      tokens.set(`Bearer ${token}`, usuario.rol)
      return respuesta(200, { usuario, token, tipoToken: 'Bearer', expiraEn: 3600 })
    }

    const coincidencia = /^\/api\/productos(?:\/(\d+))?$/.exec(pathname)
    if (!coincidencia) return respuesta(404)
    const id = Number(coincidencia[1])
    const indice = productosApi.findIndex((producto) => producto.id === id)
    if (method === 'GET') return id
      ? indice === -1 ? respuesta(404) : respuesta(200, productosApi[indice])
      : respuesta(200, productosApi)

    const rol = tokens.get(headers.Authorization)
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
  }))
}
