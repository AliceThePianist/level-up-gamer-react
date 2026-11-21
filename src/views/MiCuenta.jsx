import { useState } from 'react'
import { Alert, Button, Card, Col, Form, Row } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { useConsulta } from '../data/useConsulta'
import { ROL_CLIENTE } from '../data/roles'
import EstadoConsulta from '../components/EstadoConsulta'

function FormularioPerfil({ perfil, solicitarPrivado, actualizarPerfil }) {
  const [nombre, setNombre] = useState(perfil.nombre)
  const [apellido, setApellido] = useState(perfil.apellido)
  const [errores, setErrores] = useState({})
  const [mensaje, setMensaje] = useState('')
  const [error, setError] = useState('')
  const [guardando, setGuardando] = useState(false)

  async function guardar(event) {
    event.preventDefault()
    if (guardando) return
    const nuevosErrores = {}
    if (nombre.trim().length < 3 || nombre.trim().length > 100) nuevosErrores.nombre = 'Ingresa un nombre de 3 a 100 caracteres.'
    if (!apellido.trim() || apellido.trim().length > 100) nuevosErrores.apellido = 'Ingresa un apellido de hasta 100 caracteres.'
    setErrores(nuevosErrores)
    setMensaje('')
    setError('')
    if (Object.keys(nuevosErrores).length > 0) return
    setGuardando(true)
    try {
      const usuario = await solicitarPrivado('/api/usuarios/me', { metodo: 'PUT', datos: { nombre, apellido } })
      actualizarPerfil(usuario)
      setNombre(usuario.nombre)
      setApellido(usuario.apellido)
      setMensaje('Tus datos se actualizaron.')
    } catch (error) {
      setError(error.message)
    } finally {
      setGuardando(false)
    }
  }

  return (
    <Form noValidate onSubmit={guardar}>
      {mensaje && <Alert variant="success" role="status">{mensaje}</Alert>}
      {error && <Alert variant="danger">{error}</Alert>}
      <Row className="g-3">
        <Col md={6}><Form.Group controlId="perfil-nombre">
          <Form.Label>Nombre</Form.Label>
          <Form.Control value={nombre} onChange={(event) => setNombre(event.target.value)} maxLength={100} required isInvalid={!!errores.nombre} aria-describedby="error-perfil-nombre" />
          <Form.Control.Feedback id="error-perfil-nombre" type="invalid">{errores.nombre}</Form.Control.Feedback>
        </Form.Group></Col>
        <Col md={6}><Form.Group controlId="perfil-apellido">
          <Form.Label>Apellido</Form.Label>
          <Form.Control value={apellido} onChange={(event) => setApellido(event.target.value)} maxLength={100} required isInvalid={!!errores.apellido} aria-describedby="error-perfil-apellido" />
          <Form.Control.Feedback id="error-perfil-apellido" type="invalid">{errores.apellido}</Form.Control.Feedback>
        </Form.Group></Col>
        <Col xs={12}><Button type="submit" variant="success" disabled={guardando}>{guardando ? 'Guardando…' : 'Guardar datos'}</Button></Col>
      </Row>
    </Form>
  )
}

export default function MiCuenta({ solicitarPrivado, actualizarPerfil, cerrarSesion }) {
  const consulta = useConsulta('/api/usuarios/me', solicitarPrivado)
  const perfil = consulta.datos
  return (
    <>
      <h1>Mi cuenta</h1>
      <EstadoConsulta {...consulta} />
      {perfil && <Card><Card.Body>
        <p>Correo: {perfil.correo}</p>
        <p>RUT: {perfil.rut}</p>
        <p>Fecha de nacimiento: {perfil.fechaNacimiento}</p>
        {perfil.descuento === 20 && <p>Beneficio Duoc: 20% de descuento.</p>}
        <FormularioPerfil key={perfil.id} perfil={perfil} solicitarPrivado={solicitarPrivado} actualizarPerfil={actualizarPerfil} />
        <div className="d-flex flex-wrap gap-3 align-items-center mt-4">
          {perfil.rol === ROL_CLIENTE && <Link to="/mis-pedidos">Ver mis pedidos</Link>}
          <Button variant="outline-secondary" onClick={cerrarSesion}>Cerrar sesión</Button>
        </div>
      </Card.Body></Card>}
    </>
  )
}
