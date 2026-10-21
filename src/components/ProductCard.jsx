import { Card } from 'react-bootstrap'

// Recibe el producto completo para poder asociarlo al evento Agregar en una etapa posterior.
function ProductCard({ producto, mostrarDescripcion = true, tituloAs = 'h2' }) {
  return (
    <Card as="article" className="tarjeta-producto h-100">
      <Card.Img variant="top" src={producto.imagen} alt={producto.nombre} loading="lazy" />
      <Card.Body className="d-flex flex-column">
        <p className="etiqueta small">{producto.categoria}</p>
        <Card.Title as={tituloAs} className="h5 mb-4">{producto.nombre}</Card.Title>
        {mostrarDescripcion && <Card.Text className="text-secondary">{producto.descripcion}</Card.Text>}
        <p className="precio mt-auto mb-0">${producto.precio.toLocaleString('es-CL')} <span>CLP</span></p>
      </Card.Body>
    </Card>
  )
}

export default ProductCard
