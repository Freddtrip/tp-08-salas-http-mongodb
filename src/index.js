// ==============================
// IMPORTACIONES
// ==============================

const { leerConfiguracion } = require("./config/entorno");
const {
  conectarBaseDatos,
  desconectarBaseDatos,
} = require("./config/base-datos");
const { crearServicioReservasMongo } = require("./servicios/reservas-mongo");
const { crearApp } = require("./app");

// ==============================
// ARRANQUE
// ==============================

async function main() {
  // Lee el puerto y el formato de registro desde las variables de entorno.
  // Si el puerto no es válido, lanza un error y el servidor no arranca.
  const { puerto, formatoRegistro } = leerConfiguracion();

  // Espera la conexión con MongoDB antes de escuchar el puerto.
  // Si falla, el servidor no abre el puerto ni anuncia que está disponible.
  await conectarBaseDatos();

  // Servicio de reservas que usa MongoDB. Lo comparten el sitio y la API.
  const servicioReservas = crearServicioReservasMongo();

  // Crea la aplicación de Express, todavía sin ponerla a escuchar.
  const app = crearApp({ servicioReservas, formatoRegistro });

  // Inicia el servidor en el puerto configurado.
  // La conexión queda abierta mientras el servidor atiende solicitudes.
  const servidor = app.listen(puerto, () => {
    console.log(`Servidor funcionando en http://localhost:${puerto}`);
  });

  // Cierre ordenado: deja de aceptar conexiones, espera las solicitudes
  // activas y recién entonces cierra la conexión con MongoDB.
  let cerrando = false;

  function cerrar() {
    if (cerrando) return;
    cerrando = true;

    servidor.close(async () => {
      try {
        await desconectarBaseDatos();
      } catch (error) {
        console.error("Error al cerrar:", error.name);
        process.exitCode = 1;
      }
    });
  }

  // Ctrl + C (SIGINT) o una orden de terminar (SIGTERM) activan el cierre.
  process.once("SIGINT", cerrar);
  process.once("SIGTERM", cerrar);

  // Si el puerto está ocupado u otro error al escuchar, se informa y se
  // cierra la conexión con MongoDB.
  servidor.on("error", (error) => {
    console.error("No se pudo escuchar el puerto:", error.code);
    process.exitCode = 1;
    desconectarBaseDatos().catch((fallo) => {
      console.error("Error al cerrar:", fallo.name);
    });
  });
}

// Si algo falla al arrancar (por ejemplo, no hay conexión con Atlas),
// se informa sin mostrar la URI ni la clave, y se termina con error.
main().catch(async (error) => {
  console.error("No se pudo iniciar la aplicación:", error.name);
  console.error("Revisar entorno, DNS, red, acceso de Atlas y puerto.");
  process.exitCode = 1;

  try {
    await desconectarBaseDatos();
  } catch (fallo) {
    console.error("Error al cerrar:", fallo.name);
  }
});
