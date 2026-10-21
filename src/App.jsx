import { useEffect, useState } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './views/Home'
import Productos from './views/Productos'
import Carrito from './views/Carrito'
import { productosIniciales } from './data/productosIniciales'

function App() {
  // Solo guardamos identificador y cantidad; los datos del producto tienen una única fuente.
  const [carrito, setCarrito] = useState([])
  const [totalCompra, setTotalCompra] = useState(null)
  const { pathname, hash } = useLocation()
  const unidades = carrito.reduce((suma, item) => suma + item.cantidad, 0)
  const total = carrito.reduce((suma, item) => {
    const producto = productosIniciales.find((producto) => producto.id === item.id)
    return suma + producto.precio * item.cantidad
  }, 0)

  // Navegar sin recargar conserva el carrito y permite volver a las secciones de Inicio.
  useEffect(() => {
    if (hash) {
      document.getElementById(hash.slice(1))?.scrollIntoView()
    } else {
      window.scrollTo(0, 0)
    }
  }, [pathname, hash])

  function agregarProducto(id) {
    setCarrito((actual) => {
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
    setTotalCompra(total)
    setCarrito([])
  }

  return (
    <>
      <a className="saltar-contenido" href="#contenido">Saltar al contenido</a>
      <Navbar unidades={unidades} />
      <Routes>
        <Route path="/" element={<Home agregarProducto={agregarProducto} />} />
        <Route path="/productos" element={<Productos agregarProducto={agregarProducto} />} />
        <Route path="/carrito" element={<Carrito carrito={carrito} total={total} totalCompra={totalCompra} eliminarProducto={eliminarProducto} comprar={comprar} />} />
      </Routes>
      <Footer />
    </>
  )
}

export default App
