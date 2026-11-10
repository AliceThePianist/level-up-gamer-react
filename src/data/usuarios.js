import { ROL_CLIENTE } from './roles.js'

// Esta dirección pertenece a la cuenta administrativa del ejemplo académico.
export const CORREO_ADMIN_DEMO = 'admin@tienda.cl'

// Solo demostración académica: guarda contraseñas ficticias en texto plano.
export function obtenerUsuarios() {
  const usuarios = JSON.parse(localStorage.getItem('levelup-usuarios-demo') || '[]')
  if (!Array.isArray(usuarios) || usuarios.some((usuario) => !usuario || typeof usuario.correo !== 'string')) {
    throw new Error('Los datos guardados no tienen el formato esperado.')
  }
  return usuarios
}

export function registrarUsuario(formulario) {
  const correo = formulario.correo.trim().toLowerCase()
  if (correo === CORREO_ADMIN_DEMO) {
    return { error: 'Este correo no está disponible para el registro.' }
  }

  const usuarios = obtenerUsuarios()
  if (usuarios.some((usuario) => usuario.correo.trim().toLowerCase() === correo)) {
    return { error: 'Este correo ya está registrado.' }
  }

  const dominio = correo.split('@')[1]
  const usuario = {
    id: Date.now(),
    nombre: formulario.nombre.trim(),
    apellido: formulario.apellido.trim(),
    rut: formulario.rut.trim(),
    fechaNacimiento: formulario.fechaNacimiento,
    correo,
    contrasena: formulario.contrasena,
    rol: ROL_CLIENTE,
    descuento: dominio === 'duoc.cl' || dominio === 'duocuc.cl' ? 20 : 0,
  }
  localStorage.setItem('levelup-usuarios-demo', JSON.stringify([...usuarios, usuario]))
  return { usuario }
}
