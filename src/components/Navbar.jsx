import { Button, Container, Nav, Navbar as BootstrapNavbar } from 'react-bootstrap'
import { Link, NavLink } from 'react-router-dom'

function Navbar({ unidades, usuarioSesion, cerrarSesion }) {
  return (
    <header>
      <BootstrapNavbar expand="xl" bg="dark" data-bs-theme="dark" collapseOnSelect aria-label="Navegación principal">
        <Container>
          <BootstrapNavbar.Brand as={NavLink} to="/" className="marca">
            LEVEL-UP <span>GAMER</span>
          </BootstrapNavbar.Brand>
          <BootstrapNavbar.Toggle aria-controls="menu-principal" label="Abrir o cerrar menú" />
          <BootstrapNavbar.Collapse id="menu-principal" className="flex-column align-items-stretch">
            <Nav className="ms-auto flex-wrap justify-content-xl-end">
              <Nav.Link as={NavLink} to="/" end eventKey="inicio">Inicio</Nav.Link>
              <Nav.Link as={NavLink} to="/productos" eventKey="productos">Productos</Nav.Link>
              <Nav.Link as={Link} to="/#categorias" eventKey="categorias">Categorías</Nav.Link>
              <Nav.Link as={Link} to="/#destacados" eventKey="destacados">Destacados</Nav.Link>
              <Nav.Link as={Link} to="/#beneficios" eventKey="beneficios">Programa LevelUp</Nav.Link>
              <Nav.Link as={Link} to="/#novedades" eventKey="novedades">Novedades</Nav.Link>
              <Nav.Link as={NavLink} to="/carrito" eventKey="carrito">Carrito ({unidades})</Nav.Link>
              <Nav.Link as={NavLink} to="/registro" eventKey="registro">Registro</Nav.Link>
              {usuarioSesion?.rol === 'admin' && <Nav.Link as={NavLink} to="/admin" eventKey="admin">Administración</Nav.Link>}
              {!usuarioSesion && <Nav.Link as={NavLink} to="/login" eventKey="login">Iniciar sesión</Nav.Link>}
            </Nav>
            {usuarioSesion && (
              <div className="d-flex flex-wrap justify-content-xl-end align-items-center gap-2 mt-2">
                  <span className="text-light text-break">Hola, {usuarioSesion.nombre}</span>
                  <Button variant="outline-light" size="sm" onClick={cerrarSesion}>Cerrar sesión</Button>
              </div>
            )}
          </BootstrapNavbar.Collapse>
        </Container>
      </BootstrapNavbar>
    </header>
  )
}

export default Navbar
