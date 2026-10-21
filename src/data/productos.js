import { productosIniciales } from './productosIniciales'

export function cargarProductos() {
  try {
    const guardados = localStorage.getItem('levelup-productos-demo')
    const productos = guardados === null ? productosIniciales : JSON.parse(guardados)
    if (!Array.isArray(productos) || productos.some((producto) =>
      !producto || !Number.isSafeInteger(producto.id) || producto.id < 1 ||
      typeof producto.nombre !== 'string' || typeof producto.categoria !== 'string' ||
      typeof producto.descripcion !== 'string' || typeof producto.imagen !== 'string' ||
      !Number.isFinite(producto.precio) || producto.precio <= 0 ||
      !Number.isSafeInteger(producto.stock) || producto.stock < 0,
    ) || new Set(productos.map((producto) => producto.id)).size !== productos.length) {
      throw new Error('Catálogo inválido')
    }
    return {
      productos: productos.map((producto) => {
        // Vite cambia la URL de los recursos al compilar; resolver las imágenes originales actuales.
        const inicial = productosIniciales.find((inicial) => inicial.id === producto.id)
        return inicial ? { ...producto, imagen: inicial.imagen } : producto
      }),
      error: '',
    }
  } catch {
    return { productos: [], error: 'No se pudo leer el catálogo guardado. Revisa el almacenamiento del navegador; no se sobrescribieron sus datos.' }
  }
}

export function guardarProductos(productos) {
  localStorage.setItem('levelup-productos-demo', JSON.stringify(productos))
}
