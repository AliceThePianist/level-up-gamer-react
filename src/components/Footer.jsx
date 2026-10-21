import { Col, Container, Row } from 'react-bootstrap'
import { Link } from 'react-router-dom'

const anioActual = new Date().getFullYear()

function Footer() {
  return (
    <footer className="pie-pagina py-5">
      <Container>
        <Row className="g-4 align-items-center">
          <Col md={7}>
            <Link className="marca text-decoration-none text-white" to="/">LEVEL-UP <span>GAMER</span></Link>
            <p className="mt-3 mb-0">Productos y accesorios para gamers en Chile.</p>
          </Col>
          <Col md={5} className="text-md-end">
            <p className="mb-1">Contacto</p>
            <p className="mb-0">contacto@levelupgamer.cl</p>
          </Col>
        </Row>
        <hr className="my-4" />
        <p className="small mb-0">© {anioActual} Level-Up Gamer. Todos los derechos reservados.</p>
      </Container>
    </footer>
  )
}

export default Footer
