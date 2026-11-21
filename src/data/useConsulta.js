import { useCallback, useEffect, useState } from 'react'

export function useConsulta(ruta, solicitarPrivado) {
  const [resultado, setResultado] = useState(null)
  const [intento, setIntento] = useState(0)
  useEffect(() => {
    const solicitud = new AbortController()
    solicitarPrivado(ruta, { signal: solicitud.signal }).then((datos) => {
      if (!solicitud.signal.aborted) setResultado({ ruta, intento, datos })
    }).catch((error) => {
      if (!solicitud.signal.aborted) setResultado({ ruta, intento, error: error.message })
    })
    return () => solicitud.abort()
  }, [ruta, intento, solicitarPrivado])

  const recargar = useCallback(() => setIntento((actual) => actual + 1), [])
  function actualizar(datos) {
    setResultado({ ruta, intento, datos })
  }
  const actual = resultado?.ruta === ruta && resultado.intento === intento ? resultado : { cargando: true }
  return { ...actual, recargar, actualizar }
}
