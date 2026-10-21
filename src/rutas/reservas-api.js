const express = require("express");

// Solo se necesita la validación: la API no muestra páginas.
const { validarReserva } = require("../middleware/reservas");

// Crea el router de la API JSON de reservas.
// Los caminos son relativos: la URL pública se forma al montar el router
// con app.use("/api/reservas", ...) en app.js.
function crearRouterReservasApi(controladorReservas) {
  const router = express.Router();

  // GET /api/reservas (acepta ?sala=Sala Norte para filtrar)
  router.get("/", controladorReservas.listarApi);

  // GET /api/reservas/:id
  router.get("/:id", controladorReservas.obtenerApi);

  // POST /api/reservas: primero valida y después crea.
  router.post("/", validarReserva, controladorReservas.crearApi);

  return router;
}

module.exports = { crearRouterReservasApi };
