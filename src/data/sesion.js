import { solicitar } from './api'
import { ROL_ADMINISTRADOR, ROL_CLIENTE } from './roles'

const claveSesion = 'usuarioSesion'

function perfilDeSesion({ id, nombre, rol, descuento, token, expiraEn }) {
  return { id, nombre, rol, descuento, token, expiraEn }
}

export async function iniciarSesion(correo, contrasena) {
  const respuesta = await solicitar('/api/auth/login', {
    metodo: 'POST', datos: { correo: correo.trim().toLowerCase(), contrasena },
  })
  const sesion = perfilDeSesion({
    ...respuesta.usuario,
    token: respuesta.token,
    expiraEn: Date.now() + respuesta.expiraEn * 1000,
  })
  sessionStorage.setItem(claveSesion, JSON.stringify(sesion))
  return sesion
}

export function leerSesion() {
  try {
    const sesion = JSON.parse(sessionStorage.getItem(claveSesion) || 'null')
    if (!sesion) return null
    if (!sesion.token || typeof sesion.nombre !== 'string' ||
        ![ROL_ADMINISTRADOR, ROL_CLIENTE].includes(sesion.rol) ||
        !Number.isFinite(sesion.expiraEn) || sesion.expiraEn <= Date.now()) {
      eliminarSesion()
      return null
    }
    return perfilDeSesion(sesion)
  } catch {
    return null
  }
}

export function eliminarSesion() {
  sessionStorage.removeItem(claveSesion)
}

export function eliminarUsuariosLocales() {
  try {
    localStorage.removeItem('levelup-usuarios-demo')
  } catch {
    // La API de autenticación funciona aunque el almacenamiento local esté bloqueado.
  }
}
