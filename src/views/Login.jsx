import { useState } from 'react'
import { Alert, Button, Card, Col, Container, Form, Row } from 'react-bootstrap'
import { Link, useNavigate } from 'react-router-dom'
import { iniciarSesion } from '../data/sesion'

function Login({ alIniciarSesion }) {
  const [correo, setCorreo] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [errores, setErrores] = useState({})
  const [error, setError] = useState('')
  const navigate = useNavigate()

  function ingresar(event) {
    event.preventDefault()
    setError('')
    const nuevosErrores = {}
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo.trim())) {
      nuevosErrores.correo = 'Ingresa un correo electrónico válido.'
    }
    if (contrasena.trim().length < 6) {
      nuevosErrores.contrasena = 'Ingresa tu contraseña de al menos 6 caracteres.'
    }
    setErrores(nuevosErrores)
    if (Object.keys(nuevosErrores).length > 0) return
    try {
      const usuario = iniciarSesion(correo, contrasena)
      if (!usuario) {
        setError('Correo o contraseña incorrectos.')
        return
      }
      alIniciarSesion(usuario)
      navigate(usuario.rol === 'admin' ? '/admin/productos' : '/')
    } catch {
      setError('No se pudo iniciar sesión. Revisa que el almacenamiento del navegador esté disponible y que los datos guardados sean válidos.')
    }
  }

  return (
    <main id="contenido" tabIndex={-1} className="seccion fondo-suave">
      <Container>
        <Row className="justify-content-center">
          <Col md={8} lg={6}>
            <Card className="shadow-sm">
              <Card.Body className="p-4">
                <p className="etiqueta">BIENVENIDO A LEVEL-UP GAMER</p>
                <h1>Iniciar sesión</h1>
                <p className="text-secondary small">Sitio educativo. No reutilices contraseñas personales: los datos se almacenan en este navegador.</p>
                {error && <Alert variant="danger">{error}</Alert>}
                <Form noValidate onSubmit={ingresar}>
                  <Form.Group controlId="login-correo" className="mb-3">
                    <Form.Label>Correo electrónico</Form.Label>
                    <Form.Control type="email" value={correo} onChange={(event) => { setCorreo(event.target.value); setError('') }} isInvalid={!!errores.correo} aria-describedby="error-correo" autoComplete="off" required />
                    <Form.Control.Feedback type="invalid" id="error-correo">{errores.correo}</Form.Control.Feedback>
                  </Form.Group>
                  <Form.Group controlId="login-contrasena" className="mb-3">
                    <Form.Label>Contraseña</Form.Label>
                    <Form.Control type="password" value={contrasena} onChange={(event) => { setContrasena(event.target.value); setError('') }} isInvalid={!!errores.contrasena} aria-describedby="error-contrasena" autoComplete="off" required />
                    <Form.Control.Feedback type="invalid" id="error-contrasena">{errores.contrasena}</Form.Control.Feedback>
                  </Form.Group>
                  <Button type="submit" variant="success" className="w-100">Ingresar</Button>
                </Form>
                <p className="mt-3 mb-0">¿Aún no tienes una cuenta? <Link to="/registro">Registrarte</Link></p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </main>
  )
}

export default Login
