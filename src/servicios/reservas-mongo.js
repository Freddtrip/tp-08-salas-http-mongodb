const mongoose = require("mongoose");
const { Reserva } = require("../modelos/reserva");

// Convierte un documento de MongoDB en un objeto simple para las vistas
// y para la API. El _id (ObjectId) se expone como texto en el campo id.
function representarReserva(documento) {
  return {
    id: documento._id.toString(),
    estudiante: documento.estudiante,
    email: documento.email,
    sala: documento.sala,
    fecha: documento.fecha,
    turno: documento.turno,
    personas: documento.personas,
    estado: documento.estado,
  };
}

// Crea el servicio de reservas que trabaja con MongoDB.
// Todas sus funciones son async: consultar la base lleva tiempo.
function crearServicioReservasMongo() {
  // Devuelve todas las reservas, o solo las de una sala si se indica.
  async function listar(sala) {
    const filtro = {};

    // Si llegó un filtro, tiene que ser un texto no vacío.
    if (sala !== undefined) {
      if (typeof sala !== "string" || !sala.trim()) {
        const error = new Error("Sala inválida");
        error.codigo = "FILTRO_INVALIDO";
        throw error;
      }
      filtro.sala = sala.trim();
    }

    // lean() devuelve objetos simples en lugar de documentos de Mongoose.
    const documentos = await Reserva.find(filtro).lean();
    return documentos.map(representarReserva);
  }

  // Busca una reserva por su identificador. Devuelve null si no existe.
  async function obtenerPorId(id) {
    // Antes de consultar, se comprueba que el id tenga el formato de MongoDB.
    if (!mongoose.isObjectIdOrHexString(id)) {
      const error = new Error("Identificador inválido");
      error.codigo = "ID_INVALIDO";
      throw error;
    }

    const documento = await Reserva.findById(id).lean();
    return documento ? representarReserva(documento) : null;
  }

  // Cuenta cuántas reservas hay guardadas en la base.
  async function contar() {
    return Reserva.countDocuments({});
  }

  // Guarda una reserva nueva. Se copian uno por uno los seis campos
  // permitidos: nunca se pasa req.body completo a Mongoose.
  // El estado queda en "pendiente" por el valor por defecto del modelo.
  async function crear(datos) {
    const documento = await Reserva.create({
      estudiante: datos.estudiante,
      email: datos.email,
      sala: datos.sala,
      fecha: datos.fecha,
      turno: datos.turno,
      personas: datos.personas,
    });

    return representarReserva(documento);
  }

  return { listar, obtenerPorId, contar, crear };
}

module.exports = { crearServicioReservasMongo };
