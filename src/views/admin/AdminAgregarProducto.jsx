import { useState } from 'react'
import { Alert, Button, Form } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { validarProducto } from '../../utils/validarProducto'

const inicial = { nombre: '', categoria: '', precio: '', descripcion: '', imagen: '', stock: '' }
const campos = [
  { nombre: 'nombre', etiqueta: 'Nombre' },
  { nombre: 'categoria', etiqueta: 'Categoría' },
  { nombre: 'precio', etiqueta: 'Precio CLP', tipo: 'number', min: 0.01, step: 'any' },
  { nombre: 'descripcion', etiqueta: 'Descripción' },
  { nombre: 'imagen', etiqueta: 'URL de la imagen', tipo: 'url' },
  { nombre: 'stock', etiqueta: 'Stock', tipo: 'number', min: 0, step: 1 },
]

function AdminAgregarProducto({ agregarProducto }) {
  const [producto, setProducto] = useState(inicial)
  const [errores, setErrores] = useState({})
  const [mensaje, setMensaje] = useState('')
  const [error, setError] = useState('')

  function guardar(event) {
    event.preventDefault()
    setMensaje('')
    setError('')
    const nuevosErrores = validarProducto(producto)
    setErrores(nuevosErrores)
    if (Object.keys(nuevosErrores).length > 0) return
    try {
      agregarProducto({
        nombre: producto.nombre.trim(), categoria: producto.categoria.trim(),
        descripcion: producto.descripcion.trim(), imagen: producto.imagen.trim(),
        precio: Number(producto.precio), stock: Number(producto.stock),
      })
      setProducto(inicial)
      setMensaje('Producto agregado correctamente. Ya está disponible en el catálogo.')
    } catch {
      setError('No se pudo guardar el producto. Revisa el almacenamiento del navegador.')
    }
  }

  return (
    <>
      <h1>Agregar producto</h1>
      {mensaje && <Alert variant="success" role="status">{mensaje}</Alert>}
      {error && <Alert variant="danger">{error}</Alert>}
      <Form noValidate onSubmit={guardar} className="bg-white border rounded p-3">
        {campos.map((campo) => (
          <Form.Group controlId={`producto-${campo.nombre}`} className="mb-3" key={campo.nombre}>
            <Form.Label>{campo.etiqueta}</Form.Label>
            <Form.Control as={campo.nombre === 'descripcion' ? 'textarea' : 'input'} type={campo.tipo || 'text'} min={campo.min} step={campo.step}
              value={producto[campo.nombre]} name={campo.nombre} required isInvalid={!!errores[campo.nombre]}
              aria-describedby={`error-${campo.nombre}`} onChange={(event) => {
                setProducto({ ...producto, [event.target.name]: event.target.value })
                setMensaje('')
              }} />
            <Form.Control.Feedback type="invalid" id={`error-${campo.nombre}`}>{errores[campo.nombre]}</Form.Control.Feedback>
          </Form.Group>
        ))}
        <Button type="submit" variant="success">Guardar producto</Button>
      </Form>
      <Link to="/admin/productos" className="d-inline-block mt-3">Volver al listado</Link>
    </>
  )
}

export default AdminAgregarProducto
