import { Container, Nav, Navbar as BootstrapNavbar } from 'react-bootstrap'
import { Link, NavLink } from 'react-router-dom'

function Navbar({ unidades }) {
  return (
    <header>
      <BootstrapNavbar expand="xl" bg="dark" data-bs-theme="dark" collapseOnSelect aria-label="Navegación principal">
        <Container>
          <BootstrapNavbar.Brand as={NavLink} to="/" className="marca">
            LEVEL-UP <span>GAMER</span>
          </BootstrapNavbar.Brand>
          <BootstrapNavbar.Toggle aria-controls="menu-principal" label="Abrir o cerrar menú" />
          <BootstrapNavbar.Collapse id="menu-principal">
            <Nav className="ms-auto">
              <Nav.Link as={NavLink} to="/" end eventKey="inicio">Inicio</Nav.Link>
              <Nav.Link as={NavLink} to="/productos" eventKey="productos">Productos</Nav.Link>
              <Nav.Link as={Link} to="/#categorias" eventKey="categorias">Categorías</Nav.Link>
              <Nav.Link as={Link} to="/#destacados" eventKey="destacados">Destacados</Nav.Link>
              <Nav.Link as={Link} to="/#beneficios" eventKey="beneficios">Programa LevelUp</Nav.Link>
              <Nav.Link as={Link} to="/#novedades" eventKey="novedades">Novedades</Nav.Link>
              <Nav.Link as={NavLink} to="/carrito" eventKey="carrito">Carrito ({unidades})</Nav.Link>
            </Nav>
          </BootstrapNavbar.Collapse>
        </Container>
      </BootstrapNavbar>
    </header>
  )
}

export default Navbar
