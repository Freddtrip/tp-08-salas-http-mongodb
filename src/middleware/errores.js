// Crea el middleware que atrapa los errores de la aplicación.
// Recibe qué vista y qué título usar cuando hay que volver a mostrar el
// formulario, y los datos extra que esa vista necesita (por ejemplo, las salas).
function crearManejadorErrores({
  vistaFormulario,
  tituloFormulario,
  datosFormulario = {},
}) {
  // Un middleware de errores tiene cuatro parámetros. Express lo reconoce
  // por eso, y por eso va registrado después de todas las rutas.
  return function manejarErrores(error, req, res, next) {
    // Si la respuesta ya empezó a enviarse, no se puede responder de nuevo:
    // se deja que Express cierre la conexión.
    if (res.headersSent) {
      return next(error);
    }

    // Una validación del modelo que falló (por ejemplo, personas fuera de rango).
    const esValidacion = error.name === "ValidationError";

    // Errores causados por los datos que mandó el cliente: son 400.
    // Los códigos ID_INVALIDO y FILTRO_INVALIDO los lanza el servicio.
    // "entity.parse.failed" es un JSON mal formado.
    const esEntrada =
      esValidacion ||
      error.codigo === "ID_INVALIDO" ||
      error.codigo === "FILTRO_INVALIDO" ||
      error.type === "entity.parse.failed";

    // Si el problema es del cliente, 400. Si es inesperado, 500.
    const estado = esEntrada ? 400 : 500;

    // Mensaje general para el usuario. Nunca incluye detalles internos
    // (ni la URI, ni el texto original del error).
    let mensaje = esEntrada
      ? "Revisá los datos enviados."
      : "No se pudo completar la operación.";

    // Para un identificador mal escrito, un mensaje más claro.
    if (error.codigo === "ID_INVALIDO") {
      mensaje = "El identificador debe tener 24 caracteres hexadecimales.";
    }

    // En la terminal solo se registra el ID de la solicitud y el nombre del
    // error, nada sensible.
    console.error("Solicitud fallida:", res.locals.solicitudId, error.name);

    // Si la solicitud fue a la API, la respuesta es JSON.
    // "campos" lista los campos que fallaron, solo si es una validación.
    if (req.path.startsWith("/api/")) {
      return res.status(estado).json({
        error: mensaje,
        campos: esValidacion ? Object.keys(error.errors) : [],
      });
    }

    // Si el formulario web falló al guardar (una validación del modelo),
    // se vuelve a mostrar el formulario con lo que escribió la persona.
    if (esValidacion && req.method === "POST") {
      return res.status(400).render(vistaFormulario, {
        titulo: tituloFormulario,
        errores: [mensaje],
        valores: req.body ?? {},
        ...datosFormulario,
      });
    }

    // Cualquier otro error del sitio web muestra la página de error.
    return res.status(estado).render("no-encontrado", {
      titulo: esEntrada ? "Solicitud inválida" : "Error del servicio",
      mensaje,
    });
  };
}

module.exports = { crearManejadorErrores };
