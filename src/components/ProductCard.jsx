import { useState } from 'react'
import { Button, Card } from 'react-bootstrap'
import { Link } from 'react-router-dom'

function ProductCard({ producto, agregarProducto, cantidad = 0, mostrarEnlace = true, mostrarDescripcion = true, tituloAs = 'h2' }) {
  const [agregado, setAgregado] = useState(false)

  function agregar() {
    if (cantidad >= producto.stock) return
    agregarProducto(producto.id)
    setAgregado(true)
  }
  return (
    <Card as="article" className="tarjeta-producto h-100">
      <Card.Img variant="top" src={producto.imagen} alt={producto.nombre} loading="lazy" />
      <Card.Body className="d-flex flex-column">
        <p className="etiqueta small">{producto.categoria}</p>
        <Card.Title as={tituloAs} className="h5 mb-4">{producto.nombre}</Card.Title>
        {mostrarEnlace && <Link to={`/producto/${producto.id}`} className="mb-3" aria-label={`Ver detalle de ${producto.nombre}`}>Ver detalle</Link>}
        {mostrarDescripcion && <Card.Text className="text-secondary">{producto.descripcion}</Card.Text>}
        <p className="precio mt-auto mb-0">${producto.precio.toLocaleString('es-CL')} <span>CLP</span></p>
        <p className="small mt-2 mb-0">{producto.stock === 0 ? 'Sin stock' : `Stock disponible: ${producto.stock}`}</p>
        {cantidad >= producto.stock && producto.stock > 0 && <p className="small">Ya tienes todas las unidades disponibles en el carrito.</p>}
        <Button variant="success" className="mt-3" onClick={agregar} disabled={cantidad >= producto.stock} aria-label={`Agregar ${producto.nombre} al carrito`}>Agregar al carrito</Button>
        <p className="text-success small mt-2 mb-0" role="status">{agregado ? 'Producto agregado al carrito.' : ''}</p>
      </Card.Body>
    </Card>
  )
}

export default ProductCard
