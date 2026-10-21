import { Alert } from 'react-bootstrap'
import { Link, useParams } from 'react-router-dom'
import FormularioProducto from '../../components/FormularioProducto'

export default function AdminEditarProducto({ productos, editarProducto }) {
  const { id } = useParams()
  const producto = productos.find((producto) => producto.id === Number(id))
  if (!producto) return <Alert variant="warning">Producto no encontrado. <Link to="/admin/productos">Volver al listado</Link></Alert>
  return <FormularioProducto key={producto.id} productoInicial={producto} editando guardarProducto={(datos) => editarProducto(producto.id, datos)} />
}
