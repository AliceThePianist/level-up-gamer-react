import { Alert, Button } from 'react-bootstrap'

export default function EstadoConsulta({ cargando, error, recargar }) {
  if (cargando) return <Alert variant="info" role="status">Cargando…</Alert>
  if (error) return <Alert variant="danger">{error}{' '}<Button variant="outline-danger" size="sm" onClick={recargar}>Reintentar</Button></Alert>
  return null
}
