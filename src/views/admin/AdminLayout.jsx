import { Alert, Col, Container, Row } from 'react-bootstrap'
import { Link, Outlet } from 'react-router-dom'
import AdminSidebar from '../../components/AdminSidebar'

function AdminLayout({ usuario }) {
  return (
    <main id="contenido" tabIndex={-1} className="seccion fondo-suave">
      <Container>
        {usuario?.rol !== 'admin' ? (
          <>
            <h1>Acceso administrativo</h1>
            <Alert variant="warning">Debes iniciar sesión como administrador. <Link to="/login">Ir al login</Link></Alert>
          </>
        ) : (
          <>
            <Alert variant="info">Administración de demostración. El control de acceso es solo frontend; no representa seguridad real.</Alert>
            <Row className="g-4">
              <Col lg={3}><AdminSidebar /></Col>
              <Col lg={9}><Outlet /></Col>
            </Row>
          </>
        )}
      </Container>
    </main>
  )
}

export default AdminLayout
