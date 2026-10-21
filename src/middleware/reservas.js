const salasPermitidas = ["Sala Norte", "Sala Sur", "Sala Multimedia"];

// Guarda el texto "Reservas de salas" para mostrarlo en las vistas de reservas.
function prepararAreaReservas(req, res, next) {
  res.locals.seccion = "Reservas de salas";
  next();
}

// Revisa que los datos enviados desde el formulario sean válidos.
function validarReserva(req, res, next) {
  const valores = req.body ?? {};

  const estudiante = String(valores.estudiante ?? "").trim();
  const email = String(valores.email ?? "").trim();
  const sala = String(valores.sala ?? "");
  const fecha = String(valores.fecha ?? "");
  const turno = String(valores.turno ?? "");
  const personas = Number(valores.personas);

  const errores = [];

  if (!estudiante || !email || !sala || !fecha || !turno) {
    errores.push("Todos los campos son obligatorios.");
  }

  if (!salasPermitidas.includes(sala)) {
    errores.push("La sala seleccionada no es válida.");
  }

  if (!["Mañana", "Tarde", "Noche"].includes(turno)) {
    errores.push("El turno seleccionado no es válido.");
  }

  if (!Number.isInteger(personas) || personas < 1 || personas > 6) {
    errores.push("La cantidad de personas debe ser entre 1 y 6.");
  }

  if (!email.includes("@")) {
    errores.push("El email no es válido.");
  }

  // Si encontró errores, vuelve a mostrar el formulario y se detiene acá.
  if (errores.length > 0) {
    return res.status(400).render("reservas/nueva", {
      titulo: "Nueva reserva",
      salasPermitidas: salasPermitidas,
      errores: errores,
      valores: {
        estudiante,
        email,
        sala,
        fecha,
        turno,
        personas: valores.personas,
      },
    });
  }

  // Si no hubo errores, guarda los datos ya revisados.
  req.reservaValidada = {
    estudiante,
    email,
    sala,
    fecha,
    turno,
    personas,
  };

  next();
}

module.exports = { prepararAreaReservas, validarReserva, salasPermitidas };
