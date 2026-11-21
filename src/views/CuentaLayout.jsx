import { Alert, Container } from 'react-bootstrap'
import { Link, Outlet } from 'react-router-dom'
import { ROL_CLIENTE } from '../data/roles'

export default function CuentaLayout({ usuario, soloCliente = false }) {
  return (
    <main id="contenido" tabIndex={-1} className="seccion fondo-suave">
      <Container>
        {!usuario ? (
          <Alert variant="warning">Inicia sesión para acceder a tu cuenta. <Link to="/login">Iniciar sesión</Link></Alert>
        ) : soloCliente && usuario.rol !== ROL_CLIENTE ? (
          <Alert variant="warning">Esta sección corresponde a una cuenta de cliente. <Link to="/admin/pedidos">Administrar pedidos</Link></Alert>
        ) : <Outlet />}
      </Container>
    </main>
  )
}
