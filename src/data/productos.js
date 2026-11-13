import { solicitar } from './api'

const ruta = '/api/productos'

export async function cargarProductos(signal) {
  const productos = await solicitar(ruta, { signal })
  if (!Array.isArray(productos)) throw new Error('El servidor devolvió un catálogo inválido.')
  return productos
}

export function cargarProducto(id, signal) {
  return solicitar(`${ruta}/${id}`, { signal })
}

export function crearProducto(datos, token) {
  return solicitar(ruta, { metodo: 'POST', datos, token })
}

export function actualizarProducto(id, datos, token) {
  return solicitar(`${ruta}/${id}`, { metodo: 'PUT', datos, token })
}

export function borrarProducto(id, token) {
  return solicitar(`${ruta}/${id}`, { metodo: 'DELETE', token })
}
