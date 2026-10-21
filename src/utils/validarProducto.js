export function validarProducto(producto) {
  const errores = {}
  if (producto.nombre.trim().length < 3) errores.nombre = 'Ingresa un nombre de al menos 3 caracteres.'
  if (!producto.categoria.trim()) errores.categoria = 'Ingresa una categoría.'
  if (producto.descripcion.trim().length < 10) errores.descripcion = 'Ingresa una descripción de al menos 10 caracteres.'
  if (!producto.precio.trim() || !Number.isFinite(Number(producto.precio)) || Number(producto.precio) <= 0) {
    errores.precio = 'Ingresa un precio mayor que cero.'
  }
  if (!producto.stock.trim() || !Number.isSafeInteger(Number(producto.stock)) || Number(producto.stock) < 0) {
    errores.stock = 'Ingresa un stock entero mayor o igual a cero.'
  }
  try {
    const url = new URL(producto.imagen.trim())
    if (!['http:', 'https:'].includes(url.protocol)) throw new Error('Protocolo inválido')
  } catch {
    errores.imagen = 'Ingresa una URL de imagen que comience con http:// o https://.'
  }
  return errores
}
