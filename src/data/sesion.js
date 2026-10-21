import { obtenerUsuarios } from './usuarios.js'

// Lista explícita de datos de sesión: nunca copiar el usuario completo con su contraseña.
function perfilDeSesion(usuario) {
  return {
    id: usuario.id,
    nombre: usuario.nombre,
    correo: usuario.correo,
    descuento: usuario.descuento,
  }
}

export function iniciarSesion(correo, contrasena) {
  const usuario = obtenerUsuarios().find((usuario) =>
    usuario.correo.trim().toLowerCase() === correo.trim().toLowerCase() &&
    typeof usuario.contrasena === 'string' && usuario.contrasena === contrasena,
  )
  if (!usuario) return null
  const perfil = perfilDeSesion(usuario)
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
