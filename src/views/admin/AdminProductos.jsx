import { useState } from 'react'
import { Alert, Button, Modal, Table } from 'react-bootstrap'
import { Link } from 'react-router-dom'

function AdminProductos({ productos, eliminarProducto }) {
  const [mensaje, setMensaje] = useState('')
  const [error, setError] = useState('')
  const [seleccionado, setSeleccionado] = useState(null)

  function eliminar() {
    if (!seleccionado) return
    setMensaje('')
    setError('')
    try {
      eliminarProducto(seleccionado.id)
      setMensaje(`Se eliminó ${seleccionado.nombre} del catálogo y del carrito.`)
      setSeleccionado(null)
    } catch {
      setSeleccionado(null)
      setError('No se pudo eliminar el producto. Revisa el almacenamiento del navegador.')
    }
  }

  return (
    <>
      <h1>Administrar productos</h1>
      <Button as={Link} to="/admin/productos/nuevo" variant="success" className="mb-3">Nuevo producto</Button>
      {mensaje && <Alert variant="success" role="status">{mensaje}</Alert>}
      {error && <Alert variant="danger">{error}</Alert>}
      {productos.length === 0 ? <Alert variant="info">No hay productos en el catálogo.</Alert> : (
        <Table responsive bordered hover className="align-middle">
          <thead><tr><th>ID</th><th>Nombre</th><th>Categoría</th><th>Precio CLP</th><th>Stock</th><th>Acciones</th></tr></thead>
          <tbody>
            {productos.map((producto) => (
              <tr key={producto.id}>
                <td>{producto.id}</td><td>{producto.nombre}</td><td>{producto.categoria}</td>
                <td>${producto.precio.toLocaleString('es-CL')}</td><td>{producto.stock}</td>
                <td><Button size="sm" variant="outline-danger" onClick={() => setSeleccionado(producto)} aria-label={`Eliminar ${producto.nombre}`}>Eliminar</Button></td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
      <Modal show={seleccionado !== null} onHide={() => setSeleccionado(null)} centered aria-labelledby="titulo-eliminar">
        <Modal.Header closeButton><Modal.Title id="titulo-eliminar">Confirmar eliminación</Modal.Title></Modal.Header>
        <Modal.Body>¿Eliminar {seleccionado?.nombre}? También se retirará del carrito si está agregado.</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setSeleccionado(null)}>Cancelar</Button>
          <Button variant="danger" onClick={eliminar}>Confirmar eliminación</Button>
        </Modal.Footer>
      </Modal>
    </>
  )
}

export default AdminProductos
