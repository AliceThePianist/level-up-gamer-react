import { useEffect, useState } from 'react'
import { Alert, Container } from 'react-bootstrap'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './views/Home'
import Productos from './views/Productos'
import Carrito from './views/Carrito'
import Registro from './views/Registro'
import Login from './views/Login'
import { leerSesion, eliminarSesion } from './data/sesion'
import { cargarProductos, guardarProductos } from './data/productos'
import AdminLayout from './views/admin/AdminLayout'
import AdminProductos from './views/admin/AdminProductos'
import AdminAgregarProducto from './views/admin/AdminAgregarProducto'
import AdminEditarProducto from './views/admin/AdminEditarProducto'
import DetalleProducto from './views/DetalleProducto'

function App() {
  const [catalogo, setCatalogo] = useState(cargarProductos)
  const productos = catalogo.productos
  const [usuarioSesion, setUsuarioSesion] = useState(leerSesion)
  const [errorSesion, setErrorSesion] = useState('')

  function cerrarSesion() {
    try {
      eliminarSesion()
      setUsuarioSesion(null)
      setErrorSesion('')
    } catch {
      setErrorSesion('No se pudo cerrar la sesión. Revisa el almacenamiento del navegador e inténtalo nuevamente.')
    }
  }

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
  const descuento = usuarioSesion?.rol === 'cliente' && usuarioSesion.descuento === 20 ? Math.round(subtotal * 0.2) : 0
  const total = subtotal - descuento

  // Navegar sin recargar conserva el carrito y permite volver a las secciones de Inicio.
  useEffect(() => {
    if (hash) {
      document.getElementById(hash.slice(1))?.scrollIntoView()
    } else {
      window.scrollTo(0, 0)
    }
  }, [pathname, hash])

  function agregarProducto(id) {
    const producto = productos.find((producto) => producto.id === id)
    if (!producto || producto.stock === 0) return
    setCarrito((actual) => {
      if ((actual.find((item) => item.id === id)?.cantidad || 0) >= producto.stock) return actual
      const existe = actual.some((item) => item.id === id)
      return existe
        ? actual.map((item) => item.id === id ? { ...item, cantidad: item.cantidad + 1 } : item)
        : [...actual, { id, cantidad: 1 }]
    })
  }

  function eliminarProducto(id) {
    setCarrito((actual) => actual.filter((item) => item.id !== id))
  }

  function comprar() {
    if (carrito.length === 0) return
    setUltimaCompra({ subtotal, descuento, total })
    setCarrito([])
  }

  function agregarProductoCatalogo(datos) {
    if (usuarioSesion?.rol !== 'admin' || catalogo.error) throw new Error('Acción no disponible')
    // Supera los IDs actuales y los reservados de los cuatro productos iniciales.
    const id = Math.max(Date.now(), ...productos.map((producto) => producto.id + 1), 5)
    const nuevos = [...productos, { ...datos, id }]
    guardarProductos(nuevos)
    setCatalogo({ productos: nuevos, error: '' })
  }

  function eliminarProductoCatalogo(id) {
    if (usuarioSesion?.rol !== 'admin' || catalogo.error) throw new Error('Acción no disponible')
    const nuevos = productos.filter((producto) => producto.id !== id)
    guardarProductos(nuevos)
    setCatalogo({ productos: nuevos, error: '' })
    setCarrito((actual) => actual.filter((item) => item.id !== id))
  }

  function editarProductoCatalogo(id, datos) {
    if (usuarioSesion?.rol !== 'admin' || catalogo.error || !productos.some((producto) => producto.id === id)) throw new Error('Acción no disponible')
    const nuevos = productos.map((producto) => producto.id === id ? { ...datos, id } : producto)
    guardarProductos(nuevos)
    setCatalogo({ productos: nuevos, error: '' })
    if (carrito.some((item) => item.id === id && item.cantidad > datos.stock)) {
      setCarrito((actual) => actual.map((item) => item.id === id ? { ...item, cantidad: Math.min(item.cantidad, datos.stock) } : item).filter((item) => item.cantidad > 0))
      setAvisoCarrito('Se ajustaron las cantidades del carrito al stock disponible.')
    }
  }

  return (
    <>
      <a className="saltar-contenido" href="#contenido">Saltar al contenido</a>
      <Navbar unidades={unidades} usuarioSesion={usuarioSesion} cerrarSesion={cerrarSesion} />
      {errorSesion && <Container className="mt-3"><Alert variant="danger">{errorSesion}</Alert></Container>}
      {catalogo.error && <Container className="mt-3"><Alert variant="danger">{catalogo.error}</Alert></Container>}
      {avisoCarrito && <Container className="mt-3"><Alert variant="info" dismissible onClose={() => setAvisoCarrito('')}>{avisoCarrito}</Alert></Container>}
      <Routes>
        <Route path="/login" element={<Login alIniciarSesion={setUsuarioSesion} />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/" element={<Home productos={productos} carrito={carrito} agregarProducto={agregarProducto} />} />
        <Route path="/productos" element={<Productos productos={productos} carrito={carrito} agregarProducto={agregarProducto} />} />
        <Route path="/producto/:id?" element={<DetalleProducto productos={productos} carrito={carrito} agregarProducto={agregarProducto} />} />
        <Route path="/carrito" element={<Carrito productos={productos} carrito={carrito} subtotal={subtotal} descuento={descuento} total={total} ultimaCompra={ultimaCompra} eliminarProducto={eliminarProducto} comprar={comprar} />} />
        <Route path="/admin" element={<AdminLayout usuario={usuarioSesion} />}>
          <Route index element={<Navigate to="productos" replace />} />
          <Route path="productos" element={<AdminProductos productos={productos} eliminarProducto={eliminarProductoCatalogo} />} />
          <Route path="productos/nuevo" element={<AdminAgregarProducto agregarProducto={agregarProductoCatalogo} />} />
          <Route path="productos/:id/editar" element={<AdminEditarProducto productos={productos} editarProducto={editarProductoCatalogo} />} />
        </Route>
      </Routes>
      <Footer />
    </>
  )
}

export default App
