import { afterEach, beforeEach, expect, test, vi } from 'vitest'

let axios
let peticion

beforeEach(async () => {
  vi.resetModules()
  axios = (await import('axios')).default
  peticion = vi.spyOn(axios, 'request').mockResolvedValue({ status: 200, data: [] })
})

afterEach(() => vi.unstubAllEnvs())

test.each([
  ['http://localhost:8080', 'http://localhost:8080/api/productos'],
  ['http://localhost:8080/api/', 'http://localhost:8080/api/productos'],
  ['http://localhost:8080/api/api', 'http://localhost:8080/api/productos'],
  ['/api', '/api/productos'],
  ['', '/api/productos'],
  ['http://api', 'http://api/api/productos'],
])('la base %s produce una sola ruta API', async (base, esperada) => {
  vi.stubEnv('VITE_API_URL', base)
  const { solicitar, urlImagen } = await import('../data/api')
  await solicitar('/api/productos')
  expect(axios.getUri(peticion.mock.calls[0][0])).toBe(esperada)
  expect(urlImagen('/api/imagenes/producto.png')).toBe(esperada.replace('/productos', '/imagenes/producto.png'))
  expect(urlImagen('/catalogo/catan.jpg')).toBe('/catalogo/catan.jpg')
})

test('producción usa el mismo origen cuando no se configura una URL', async () => {
  vi.stubEnv('VITE_API_URL', undefined)
  vi.stubEnv('PROD', true)
  const { solicitar } = await import('../data/api')
  await solicitar('/api/productos')
  expect(axios.getUri(peticion.mock.calls[0][0])).toBe('/api/productos')
})

test('la respuesta 204 de DELETE devuelve undefined', async () => {
  peticion.mockResolvedValueOnce({ status: 204, data: '' })
  const { solicitar } = await import('../data/api')
  await expect(solicitar('/api/productos/8', { metodo: 'DELETE', token: 'token-local' })).resolves.toBeUndefined()
  expect(peticion.mock.calls[0][0]).toMatchObject({ method: 'DELETE', url: '/api/productos/8' })
})

test('conserva FormData y el navegador puede asignar el límite multipart', async () => {
  const datos = new FormData()
  datos.append('archivo', new File(['imagen'], 'producto.png', { type: 'image/png' }))
  const { solicitar } = await import('../data/api')
  await solicitar('/api/imagenes', { metodo: 'POST', datos, token: 'token-local' })
  const config = peticion.mock.calls[0][0]
  expect(config.data).toBe(datos)
  expect(config.headers['Content-Type']).toBeUndefined()
  expect(config.headers.Authorization).toBe('Bearer token-local')
  await solicitar('/api/productos')
  expect(peticion.mock.calls[1][0].headers.Authorization).toBeUndefined()
})

test.each([401, 403])('conserva el estado HTTP %s para el control de sesión', async (status) => {
  peticion.mockRejectedValueOnce(new axios.AxiosError('Acceso rechazado', undefined, undefined, undefined, { status, data: {} }))
  const { solicitar } = await import('../data/api')
  await expect(solicitar('/api/productos')).rejects.toMatchObject({ status })
})

test('preserva AbortError cuando se cancela una consulta', async () => {
  peticion.mockRejectedValueOnce(new axios.CanceledError())
  const { solicitar } = await import('../data/api')
  await expect(solicitar('/api/productos')).rejects.toMatchObject({ name: 'AbortError' })
})
