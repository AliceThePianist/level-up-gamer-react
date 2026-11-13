import { Alert, Col, Container, Row } from 'react-bootstrap'
import { Link, useParams } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import { useProducto } from '../data/useProducto'

function DetalleProducto({ carrito, agregarProducto }) {
  const { id } = useParams()
  const { producto, cargando, error, noEncontrado } = useProducto(id)
  return (
    <main id="contenido" tabIndex={-1} className="seccion fondo-suave">
      <Container>
        <Link to="/productos" className="d-inline-block mb-3">Volver al catálogo</Link>
        {cargando && <Alert variant="info" role="status">Cargando producto…</Alert>}
        {error && <Alert variant="danger">{error}</Alert>}
        {noEncontrado && <Alert variant="warning"><h1 className="h4">Producto no encontrado</h1>El producto solicitado no está disponible en el catálogo.</Alert>}
        {producto && (
          <Row className="justify-content-center">
            <Col md={8} lg={6}>
              <ProductCard key={producto.id} producto={producto} cantidad={carrito.find((item) => item.id === producto.id)?.cantidad || 0} agregarProducto={(id) => agregarProducto(id, producto)} tituloAs="h1" mostrarEnlace={false} />
            </Col>
          </Row>
        )}
      </Container>
    </main>
  )
}

export default DetalleProducto
