import { solicitar } from './api'

export function registrarUsuario({ nombre, apellido, rut, fechaNacimiento, correo, contrasena }) {
  return solicitar('/api/auth/registro', {
    metodo: 'POST',
    datos: {
      nombre: nombre.trim(), apellido: apellido.trim(), rut: rut.trim(),
      fechaNacimiento, correo: correo.trim().toLowerCase(), contrasena,
    },
  })
}
