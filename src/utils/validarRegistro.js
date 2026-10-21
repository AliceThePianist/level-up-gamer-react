export function validarRegistro(formulario, hoy = new Date()) {
  const errores = {}
  if (formulario.nombre.trim().length < 3) errores.nombre = 'Ingresa un nombre de al menos 3 caracteres.'
  if (!formulario.apellido.trim()) errores.apellido = 'Ingresa tu apellido.'
  if (!formulario.rut.trim()) {
    errores.rut = 'Ingresa tu RUT.'
  } else if (formulario.rut.trim().length > 12) {
    errores.rut = 'El RUT debe tener como máximo 12 caracteres.'
  }

  const nacimiento = new Date(`${formulario.fechaNacimiento}T00:00:00`)
  const [anio, mesNacimiento, dia] = formulario.fechaNacimiento.split('-').map(Number)
  const fechaValida = nacimiento.getFullYear() === anio && nacimiento.getMonth() + 1 === mesNacimiento && nacimiento.getDate() === dia
  if (!fechaValida || Number.isNaN(nacimiento.getTime()) || nacimiento > hoy) {
    errores.fechaNacimiento = 'Ingresa una fecha de nacimiento válida, no futura.'
  } else {
    let edad = hoy.getFullYear() - nacimiento.getFullYear()
    const mes = hoy.getMonth() - nacimiento.getMonth()
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) edad -= 1
    if (edad < 18) errores.fechaNacimiento = 'Debes tener al menos 18 años para registrarte.'
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formulario.correo.trim())) {
    errores.correo = 'Ingresa un correo válido, por ejemplo nombre@correo.cl.'
  }
  if (formulario.contrasena.trim().length < 6) errores.contrasena = 'Usa una contraseña de al menos 6 caracteres.'
  if (!formulario.confirmacion) {
    errores.confirmacion = 'Confirma tu contraseña.'
  } else if (formulario.contrasena !== formulario.confirmacion) {
    errores.confirmacion = 'Las contraseñas no coinciden.'
  }
  return errores
}
