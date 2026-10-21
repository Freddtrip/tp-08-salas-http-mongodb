const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const morgan = require("morgan");
const path = require("node:path");
const {
  crearIdentificadorSolicitud,
  medirDuracion,
} = require("./middleware/solicitudes");
const { crearManejadorErrores } = require("./middleware/errores");
const { salasPermitidas } = require("./middleware/reservas");
const { crearControladorReservas } = require("./controladores/reservas");
const { crearRouterReservas } = require("./rutas/reservas");
const { crearRouterReservasApi } = require("./rutas/reservas-api");

// Crea y configura la aplicación de Express, pero no la arranca.
// Recibe el servicio de reservas y el formato de registro de Morgan.
function crearApp({ servicioReservas, formatoRegistro }) {
  // "app" representa nuestro servidor y nos permite configurar
  // middleware, rutas y respuestas.
  const app = express();
  const controladorReservas = crearControladorReservas(servicioReservas);

  // EJS será el motor de plantillas (permite usar res.render()).
  app.set("view engine", "ejs");

  // Carpeta de las vistas. __dirname es src; ".." sube un nivel.
  app.set("views", path.join(__dirname, "..", "views"));

  // Layout principal que comparten las páginas: views/layouts/main.ejs
  app.set("layout", "layouts/main");

  // Morgan muestra en la terminal información de cada solicitud HTTP.
  app.use(morgan(formatoRegistro));

  // Le asigna un ID a cada solicitud, como BIB-0001.
  app.use(crearIdentificadorSolicitud());

  // Mide cuánto tarda cada solicitud en completarse.
  app.use(medirDuracion);

  // Permite que las vistas se inserten dentro del layout principal.
  app.use(expressLayouts);

  // Permite acceder a los archivos de la carpeta public (CSS, imágenes).
  app.use(express.static(path.join(__dirname, "..", "public")));

  // Interpretan los datos de formularios y de JSON (quedan en req.body).
  // Van antes de las rutas para que la validación pueda usarlos.
  app.use(express.urlencoded({ extended: false }));
  app.use(express.json());

  // Informa el estado del servicio, la cantidad de reservas y el ID.
  app.get("/estado", controladorReservas.estado);

  // Página de inicio.
  app.get("/", (req, res) => {
    res.render("inicio", {
      titulo: "Inicio",
    });
  });

  // API JSON de reservas.
  app.use("/api/reservas", crearRouterReservasApi(controladorReservas));

  // Sitio HTML de reservas.
  app.use("/reservas", crearRouterReservas(controladorReservas));

  // Si ninguna ruta anterior coincide: JSON para la API, HTML para el sitio.
  app.use((req, res) => {
    if (req.path.startsWith("/api/")) {
      return res.status(404).json({ error: "Ruta no encontrada." });
    }

    res.status(404).render("no-encontrado", {
      titulo: "Página no encontrada",
    });
  });

  // Middleware de errores (cuatro parámetros): va después de las rutas.
  app.use(
    crearManejadorErrores({
      vistaFormulario: "reservas/nueva",
      tituloFormulario: "Nueva reserva",
      datosFormulario: { salasPermitidas },
    }),
  );

  return app;
}

module.exports = { crearApp };
