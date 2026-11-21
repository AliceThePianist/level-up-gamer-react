import { Card, Col, Row } from 'react-bootstrap'
import { useConsulta } from '../../data/useConsulta'
import EstadoConsulta from '../../components/EstadoConsulta'

const indicadores = [
  ['productos', 'Productos'],
  ['usuarios', 'Usuarios registrados'],
  ['pedidos', 'Pedidos'],
  ['pedidosPendientes', 'Pedidos pendientes'],
  ['productosStockBajo', 'Productos con 5 unidades o menos'],
]

export default function ResumenAdmin({ solicitarPrivado }) {
  const consulta = useConsulta('/api/admin/resumen', solicitarPrivado)
  return (
    <>
      <h1>Resumen administrativo</h1>
      <EstadoConsulta {...consulta} />
      {consulta.datos && <Row className="g-3">
        {indicadores.map(([campo, titulo]) => <Col key={campo} sm={6} xl={4}>
          <Card className="h-100"><Card.Body><h2 className="h6">{titulo}</h2><p className="display-6 mb-0">{consulta.datos[campo]}</p></Card.Body></Card>
        </Col>)}
      </Row>}
    </>
  )
}
