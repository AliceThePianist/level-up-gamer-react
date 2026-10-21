// Solo demostración académica: guarda contraseñas ficticias en texto plano.
export function obtenerUsuarios() {
  const usuarios = JSON.parse(localStorage.getItem('levelup-usuarios-demo') || '[]')
  if (!Array.isArray(usuarios) || usuarios.some((usuario) => !usuario || typeof usuario.correo !== 'string')) {
    throw new Error('Los datos guardados no tienen el formato esperado.')
  }
  return usuarios
}

export function registrarUsuario(formulario) {
  const usuarios = obtenerUsuarios()
  const correo = formulario.correo.trim().toLowerCase()
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
    descuento: dominio === 'duoc.cl' || dominio === 'duocuc.cl' ? 20 : 0,
  }
  localStorage.setItem('levelup-usuarios-demo', JSON.stringify([...usuarios, usuario]))
  return { usuario }
}
