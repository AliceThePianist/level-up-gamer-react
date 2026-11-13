const urlBase = (import.meta.env.VITE_API_URL ?? 'http://localhost:8080').replace(/\/+$/, '')

const erroresHttp = {
  400: 'Revisa los datos enviados.',
  401: 'Tu sesión terminó. Vuelve a iniciar sesión.',
  403: 'Tu cuenta no tiene permiso para realizar esta acción.',
  404: 'El recurso solicitado no está disponible.',
  409: 'Ya existe un registro con estos datos.',
}

export function urlImagen(referencia) {
  return referencia.startsWith('/api/imagenes/') ? `${urlBase}${referencia}` : referencia
}

export async function solicitar(ruta, { metodo = 'GET', datos, token, signal } = {}) {
  const headers = { Accept: 'application/json' }
  const esFormulario = datos instanceof FormData
  if (datos !== undefined && !esFormulario) headers['Content-Type'] = 'application/json'
  if (token) headers.Authorization = `Bearer ${token}`

  let respuesta
  try {
    respuesta = await fetch(`${urlBase}${ruta}`, {
      method: metodo, headers, body: esFormulario ? datos : JSON.stringify(datos), signal,
    })
  } catch (error) {
    if (error.name === 'AbortError') throw error
    throw new Error('No se pudo conectar con el servidor. Inténtalo nuevamente.')
  }
  if (!respuesta.ok) {
    const error = new Error(erroresHttp[respuesta.status] || 'El servidor no pudo completar la solicitud.')
    error.status = respuesta.status
    throw error
  }
  if (respuesta.status === 204) return
  try {
    return await respuesta.json()
  } catch (error) {
    if (error.name === 'AbortError') throw error
    throw new Error('El servidor devolvió una respuesta inesperada.')
  }
}
