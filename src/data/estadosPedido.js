export const nombresEstado = {
  PENDIENTE: 'Pendiente',
  EN_PREPARACION: 'En preparación',
  FINALIZADO: 'Finalizado',
  CANCELADO: 'Cancelado',
}

export const cambiosPermitidos = {
  PENDIENTE: ['EN_PREPARACION', 'CANCELADO'],
  EN_PREPARACION: ['FINALIZADO', 'CANCELADO'],
  FINALIZADO: [],
  CANCELADO: [],
}
