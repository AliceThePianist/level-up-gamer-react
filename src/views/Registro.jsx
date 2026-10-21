import { useState } from 'react'
import { Alert, Button, Card, Col, Container, Form, Row } from 'react-bootstrap'
import { validarRegistro } from '../utils/validarRegistro'
import { registrarUsuario } from '../data/usuarios'

const formularioInicial = {
  nombre: '', apellido: '', rut: '', fechaNacimiento: '', correo: '', contrasena: '', confirmacion: '',
}

const campos = [
  { nombre: 'nombre', etiqueta: 'Nombre', tipo: 'text' },
  { nombre: 'apellido', etiqueta: 'Apellido', tipo: 'text' },
  { nombre: 'rut', etiqueta: 'RUT', tipo: 'text', maxLength: 12 },
  { nombre: 'fechaNacimiento', etiqueta: 'Fecha de nacimiento', tipo: 'date' },
  { nombre: 'correo', etiqueta: 'Correo electrónico', tipo: 'email' },
  { nombre: 'contrasena', etiqueta: 'Contraseña', tipo: 'password' },
  { nombre: 'confirmacion', etiqueta: 'Confirmar contraseña', tipo: 'password' },
]

function Registro() {
  const [formulario, setFormulario] = useState(formularioInicial)
  const [errores, setErrores] = useState({})
  const [mensaje, setMensaje] = useState('')
  const [errorGuardado, setErrorGuardado] = useState('')

  function manejarCambio(event) {
    const { name, value } = event.target
    setFormulario({ ...formulario, [name]: value })
    setErrores({ ...errores, [name]: '' })
    setMensaje('')
    setErrorGuardado('')
  }

  function registrar(event) {
    event.preventDefault()
    setMensaje('')
    setErrorGuardado('')
    const nuevosErrores = validarRegistro(formulario)
    setErrores(nuevosErrores)
    if (Object.keys(nuevosErrores).length > 0) return
    try {
      const resultado = registrarUsuario(formulario)
      if (resultado.error) {
        setErrores({ correo: resultado.error })
        return
      }
      setMensaje(resultado.usuario.descuento === 20
        ? 'Registro exitoso. Beneficio Duoc del 20% registrado; todavía no se aplica al carrito.'
        : 'Registro exitoso. Ya puedes iniciar sesión.')
      setFormulario(formularioInicial)
    } catch {
      setErrorGuardado('No se pudo guardar el registro. El almacenamiento puede estar bloqueado o contener datos inválidos. No se modificaron los registros anteriores.')
    }
  }

  return (
    <main id="contenido" tabIndex={-1} className="seccion fondo-suave">
      <Container>
        <Row className="justify-content-center">
          <Col lg={8}>
            <Card className="shadow-sm">
              <Card.Body className="p-4">
                <p className="etiqueta">COMUNIDAD LEVEL-UP GAMER</p>
                <h1>Registro de usuarios</h1>
                <p>Completa todos los campos. Debes tener al menos 18 años.</p>
                <p className="text-secondary small">
                Este es un sitio educativo sin pagos reales.
                No utilices datos personales reales ni reutilices contraseñas.
                </p>
                {mensaje && <Alert variant="success" role="status">{mensaje}</Alert>}
                {errorGuardado && <Alert variant="danger">{errorGuardado}</Alert>}
                {Object.values(errores).some(Boolean) && <Alert variant="danger">Revisa los campos indicados antes de continuar.</Alert>}
                <Form noValidate onSubmit={registrar}>
                  <Row className="g-3">
                    {campos.map((campo) => (
                      <Col md={campo.nombre === 'correo' ? 12 : 6} key={campo.nombre}>
                        <Form.Group controlId={`registro-${campo.nombre}`}>
                          <Form.Label>{campo.etiqueta}</Form.Label>
                          <Form.Control
                            name={campo.nombre}
                            type={campo.tipo}
                            maxLength={campo.maxLength}
                            value={formulario[campo.nombre]}
                            onChange={manejarCambio}
                            isInvalid={!!errores[campo.nombre]}
                            aria-describedby={`ayuda-${campo.nombre}`}
                            autoComplete={campo.tipo === 'password' ? 'new-password' : 'off'}
                            required
                          />
                          <Form.Control.Feedback type="invalid" id={`ayuda-${campo.nombre}`}>{errores[campo.nombre]}</Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                    ))}
                    <Col xs={12}>
                      <p className="text-secondary small">
                      Las cuentas con correo institucional Duoc pueden registrar
                      el beneficio del 20%. Su aplicación a las compras estará
                      disponible próximamente.
                      </p>
                      <Button type="submit" variant="success" className="w-100">Registrarme</Button>
                    </Col>
                  </Row>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </main>
  )
}

export default Registro
