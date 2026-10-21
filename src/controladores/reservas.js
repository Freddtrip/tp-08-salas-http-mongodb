// Las salas permitidas se usan para armar el desplegable del formulario.
const { salasPermitidas } = require("../middleware/reservas");

// Crea el controlador. Recibe el servicio de reservas (el que usa MongoDB).
// El controlador decide qué respuesta HTTP se envía; los datos los maneja
// el servicio.
function crearControladorReservas(servicioReservas) {
  // GET /reservas: muestra el listado.
  // Es async porque consultar MongoDB lleva tiempo: hay que esperar el
  // resultado con await antes de mostrar la página.
  async function listar(req, res) {
    const reservas = await servicioReservas.listar();

    res.render("reservas/lista", {
      titulo: "Reservas",
      reservas,
    });
  }

  // GET /reservas/nueva: muestra el formulario vacío.
  // No consulta la base, así que no necesita ser async.
  function mostrarFormulario(req, res) {
    res.render("reservas/nueva", {
      titulo: "Nueva reserva",
      salasPermitidas,
    });
  }

  // GET /reservas/:id: muestra el detalle de una reserva.
  // El id llega como texto (el identificador de MongoDB).
  async function mostrarDetalle(req, res) {
    const reserva = await servicioReservas.obtenerPorId(req.params.id);

    // Si no existe, el servicio devuelve null: se responde 404.
    // Si el id está mal escrito, el servicio lanza un error que atrapa el
    // manejador de errores y responde 400.
    if (!reserva) {
      return res.status(404).render("no-encontrado", {
        titulo: "Reserva no encontrada",
      });
    }

    res.render("reservas/detalle", {
      titulo: "Detalle de reserva",
      reserva,
    });
  }

  // POST /reservas: guarda una reserva enviada desde el formulario.
  // Llega acá solo si validarReserva dejó pasar los datos.
  async function crear(req, res) {
    // await: la redirección se hace recién cuando MongoDB confirmó el guardado.
    await servicioReservas.crear(req.reservaValidada);

    res.redirect("/reservas");
  }

  // GET /estado: informa el estado del servicio.
  // La cantidad se cuenta desde MongoDB, no desde un arreglo en memoria.
  async function estado(req, res) {
    res.json({
      servicio: "activo",
      cantidadReservas: await servicioReservas.contar(),
      solicitudId: res.locals.solicitudId,
    });
  }

  // GET /api/reservas: devuelve las reservas como JSON.
  // Acepta ?sala=Sala Norte para filtrar por una sala exacta.
  async function listarApi(req, res) {
    const reservas = await servicioReservas.listar(req.query.sala);

    res.json(reservas);
  }

  // GET /api/reservas/:id: devuelve una reserva como JSON, o 404 si no existe.
  async function obtenerApi(req, res) {
    const reserva = await servicioReservas.obtenerPorId(req.params.id);

    if (!reserva) {
      return res.status(404).json({ error: "Reserva no encontrada." });
    }

    res.json(reserva);
  }

  // POST /api/reservas: crea una reserva desde la API.
  // Responde 201 (creado) con la reserva y un encabezado Location que indica
  // dónde consultarla.
  async function crearApi(req, res) {
    const reserva = await servicioReservas.crear(req.reservaValidada);

    res.location(`/api/reservas/${reserva.id}`).status(201).json(reserva);
  }

  return {
    listar,
    mostrarFormulario,
    mostrarDetalle,
    crear,
    estado,
    listarApi,
    obtenerApi,
    crearApi,
  };
}

module.exports = { crearControladorReservas };
