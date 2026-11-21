import { Alert, Button, Card, Col, Container, Row } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { ROL_CLIENTE } from '../data/roles'

function Carrito({ productos, carrito, subtotal, descuento, total, ultimaCompra, aumentarProducto, disminuirProducto, eliminarProducto, comprar, usuarioSesion, registrandoPedido, errorPedido }) {
  return (
    <main id="contenido" tabIndex={-1} className="seccion fondo-suave">
      <Container>
        <p className="etiqueta">TU PRÓXIMA PARTIDA</p>
        <h1>Carrito de compras</h1>
        {ultimaCompra !== null && (
          <Alert variant="success" role="status">
            <Alert.Heading>Pedido registrado</Alert.Heading>
            <p>Pedido #{ultimaCompra.id} · Estado: pendiente · Pago no realizado</p>
            <p>Subtotal registrado: ${ultimaCompra.subtotal.toLocaleString('es-CL')} CLP</p>
            {ultimaCompra.descuento > 0 && <p>Beneficio Duoc aplicado: ${ultimaCompra.descuento.toLocaleString('es-CL')} CLP</p>}
            <p className="mb-0">Total registrado: <strong>${ultimaCompra.total.toLocaleString('es-CL')} CLP</strong>.</p>
            <Link to={`/mis-pedidos/${ultimaCompra.id}`}>Ver pedido</Link>
          </Alert>
        )}
        {errorPedido && <Alert variant="danger">{errorPedido} El carrito se conserva. Si se perdió la conexión, revisa Mis pedidos antes de volver a enviarlo.</Alert>}
        <Row className="g-4">
          <Col lg={8}>
            {carrito.length === 0 ? (
              <Alert variant="info">Tu carrito está vacío. Explora el catálogo para agregar productos.</Alert>
            ) : carrito.map((item) => {
              const producto = productos.find((producto) => producto.id === item.id)
              if (!producto) return null
              return (
                <Card as="article" className="mb-3" key={item.id}>
                  <Card.Body>
                    <h2 className="h5">{producto.nombre}</h2>
                    <p>Precio unitario: ${producto.precio.toLocaleString('es-CL')} CLP</p>
                    <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
                      <Button
                        variant="outline-secondary" size="sm" disabled={registrandoPedido || item.cantidad <= 1}
                        onClick={() => disminuirProducto(item.id)} aria-label={`Disminuir cantidad de ${producto.nombre}`}
                      >−</Button>
                      <p className="mb-0" aria-live="polite">Cantidad: {item.cantidad}</p>
                      <Button
                        variant="outline-secondary" size="sm" disabled={registrandoPedido || item.cantidad >= producto.stock}
                        onClick={() => aumentarProducto(item.id)} aria-label={`Aumentar cantidad de ${producto.nombre}`}
                      >+</Button>
                    </div>
                    <p className="fw-bold">Subtotal: ${(producto.precio * item.cantidad).toLocaleString('es-CL')} CLP</p>
                    <Button variant="outline-danger" disabled={registrandoPedido} onClick={() => eliminarProducto(item.id)} aria-label={`Eliminar ${producto.nombre} del carrito`}>Eliminar</Button>
                  </Card.Body>
                </Card>
              )
            })}
            <Link to="/productos">Seguir explorando productos</Link>
          </Col>
          <Col lg={4}>
            <Card>
              <Card.Body>
                <h2 className="h4">Resumen de compra</h2>
                <p>Subtotal de compra: ${subtotal.toLocaleString('es-CL')} CLP</p>
                <p>{descuento > 0 ? 'Descuento Duoc (20%)' : 'Descuento'}: ${descuento.toLocaleString('es-CL')} CLP</p>
                <p className="precio">Total: ${total.toLocaleString('es-CL')} <span>CLP</span></p>
                <Button className="w-100" variant="success" onClick={comprar} disabled={registrandoPedido || carrito.length === 0 || usuarioSesion?.rol !== ROL_CLIENTE}>{registrandoPedido ? 'Registrando…' : 'Registrar pedido'}</Button>
                {!usuarioSesion && <p className="mt-2"><Link to="/login">Inicia sesión</Link> con tu cuenta de cliente para registrar el pedido.</p>}
                {usuarioSesion && usuarioSesion.rol !== ROL_CLIENTE && <p className="mt-2">Los pedidos se registran desde una cuenta de cliente.</p>}
                <p className="small text-secondary mt-2 mb-0">El pedido quedará pendiente. No se realizará ningún cobro.</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </main>
  )
}

export default Carrito
