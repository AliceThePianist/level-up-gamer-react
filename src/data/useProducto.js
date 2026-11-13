import { useEffect, useState } from 'react'
import { cargarProducto } from './productos'

export function useProducto(id) {
  const [resultado, setResultado] = useState(null)
  const valido = /^\d+$/.test(id) && Number.isSafeInteger(Number(id)) && Number(id) > 0

  useEffect(() => {
    if (!valido) return
    const solicitud = new AbortController()
    cargarProducto(id, solicitud.signal).then((producto) => {
      if (!solicitud.signal.aborted) setResultado({ id, producto })
    }).catch((error) => {
      if (!solicitud.signal.aborted) {
        setResultado(error.status === 404 ? { id, noEncontrado: true } : { id, error: error.message })
      }
    })
    return () => solicitud.abort()
  }, [id, valido])

  if (!valido) return { noEncontrado: true }
  return resultado?.id === id ? resultado : { cargando: true }
}
