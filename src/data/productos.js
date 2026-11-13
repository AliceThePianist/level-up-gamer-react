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

export async function subirImagen(archivo, token) {
  const datos = new FormData()
  datos.append('archivo', archivo)
  try {
    const { imagen } = await solicitar('/api/imagenes', { metodo: 'POST', datos, token })
    return imagen
  } catch (error) {
    if (error.status === 413) error.message = 'La imagen supera el límite de 5 MB.'
    if (error.status === 415) error.message = 'El archivo debe ser una imagen JPG, PNG o WebP válida.'
    throw error
  }
}

export function borrarProducto(id, token) {
  return solicitar(`${ruta}/${id}`, { metodo: 'DELETE', token })
}
