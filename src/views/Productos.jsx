import { Col, Container, Row } from 'react-bootstrap'
import ProductCard from '../components/ProductCard'
import { productosIniciales } from '../data/productosIniciales'

function Productos() {
  return (
    <main id="contenido" tabIndex={-1} className="seccion fondo-suave">
      <Container>
        <p className="etiqueta">TU SIGUIENTE NIVEL COMIENZA AQUÍ</p>
        <h1>Catálogo de productos</h1>
        <p className="text-secondary">Conoce nuestra selección de juegos, accesorios y equipos gamers. Compras próximamente.</p>
        <p className="mb-4">{productosIniciales.length} productos disponibles para explorar</p>
        <Row className="g-4">
          {productosIniciales.map((producto) => (
            <Col key={producto.id} xs={12} md={6} lg={4}>
              <ProductCard producto={producto} />
            </Col>
          ))}
        </Row>
      </Container>
    </main>
  )
}

export default Productos
