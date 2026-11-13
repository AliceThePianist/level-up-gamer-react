import { Alert, Col, Container, Row } from 'react-bootstrap'
import { Link, Outlet } from 'react-router-dom'
import AdminSidebar from '../../components/AdminSidebar'
import { ROL_ADMINISTRADOR } from '../../data/roles'

function AdminLayout({ usuario }) {
  return (
    <main id="contenido" tabIndex={-1} className="seccion fondo-suave">
      <Container>
        {usuario?.rol !== ROL_ADMINISTRADOR ? (
          <>
            <h1>Acceso administrativo</h1>
            <Alert variant="warning">
              {usuario ? (
                <>Tu cuenta no tiene acceso a la administración. <Link to="/productos">Volver al catálogo</Link></>
              ) : (
                <>Debes iniciar sesión como administrador. <Link to="/login">Ir al login</Link></>
              )}
            </Alert>
          </>
        ) : (
          <>
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
