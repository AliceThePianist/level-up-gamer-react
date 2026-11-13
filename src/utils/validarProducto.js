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
  return errores
}

export function validarImagen(archivo) {
  const tipos = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp' }
  const extension = /\.([^.]+)$/.exec(archivo.name.toLowerCase())?.[1]
  if (!tipos[extension] || archivo.type !== tipos[extension]) return 'Selecciona una imagen JPG, PNG o WebP.'
  if (archivo.size === 0) return 'El archivo de imagen está vacío.'
  if (archivo.size > 5 * 1024 * 1024) return 'La imagen supera el límite de 5 MB.'
  return ''
}
