import { useState } from 'react'
import { Col, Container, Form, Row } from 'react-bootstrap'
import ProductCard from '../components/ProductCard'

function Productos({ productos, carrito, agregarProducto, disponible }) {
  const [busqueda, setBusqueda] = useState('')
  const [categoria, setCategoria] = useState('')
  const texto = busqueda.trim().toLowerCase()
  const categorias = [...new Set(productos.map((producto) => producto.categoria))].sort()
  const resultados = productos.filter((producto) =>
    (!categoria || producto.categoria === categoria) &&
    `${producto.nombre} ${producto.descripcion}`.toLowerCase().includes(texto),
  )

  return (
    <main id="contenido" tabIndex={-1} className="seccion fondo-suave">
      <Container>
        <p className="etiqueta">TU SIGUIENTE NIVEL COMIENZA AQUÍ</p>
        <h1>Catálogo de productos</h1>
        <p className="text-secondary">Encuentra juegos, accesorios y equipos para tu próxima partida.</p>
        <Row className="g-3 mb-4">
          <Col sm={7}>
            <Form.Group controlId="buscar-producto">
              <Form.Label>Buscar productos</Form.Label>
              <Form.Control type="search" value={busqueda} onChange={(event) => setBusqueda(event.target.value)} />
            </Form.Group>
          </Col>
          <Col sm={5}>
            <Form.Group controlId="filtrar-categoria">
              <Form.Label>Categoría</Form.Label>
              <Form.Select value={categoria} onChange={(event) => setCategoria(event.target.value)}>
                <option value="">Todas las categorías</option>
                {categorias.map((nombre) => <option key={nombre}>{nombre}</option>)}
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>
        {disponible && <p className="mb-4">{resultados.length ? `${resultados.length} productos disponibles para explorar` : 'No se encontraron productos.'}</p>}
        <Row className="g-4">
          {resultados.map((producto) => (
            <Col key={producto.id} xs={12} md={6} lg={4}>
              <ProductCard cantidad={carrito.find((item) => item.id === producto.id)?.cantidad || 0} producto={producto} agregarProducto={agregarProducto} />
            </Col>
          ))}
        </Row>
      </Container>
    </main>
  )
}

export default Productos
