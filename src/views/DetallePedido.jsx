import { useState } from 'react'
import { Alert, Button, Card, Form, Modal, Table } from 'react-bootstrap'
import { Link, useParams } from 'react-router-dom'
import { useConsulta } from '../data/useConsulta'
import { nombresEstado, cambiosPermitidos } from '../data/estadosPedido'
import EstadoConsulta from '../components/EstadoConsulta'

export default function DetallePedido({ solicitarPrivado, administrador = false, alCambiarEstado }) {
  const { id } = useParams()
  const consulta = useConsulta(`/api/pedidos/${id}`, solicitarPrivado)
  const [nuevoEstado, setNuevoEstado] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [confirmar, setConfirmar] = useState(false)
  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState('')
  const pedido = consulta.datos
  const opciones = cambiosPermitidos[pedido?.estado] || []

  async function cambiarEstado() {
    if (guardando || !opciones.includes(nuevoEstado)) return
    setGuardando(true)
    setError('')
    setMensaje('')
    try {
      const actualizado = await solicitarPrivado(`/api/admin/pedidos/${id}/estado`, {
        metodo: 'PATCH', datos: { estado: nuevoEstado },
      })
      consulta.actualizar(actualizado)
      setNuevoEstado('')
      setMensaje('Estado actualizado.')
      alCambiarEstado()
    } catch (error) {
      setError(error.message)
    } finally {
      setGuardando(false)
      setConfirmar(false)
    }
  }

  function guardar(event) {
    event.preventDefault()
    if (!opciones.includes(nuevoEstado) || guardando) return
    if (nuevoEstado === 'CANCELADO') setConfirmar(true)
    else cambiarEstado()
  }

  return (
    <>
      <Link to={administrador ? '/admin/pedidos' : '/mis-pedidos'} className="d-inline-block mb-3">Volver a pedidos</Link>
      <EstadoConsulta {...consulta} />
      {pedido && (
        <>
          <h1>Pedido #{pedido.id}</h1>
          <p>{new Date(pedido.fecha).toLocaleString('es-CL')}</p>
          {administrador && <p>Cliente: {pedido.cliente.nombre} {pedido.cliente.apellido}</p>}
          <p>Estado: <strong>{nombresEstado[pedido.estado]}</strong></p>
          <p className="text-secondary">Pago no realizado</p>
          <Table responsive bordered className="bg-white">
            <thead><tr><th>Producto</th><th>Precio unitario</th><th>Cantidad</th><th>Subtotal</th></tr></thead>
            <tbody>
              {pedido.detalles.map((detalle) => (
                <tr key={detalle.id}>
                  <td>{detalle.nombreProducto}</td>
                  <td>${detalle.precioUnitario.toLocaleString('es-CL')} CLP</td>
                  <td>{detalle.cantidad}</td><td>${detalle.subtotal.toLocaleString('es-CL')} CLP</td>
                </tr>
              ))}
            </tbody>
          </Table>
          <Card className="mb-4"><Card.Body>
            <p>Subtotal: ${pedido.subtotal.toLocaleString('es-CL')} CLP</p>
            <p>Descuento aplicado: ${pedido.descuento.toLocaleString('es-CL')} CLP</p>
            <p className="precio mb-0">Total: ${pedido.total.toLocaleString('es-CL')} CLP</p>
          </Card.Body></Card>
          {administrador && opciones.length > 0 && (
            <Form onSubmit={guardar} className="bg-white border rounded p-3">
              <Form.Group controlId="estado-pedido" className="mb-3">
                <Form.Label>Nuevo estado</Form.Label>
                <Form.Select value={nuevoEstado} onChange={(event) => setNuevoEstado(event.target.value)} disabled={guardando} required>
                  <option value="">Selecciona un estado</option>
                  {opciones.map((estado) => <option key={estado} value={estado}>{nombresEstado[estado]}</option>)}
                </Form.Select>
              </Form.Group>
              <Button type="submit" variant="success" disabled={guardando || !opciones.includes(nuevoEstado)}>{guardando ? 'Guardando…' : 'Actualizar estado'}</Button>
            </Form>
          )}
          {mensaje && <Alert variant="success" role="status" className="mt-3">{mensaje}</Alert>}
          {error && <Alert variant="danger" className="mt-3">{error} Actualiza la página para consultar el estado actual.</Alert>}
          <Modal show={confirmar} onHide={() => { if (!guardando) setConfirmar(false) }} centered aria-labelledby="cancelar-pedido">
            <Modal.Header closeButton={!guardando}><Modal.Title id="cancelar-pedido">Cancelar pedido #{pedido.id}</Modal.Title></Modal.Header>
            <Modal.Body>Se devolverán las unidades al inventario. El pedido quedará cancelado.</Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" disabled={guardando} onClick={() => setConfirmar(false)}>Volver</Button>
              <Button variant="danger" disabled={guardando} onClick={cambiarEstado}>Confirmar cancelación</Button>
            </Modal.Footer>
          </Modal>
        </>
      )}
    </>
  )
}
