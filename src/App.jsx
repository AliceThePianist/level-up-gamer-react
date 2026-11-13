import { useEffect, useState } from 'react'
import { Alert, Button, Container } from 'react-bootstrap'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './views/Home'
import Productos from './views/Productos'
import Carrito from './views/Carrito'
import Registro from './views/Registro'
import Login from './views/Login'
import { leerSesion, eliminarSesion, eliminarUsuariosLocales } from './data/sesion'
import { ROL_ADMINISTRADOR, ROL_CLIENTE } from './data/roles'
import { cargarProductos, crearProducto, actualizarProducto, borrarProducto, subirImagen } from './data/productos'
import AdminLayout from './views/admin/AdminLayout'
import AdminProductos from './views/admin/AdminProductos'
import AdminAgregarProducto from './views/admin/AdminAgregarProducto'
import AdminEditarProducto from './views/admin/AdminEditarProducto'
import DetalleProducto from './views/DetalleProducto'

function App() {
  const [productos, setProductos] = useState([])
  const [catalogo, setCatalogo] = useState({ cargando: true, error: '' })
  const [intento, setIntento] = useState(0)
  const [usuarioSesion, setUsuarioSesion] = useState(leerSesion)
  const [errorSesion, setErrorSesion] = useState('')

  // Solo guardamos identificador y cantidad; los datos del producto tienen una única fuente.
  const [carrito, setCarrito] = useState([])
  const [avisoCarrito, setAvisoCarrito] = useState('')
  const [ultimaCompra, setUltimaCompra] = useState(null)
  const { pathname, hash } = useLocation()
  const unidades = carrito.reduce((suma, item) => suma + item.cantidad, 0)
  const subtotal = carrito.reduce((suma, item) => {
    const producto = productos.find((producto) => producto.id === item.id)
    return suma + (producto ? producto.precio * item.cantidad : 0)
  }, 0)
  const descuento = usuarioSesion?.rol === ROL_CLIENTE && usuarioSesion.descuento === 20 ? Math.round(subtotal * 0.2) : 0
  const total = subtotal - descuento

  // Navegar sin recargar conserva el carrito y permite volver a las secciones de Inicio.
  useEffect(() => {
    if (hash) {
      document.getElementById(hash.slice(1))?.scrollIntoView()
    } else {
      window.scrollTo(0, 0)
    }
  }, [pathname, hash])

  useEffect(() => {
    eliminarUsuariosLocales()
  }, [])

  useEffect(() => {
    const solicitud = new AbortController()
    cargarProductos(solicitud.signal).then((datos) => {
      if (solicitud.signal.aborted) return
      setProductos(datos)
      setCatalogo({ cargando: false, error: '' })
    }).catch((error) => {
      if (!solicitud.signal.aborted) setCatalogo({ cargando: false, error: error.message })
    })
    return () => solicitud.abort()
  }, [intento])

  useEffect(() => {
    if (!usuarioSesion) return
    const temporizador = window.setTimeout(() => {
      try {
        eliminarSesion()
      } catch {
        // La sesión en memoria expira aunque el navegador bloquee el almacenamiento.
      }
      setUsuarioSesion(null)
      setUltimaCompra(null)
      setErrorSesion('Tu sesión terminó. Vuelve a iniciar sesión.')
    }, Math.max(0, usuarioSesion.expiraEn - Date.now()))
    return () => window.clearTimeout(temporizador)
  }, [usuarioSesion])

  function reintentarCatalogo() {
    setCatalogo({ cargando: true, error: '' })
    setIntento((actual) => actual + 1)
  }

  function actualizarSesion(usuario) {
    setUsuarioSesion(usuario)
    setErrorSesion('')
    setUltimaCompra(null)
  }

  function cerrarSesion() {
    actualizarSesion(null)
    try {
      eliminarSesion()
    } catch {
      setErrorSesion('La sesión se cerró, pero no se pudo limpiar el almacenamiento del navegador.')
    }
  }

  function agregarProducto(id, productoDetalle) {
    const producto = productoDetalle || productos.find((producto) => producto.id === id)
    if (!producto || producto.stock === 0) return
    if (productoDetalle) sincronizarProducto(productoDetalle)
    setCarrito((actual) => {
      if ((actual.find((item) => item.id === id)?.cantidad || 0) >= producto.stock) return actual
      const existe = actual.some((item) => item.id === id)
      return existe
        ? actual.map((item) => item.id === id ? { ...item, cantidad: item.cantidad + 1 } : item)
        : [...actual, { id, cantidad: 1 }]
    })
    setUltimaCompra(null)
  }

  function disminuirProducto(id) {
    setCarrito((actual) => actual.map((item) =>
      item.id === id && item.cantidad > 1 ? { ...item, cantidad: item.cantidad - 1 } : item,
    ))
  }

  function eliminarProducto(id) {
    setCarrito((actual) => actual.filter((item) => item.id !== id))
  }

  function comprar() {
    if (carrito.length === 0) return
    setUltimaCompra({ subtotal, descuento, total })
    setCarrito([])
    setAvisoCarrito('')
  }

  function guardarEnCatalogo(producto) {
    setProductos((actual) => actual.some((item) => item.id === producto.id)
      ? actual.map((item) => item.id === producto.id ? producto : item)
      : [...actual, producto])
  }

  function sincronizarProducto(producto) {
    guardarEnCatalogo(producto)
    if (carrito.some((item) => item.id === producto.id && item.cantidad > producto.stock)) {
      setAvisoCarrito('Se ajustaron las cantidades del carrito al stock disponible.')
    }
    setCarrito((actual) => actual.map((item) =>
      item.id === producto.id ? { ...item, cantidad: Math.min(item.cantidad, producto.stock) } : item,
    ).filter((item) => item.cantidad > 0))
  }

  async function solicitarCambio(operacion) {
    if (usuarioSesion?.rol !== ROL_ADMINISTRADOR) throw new Error('Tu cuenta no tiene permiso para realizar esta acción.')
    try {
      return await operacion(usuarioSesion.token)
    } catch (error) {
      if (error.status === 401 && leerSesion()?.token === usuarioSesion.token) {
        cerrarSesion()
        setErrorSesion(error.message)
      }
      throw error
    }
  }

  function subirImagenCatalogo(archivo) {
    return solicitarCambio((token) => subirImagen(archivo, token))
  }

  async function agregarProductoCatalogo(datos) {
    const producto = await solicitarCambio((token) => crearProducto(datos, token))
    guardarEnCatalogo(producto)
  }

  async function eliminarProductoCatalogo(id) {
    await solicitarCambio((token) => borrarProducto(id, token))
    setProductos((actual) => actual.filter((producto) => producto.id !== id))
    setCarrito((actual) => actual.filter((item) => item.id !== id))
  }

  async function editarProductoCatalogo(id, datos) {
    const producto = await solicitarCambio((token) => actualizarProducto(id, datos, token))
    sincronizarProducto(producto)
  }

  return (
    <>
      <a className="saltar-contenido" href="#contenido">Saltar al contenido</a>
      <Navbar unidades={unidades} usuarioSesion={usuarioSesion} cerrarSesion={cerrarSesion} />
      {errorSesion && <Container className="mt-3"><Alert variant="danger">{errorSesion}</Alert></Container>}
      {catalogo.cargando && <Container className="mt-3"><Alert variant="info" role="status">Cargando catálogo…</Alert></Container>}
      {catalogo.error && <Container className="mt-3">
        <Alert variant="danger">
          No se pudo cargar el catálogo. {catalogo.error}{' '}
          <Button size="sm" variant="outline-danger" onClick={reintentarCatalogo}>Reintentar</Button>
        </Alert>
      </Container>}
      {avisoCarrito && <Container className="mt-3"><Alert variant="info" dismissible onClose={() => setAvisoCarrito('')}>{avisoCarrito}</Alert></Container>}
      <Routes>
        <Route path="/login" element={<Login alIniciarSesion={actualizarSesion} />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/" element={<Home productos={productos} carrito={carrito} agregarProducto={agregarProducto} />} />
        <Route path="/productos" element={<Productos productos={productos} carrito={carrito} agregarProducto={agregarProducto} disponible={!catalogo.cargando && !catalogo.error} />} />
        <Route path="/producto/:id?" element={<DetalleProducto carrito={carrito} agregarProducto={agregarProducto} />} />
        <Route path="/carrito" element={
          <Carrito
            productos={productos} carrito={carrito} subtotal={subtotal} descuento={descuento}
            total={total} ultimaCompra={ultimaCompra} aumentarProducto={agregarProducto}
            disminuirProducto={disminuirProducto} eliminarProducto={eliminarProducto} comprar={comprar}
          />
        } />
        <Route path="/admin" element={<AdminLayout usuario={usuarioSesion} />}>
          <Route index element={<Navigate to="productos" replace />} />
          <Route path="productos" element={<AdminProductos productos={productos} eliminarProducto={eliminarProductoCatalogo} disponible={!catalogo.cargando && !catalogo.error} />} />
          <Route path="productos/nuevo" element={<AdminAgregarProducto agregarProducto={agregarProductoCatalogo} subirImagen={subirImagenCatalogo} />} />
          <Route path="productos/:id/editar" element={<AdminEditarProducto editarProducto={editarProductoCatalogo} subirImagen={subirImagenCatalogo} />} />
        </Route>
      </Routes>
      <Footer />
    </>
  )
}

export default App
