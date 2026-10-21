import catan from '../assets/images/catan.jpg'
import control from '../assets/images/controlador-xbox.jpg'
import consola from '../assets/images/playstation-5.jpg'
import computador from '../assets/images/computador-gamer.jpg'

// Datos iniciales de la portada anterior. Los precios se almacenan como números en CLP.
export const productosIniciales = [
  {
    id: 1,
    nombre: 'Catan',
    categoria: 'Juegos de Mesa',
    precio: 29990,
    imagen: catan,
    descripcion: 'Juego de estrategia ideal para compartir con amigos.',
  },
  {
    id: 2,
    nombre: 'Controlador Inalámbrico Xbox Series X',
    categoria: 'Accesorios',
    precio: 59990,
    imagen: control,
    descripcion: 'Control inalámbrico compatible con consolas Xbox y computadores.',
  },
  {
    id: 3,
    nombre: 'PlayStation 5',
    categoria: 'Consolas',
    precio: 549990,
    imagen: consola,
    descripcion: 'Consola de última generación con gráficos de alta calidad.',
  },
  {
    id: 4,
    nombre: 'PC Gamer ASUS ROG Strix',
    categoria: 'Computadores Gamers',
    precio: 1299990,
    imagen: computador,
    descripcion: 'Equipo de alto rendimiento para los jugadores más exigentes.',
  },
]
