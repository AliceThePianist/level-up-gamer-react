import { ROL_ADMINISTRADOR, ROL_CLIENTE } from './roles.js'
import { CORREO_ADMIN_DEMO, obtenerUsuarios } from './usuarios.js'

// Lista explícita de datos de sesión: nunca copiar el usuario completo con su contraseña.
function perfilDeSesion(usuario) {
  return {
    id: usuario.id,
    nombre: usuario.nombre,
    correo: usuario.correo,
    descuento: usuario.descuento,
    rol: usuario.rol === ROL_ADMINISTRADOR ? ROL_ADMINISTRADOR : ROL_CLIENTE,
  }
}

export function iniciarSesion(correo, contrasena) {
  const correoNormalizado = correo.trim().toLowerCase()
  // Credenciales públicas del ejemplo académico del profesor, sin seguridad real.
  if (correoNormalizado === CORREO_ADMIN_DEMO && contrasena === '123456') {
    const administrador = { id: 'admin-demo', nombre: 'Administrador', correo: CORREO_ADMIN_DEMO, descuento: 0, rol: ROL_ADMINISTRADOR }
    sessionStorage.setItem('usuarioSesion', JSON.stringify(administrador))
    return administrador
  }
  const usuario = obtenerUsuarios().find((usuario) =>
    usuario.correo.trim().toLowerCase() === correoNormalizado &&
    typeof usuario.contrasena === 'string' && usuario.contrasena === contrasena,
  )
  if (!usuario) return null
  const perfil = perfilDeSesion({ ...usuario, rol: ROL_CLIENTE })
  sessionStorage.setItem('usuarioSesion', JSON.stringify(perfil))
  return perfil
}

export function leerSesion() {
  try {
    const usuario = JSON.parse(sessionStorage.getItem('usuarioSesion') || 'null')
    if (!usuario || typeof usuario.nombre !== 'string' || typeof usuario.correo !== 'string') return null
    return perfilDeSesion(usuario)
  } catch {
    return null
  }
}

export function eliminarSesion() {
  sessionStorage.removeItem('usuarioSesion')
}
