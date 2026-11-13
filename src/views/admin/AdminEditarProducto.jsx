import { Alert } from 'react-bootstrap'
import { Link, useParams } from 'react-router-dom'
import FormularioProducto from '../../components/FormularioProducto'
import { useProducto } from '../../data/useProducto'

export default function AdminEditarProducto({ editarProducto }) {
  const { id } = useParams()
  const { producto, cargando, error, noEncontrado } = useProducto(id)
  if (cargando) return <Alert variant="info" role="status">Cargando producto…</Alert>
  if (error) return <Alert variant="danger">{error}</Alert>
  if (noEncontrado) return <Alert variant="warning">Producto no encontrado. <Link to="/admin/productos">Volver al listado</Link></Alert>
  return <FormularioProducto key={producto.id} productoInicial={producto} editando guardarProducto={(datos) => editarProducto(producto.id, datos)} />
}
