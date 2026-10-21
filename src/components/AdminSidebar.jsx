import { Nav } from 'react-bootstrap'
import { NavLink } from 'react-router-dom'

function AdminSidebar() {
  return (
    <aside className="border rounded p-3 bg-white">
      <h2 className="h5">Administración</h2>
      <Nav variant="pills" className="flex-column" aria-label="Administración de productos">
        <Nav.Link as={NavLink} to="/admin/productos" end>Listar productos</Nav.Link>
        <Nav.Link as={NavLink} to="/admin/productos/nuevo">Agregar producto</Nav.Link>
      </Nav>
    </aside>
  )
}

export default AdminSidebar
