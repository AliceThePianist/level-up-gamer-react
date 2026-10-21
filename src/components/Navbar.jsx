import { Container, Nav, Navbar as BootstrapNavbar } from 'react-bootstrap'
import { NavLink } from 'react-router-dom'

function Navbar() {
  return (
    <header>
      <BootstrapNavbar expand="lg" bg="dark" data-bs-theme="dark" collapseOnSelect aria-label="Navegación principal">
        <Container>
          <BootstrapNavbar.Brand as={NavLink} to="/" className="marca">
            LEVEL-UP <span>GAMER</span>
          </BootstrapNavbar.Brand>
          <BootstrapNavbar.Toggle aria-controls="menu-principal" label="Abrir o cerrar menú" />
          <BootstrapNavbar.Collapse id="menu-principal">
            <Nav className="ms-auto">
              <Nav.Link as={NavLink} to="/" end eventKey="inicio">Inicio</Nav.Link>
              <Nav.Link as={NavLink} to="/productos" eventKey="productos">Productos</Nav.Link>
              <Nav.Link href="/#categorias" eventKey="categorias">Categorías</Nav.Link>
              <Nav.Link href="/#destacados" eventKey="destacados">Destacados</Nav.Link>
              <Nav.Link href="/#beneficios" eventKey="beneficios">Programa LevelUp</Nav.Link>
              <Nav.Link href="/#novedades" eventKey="novedades">Novedades</Nav.Link>
            </Nav>
          </BootstrapNavbar.Collapse>
        </Container>
      </BootstrapNavbar>
    </header>
  )
}

export default Navbar
