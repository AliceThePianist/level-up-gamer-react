import { Alert, Button, Card, Col, Container, Row } from 'react-bootstrap'
import { Link } from 'react-router-dom'

function Carrito({ productos, carrito, total, totalCompra, eliminarProducto, comprar }) {
  return (
    <main id="contenido" tabIndex={-1} className="seccion fondo-suave">
      <Container>
        <p className="etiqueta">TU PRÓXIMA PARTIDA</p>
        <h1>Carrito de compras</h1>
        <p className="text-secondary">Compra simulada: no se realizan pagos ni envíos reales.</p>
        {totalCompra !== null && (
          <Alert variant="success" role="status">
            <Alert.Heading>¡Compra simulada realizada!</Alert.Heading>
            <p className="mb-0">Total de la última compra: <strong>${totalCompra.toLocaleString('es-CL')} CLP</strong>.</p>
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
                    <p>Cantidad: {item.cantidad}</p>
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
                <p className="precio">Total: ${total.toLocaleString('es-CL')} <span>CLP</span></p>
                <Button className="w-100" variant="success" onClick={comprar} disabled={carrito.length === 0}>Comprar</Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </main>
  )
}

export default Carrito
