import { Alert, Button, Card, Col, Container, Row } from 'react-bootstrap'
import { Link } from 'react-router-dom'

function Carrito({ productos, carrito, subtotal, descuento, total, ultimaCompra, aumentarProducto, disminuirProducto, eliminarProducto, comprar }) {
  return (
    <main id="contenido" tabIndex={-1} className="seccion fondo-suave">
      <Container>
        <p className="etiqueta">TU PRÓXIMA PARTIDA</p>
        <h1>Carrito de compras</h1>
        {ultimaCompra !== null && (
          <Alert variant="success" role="status">
            <Alert.Heading>Resumen guardado</Alert.Heading>
            <p>Subtotal registrado: ${ultimaCompra.subtotal.toLocaleString('es-CL')} CLP</p>
            {ultimaCompra.descuento > 0 && <p>Beneficio Duoc aplicado: ${ultimaCompra.descuento.toLocaleString('es-CL')} CLP</p>}
            <p className="mb-0">Total registrado: <strong>${ultimaCompra.total.toLocaleString('es-CL')} CLP</strong>.</p>
          </Alert>
        )}
        <Row className="g-4">
          <Col lg={8}>
            {carrito.length === 0 ? (
              <Alert variant="info">Tu carrito está vacío. Explora el catálogo para agregar productos.</Alert>
            ) : carrito.map((item) => {
              const producto = productos.find((producto) => producto.id === item.id)
              if (!producto) return null
              return (
                <Card as="article" className="mb-3" key={item.id}>
                  <Card.Body>
                    <h2 className="h5">{producto.nombre}</h2>
                    <p>Precio unitario: ${producto.precio.toLocaleString('es-CL')} CLP</p>
                    <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
                      <Button
                        variant="outline-secondary" size="sm" disabled={item.cantidad <= 1}
                        onClick={() => disminuirProducto(item.id)} aria-label={`Disminuir cantidad de ${producto.nombre}`}
                      >−</Button>
                      <p className="mb-0" aria-live="polite">Cantidad: {item.cantidad}</p>
                      <Button
                        variant="outline-secondary" size="sm" disabled={item.cantidad >= producto.stock}
                        onClick={() => aumentarProducto(item.id)} aria-label={`Aumentar cantidad de ${producto.nombre}`}
                      >+</Button>
                    </div>
                    <p className="fw-bold">Subtotal: ${(producto.precio * item.cantidad).toLocaleString('es-CL')} CLP</p>
                    <Button variant="outline-danger" onClick={() => eliminarProducto(item.id)} aria-label={`Eliminar ${producto.nombre} del carrito`}>Eliminar</Button>
                  </Card.Body>
                </Card>
              )
            })}
            <Link to="/productos">Seguir explorando productos</Link>
          </Col>
          <Col lg={4}>
            <Card>
              <Card.Body>
                <h2 className="h4">Resumen de compra</h2>
                <p>Subtotal de compra: ${subtotal.toLocaleString('es-CL')} CLP</p>
                <p>{descuento > 0 ? 'Descuento Duoc (20%)' : 'Descuento'}: ${descuento.toLocaleString('es-CL')} CLP</p>
                <p className="precio">Total: ${total.toLocaleString('es-CL')} <span>CLP</span></p>
                <Button className="w-100" variant="success" onClick={comprar} disabled={carrito.length === 0}>Guardar resumen</Button>
                <p className="small text-secondary mt-2 mb-0">Guarda el total y vacía el carrito. Esta acción no realiza un cobro ni genera un pedido.</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </main>
  )
}

export default Carrito
