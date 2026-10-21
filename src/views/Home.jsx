import { Button, Card, Col, Container, Row } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import banner from '../assets/images/banner-gamer.jpg'
import blogComputador from '../assets/images/blog-computador.jpg'
import blogEspacio from '../assets/images/blog-espacio-gamer.jpg'

// Categorías de productos y servicios del diseño anterior.
const categorias = [
  ['Juegos de Mesa', 'Comparte una nueva partida con amigos y familia.'],
  ['Accesorios', 'Audífonos, controles y complementos para jugar.'],
  ['Consolas', 'Tus juegos favoritos en una nueva generación.'],
  ['Computadores Gamers', 'Equipos preparados para tus desafíos.'],
  ['Sillas Gamers', 'Comodidad para tus sesiones de juego.'],
  ['Mouse', 'Precisión y control en cada partida.'],
  ['Mousepad', 'El espacio que necesita cada movimiento.'],
  ['Poleras Personalizadas', 'Lleva tu estilo gamer contigo.'],
  ['Polerones Gamers', 'Diseños para jugar a tu manera.'],
  ['Servicio Técnico', 'Soporte para cuidar tus equipos.'],
]

function Home({ productos, agregarProducto }) {
  return (
    <main id="contenido" tabIndex={-1}>
      <section className="banner-principal" aria-labelledby="titulo-inicio">
        <Container>
          <Row className="align-items-center g-5">
            <Col lg={6}>
              <p className="etiqueta text-acento">TIENDA GAMER EN CHILE</p>
              <h1 id="titulo-inicio">Desafía tus límites con <span>Level-Up Gamer.</span></h1>
              <p className="lead my-4">Consolas, computadores y accesorios para llevar tu experiencia de juego al siguiente nivel.</p>
              <Button href="#destacados" variant="primary" size="lg">Explorar destacados <span aria-hidden="true">↗</span></Button>
            </Col>
            <Col lg={6}>
              <img className="imagen-banner" src={banner} alt="Escritorio gamer con monitores e iluminación azul y verde" fetchPriority="high" />
            </Col>
          </Row>
        </Container>
      </section>

      <aside className="aviso-duoc py-4" aria-label="Beneficio Duoc">
        <Container className="d-flex flex-column flex-md-row align-items-md-center gap-2 gap-md-4">
          <strong className="descuento">20%</strong>
          <div>
            <p className="fw-bold mb-1">Tu próxima partida tiene un beneficio Duoc.</p>
            <p className="mb-0">Registra tu correo Duoc para obtener el beneficio del 20%. Su aplicación al carrito estará disponible próximamente.</p>
          </div>
        </Container>
      </aside>

      <section id="categorias" className="seccion" aria-labelledby="titulo-categorias">
        <Container>
          <p className="etiqueta">UN MUNDO PARA JUGAR</p>
          <h2 id="titulo-categorias">Encuentra tu siguiente nivel</h2>
          <p className="text-secondary mb-4">Conoce nuestras categorías de productos y servicios.</p>
          <Row className="g-3">
            {categorias.map(([nombre, descripcion]) => (
              <Col key={nombre} sm={6} lg={4} xl={3}>
                <Card as="article" className="tarjeta-categoria h-100">
                  <Card.Body>
                    <h3 className="h5">{nombre}</h3>
                    <p className="text-secondary mb-0">{descripcion}</p>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      <section id="destacados" className="seccion fondo-suave" aria-labelledby="titulo-destacados">
        <Container>
          <p className="etiqueta">LO MÁS BUSCADO</p>
          <h2 id="titulo-destacados">Productos destacados</h2>
          <p className="text-secondary mb-4">Una selección para conocer Level-Up Gamer. Agrega tus favoritos y simula tu compra.</p>
          <Row className="g-4">
            {productos.slice(0, 4).map((producto) => (
              <Col key={producto.id} sm={6} lg={3}>
                <ProductCard producto={producto} agregarProducto={agregarProducto} mostrarDescripcion={false} tituloAs="h3" />
              </Col>
            ))}
          </Row>
          <Button as={Link} to="/productos" variant="primary" className="mt-4">Ver catálogo completo</Button>
        </Container>
      </section>

      <section id="beneficios" className="seccion programa-levelup" aria-labelledby="titulo-beneficios">
        <Container>
          <p className="etiqueta text-acento">RECOMPENSAS PARA CLIENTES</p>
          <h2 id="titulo-beneficios">Jugar es mejor en comunidad.</h2>
          <p className="mb-5">Conoce el programa LevelUp que estamos preparando para ti.</p>
          <Row className="g-4">
            <Col md={4}>
              <article className="beneficio">
                <span className="numero-beneficio" aria-hidden="true">01</span>
                <h3 className="h4">Puntos LevelUp</h3>
                <p>Acumula puntos con tus compras para obtener productos o descuentos.</p>
              </article>
            </Col>
            <Col md={4}>
              <article className="beneficio">
                <span className="numero-beneficio" aria-hidden="true">02</span>
                <h3 className="h4">Código de referido</h3>
                <p>Comparte tu código con otros jugadores y recibe puntos cuando se registren.</p>
              </article>
            </Col>
            <Col md={4}>
              <article className="beneficio">
                <span className="numero-beneficio" aria-hidden="true">03</span>
                <h3 className="h4">Niveles y beneficios</h3>
                <p>Sube de nivel con tus puntos y descubre nuevas recompensas.</p>
              </article>
            </Col>
          </Row>
        </Container>
      </section>

      <section id="novedades" className="seccion" aria-labelledby="titulo-novedades">
        <Container>
          <p className="etiqueta">NOTICIAS Y CONSEJOS</p>
          <h2 id="titulo-novedades">Inspira tu próxima partida</h2>
          <p className="text-secondary mb-4">Un adelanto de los temas de nuestro futuro blog.</p>
          <Row className="g-4">
            <Col md={6}>
              <article>
                <img className="imagen-blog mb-4" src={blogComputador} alt="Componentes de un computador gamer sobre un escritorio" loading="lazy" />
                <p className="etiqueta">GUÍA PARA GAMERS</p>
                <h3 className="h4">Cómo elegir tu primer computador gamer</h3>
                <p className="text-secondary">Los componentes más importantes que debes considerar antes de comprar un computador gamer.</p>
              </article>
            </Col>
            <Col md={6}>
              <article>
                <img className="imagen-blog mb-4" src={blogEspacio} alt="Espacio de juego con escritorio, pantallas y accesorios gamer" loading="lazy" />
                <p className="etiqueta">CONSEJOS</p>
                <h3 className="h4">Consejos para mejorar tu espacio de juego</h3>
                <p className="text-secondary">Ideas para organizar tu escritorio y mejorar la comodidad durante tus sesiones de juego.</p>
              </article>
            </Col>
          </Row>
        </Container>
      </section>
    </main>
  )
}

export default Home
