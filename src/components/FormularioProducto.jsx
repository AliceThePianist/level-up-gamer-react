import { useEffect, useRef, useState } from 'react'
import { Alert, Button, Form, Image } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { urlImagen } from '../data/api'
import { validarImagen, validarProducto } from '../utils/validarProducto'

const inicial = { nombre: '', categoria: '', precio: '', descripcion: '', imagen: '', stock: '' }
const campos = [
  { nombre: 'nombre', etiqueta: 'Nombre' },
  { nombre: 'categoria', etiqueta: 'Categoría' },
  { nombre: 'precio', etiqueta: 'Precio CLP', tipo: 'number', min: 0.01, step: 'any' },
  { nombre: 'descripcion', etiqueta: 'Descripción' },
  { nombre: 'stock', etiqueta: 'Stock', tipo: 'number', min: 0, step: 1 },
]

function FormularioProducto({ productoInicial = inicial, guardarProducto, subirImagen, editando = false }) {
  const [producto, setProducto] = useState({ ...productoInicial, precio: String(productoInicial.precio), stock: String(productoInicial.stock) })
  const [archivo, setArchivo] = useState(null)
  const [vistaPrevia, setVistaPrevia] = useState('')
  const [imagenCargada, setImagenCargada] = useState('')
  const [errores, setErrores] = useState({})
  const [mensaje, setMensaje] = useState('')
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)
  const selector = useRef(null)

  useEffect(() => {
    if (vistaPrevia) return () => URL.revokeObjectURL(vistaPrevia)
  }, [vistaPrevia])

  function seleccionarImagen(event) {
    const seleccion = event.target.files[0]
    const errorImagen = seleccion ? validarImagen(seleccion) : ''
    setErrores((actual) => ({ ...actual, imagen: errorImagen }))
    setImagenCargada('')
    setVistaPrevia(seleccion && !errorImagen ? URL.createObjectURL(seleccion) : '')
    setArchivo(seleccion || null)
    setMensaje('')
    setError('')
  }

  function quitarSeleccion() {
    selector.current.value = ''
    setArchivo(null)
    setImagenCargada('')
    setVistaPrevia('')
    setErrores((actual) => ({ ...actual, imagen: '' }))
    setError('')
  }

  async function guardar(event) {
    event.preventDefault()
    if (enviando) return
    setMensaje('')
    setError('')
    const nuevosErrores = validarProducto(producto)
    if (errores.imagen) nuevosErrores.imagen = errores.imagen
    else if (!archivo && !producto.imagen) nuevosErrores.imagen = 'Selecciona una imagen del producto.'
    setErrores(nuevosErrores)
    if (Object.keys(nuevosErrores).length > 0) return
    setEnviando(true)
    try {
      let imagen = imagenCargada || producto.imagen
      if (archivo && !imagenCargada) {
        try {
          imagen = await subirImagen(archivo)
          setImagenCargada(imagen)
        } catch (error) {
          setError(`No se pudo cargar la imagen. ${error.message}`)
          return
        }
      }
      await guardarProducto({
        nombre: producto.nombre.trim(), categoria: producto.categoria.trim(),
        descripcion: producto.descripcion.trim(), imagen,
        precio: Number(producto.precio), stock: Number(producto.stock),
      })
      quitarSeleccion()
      setProducto(editando ? { ...producto, imagen } : inicial)
      setMensaje(editando ? 'Producto actualizado.' : 'Producto agregado al catálogo.')
    } catch (error) {
      setError(error.message)
    } finally {
      setEnviando(false)
    }
  }

  const imagenVisible = vistaPrevia || urlImagen(producto.imagen)
  return (
    <>
      <h1>{editando ? 'Editar producto' : 'Agregar producto'}</h1>
      {mensaje && <Alert variant="success" role="status">{mensaje}</Alert>}
      {error && <Alert variant="danger">{error}</Alert>}
      <Form noValidate onSubmit={guardar} className="bg-white border rounded p-3">
        <fieldset disabled={enviando}>
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
          <Form.Group controlId="producto-imagen" className="mb-3">
            <Form.Label>Imagen del producto</Form.Label>
            <Form.Control type="file" ref={selector} onChange={seleccionarImagen}
              accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp" required={!producto.imagen}
              isInvalid={!!errores.imagen} aria-describedby="ayuda-imagen error-imagen" />
            <Form.Control.Feedback type="invalid" id="error-imagen">{errores.imagen}</Form.Control.Feedback>
            <Form.Text id="ayuda-imagen">JPG, PNG o WebP. Máximo 5 MB.{editando && ' Si dejas el campo vacío, se conserva la imagen actual.'}</Form.Text>
            {imagenVisible && (
              <div className="mt-2">
                <Image src={imagenVisible} alt={vistaPrevia ? 'Vista previa de la imagen seleccionada' : 'Imagen actual del producto'} thumbnail width={160} />
              </div>
            )}
            {archivo && (
              <Button className="mt-2" size="sm" variant="outline-secondary" onClick={quitarSeleccion}>Quitar selección</Button>
            )}
          </Form.Group>
          <Button type="submit" variant="success">{enviando ? 'Guardando…' : 'Guardar producto'}</Button>
        </fieldset>
      </Form>
      <Link to="/admin/productos" className="d-inline-block mt-3">Volver al listado</Link>
    </>
  )
}

export default FormularioProducto
