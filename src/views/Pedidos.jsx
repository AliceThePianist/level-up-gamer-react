import { Alert, Table } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { useConsulta } from '../data/useConsulta'
import { nombresEstado } from '../data/estadosPedido'
import EstadoConsulta from '../components/EstadoConsulta'

export default function Pedidos({ solicitarPrivado, administrador = false }) {
  const consulta = useConsulta(administrador ? '/api/admin/pedidos' : '/api/pedidos/mis-pedidos', solicitarPrivado)
  return (
    <>
      <h1>{administrador ? 'Administrar pedidos' : 'Mis pedidos'}</h1>
      <EstadoConsulta {...consulta} />
      {consulta.datos?.length === 0 && <Alert variant="info">Aún no hay pedidos registrados.</Alert>}
      {consulta.datos?.length > 0 && (
        <Table responsive bordered hover className="bg-white align-middle">
          <thead><tr><th>Pedido</th><th>Fecha</th>{administrador && <th>Cliente</th>}<th>Estado</th><th>Total</th><th>Detalle</th></tr></thead>
          <tbody>
            {consulta.datos.map((pedido) => (
              <tr key={pedido.id}>
                <td>#{pedido.id}</td>
                <td>{new Date(pedido.fecha).toLocaleString('es-CL')}</td>
                {administrador && <td>{pedido.cliente.nombre} {pedido.cliente.apellido}</td>}
                <td>{nombresEstado[pedido.estado]}</td>
                <td>${pedido.total.toLocaleString('es-CL')} CLP</td>
                <td><Link to={`${administrador ? '/admin/pedidos' : '/mis-pedidos'}/${pedido.id}`}>Ver pedido #{pedido.id}</Link></td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
      {!administrador && <Link to="/mi-cuenta">Volver a Mi cuenta</Link>}
    </>
  )
}
