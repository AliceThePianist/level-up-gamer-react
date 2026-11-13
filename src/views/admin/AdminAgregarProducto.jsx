import FormularioProducto from '../../components/FormularioProducto'

export default function AdminAgregarProducto({ agregarProducto, subirImagen }) {
  return <FormularioProducto guardarProducto={agregarProducto} subirImagen={subirImagen} />
}
