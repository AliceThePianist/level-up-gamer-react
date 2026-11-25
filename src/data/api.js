import axios from 'axios'

const baseConfigurada = (import.meta.env.VITE_API_URL ?? (import.meta.env.PROD ? '' : 'http://localhost:8080')).trim()
const direccion = new URL(baseConfigurada || '/', 'http://localhost')
const rutaBase = direccion.pathname.replace(/\/+$/, '').replace(/(?:\/api)+$/, '')
const urlBase = /^https?:\/\//.test(baseConfigurada) ? `${direccion.origin}${rutaBase}` : rutaBase

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
  if (datos instanceof FormData) headers['Content-Type'] = undefined
  if (token) headers.Authorization = `Bearer ${token}`

  try {
    const respuesta = await axios.request({
      baseURL: urlBase, url: ruta, method: metodo, headers, data: datos, signal,
      responseType: 'json',
      transitional: { silentJSONParsing: false },
    })
    if (respuesta.status !== 204) return respuesta.data
  } catch (causa) {
    if (axios.isCancel(causa) || signal?.aborted) {
      throw new DOMException('Solicitud cancelada.', 'AbortError')
    }
    const respuesta = causa.response
    if (!respuesta) {
      if (causa.code === 'ERR_BAD_RESPONSE') throw new Error('El servidor devolvió una respuesta inesperada.')
      throw new Error('No se pudo conectar con el servidor. Inténtalo nuevamente.')
    }
    let mensaje = erroresHttp[respuesta.status] || 'El servidor no pudo completar la solicitud.'
    if ([400, 409].includes(respuesta.status) && typeof respuesta.data?.mensaje === 'string') {
      mensaje = respuesta.data.mensaje
    }
    const error = new Error(mensaje)
    error.status = respuesta.status
    throw error
  }
}
