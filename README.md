# Trabajo práctico 08

Endpoints persistentes de reservas de salas de estudio. Sitio HTML y API JSON con MongoDB Atlas y Mongoose.

## 1. Origen de la copia

Para hacer este trabajo, partí de mi TP 07 (`tp-07-salas-mongodb`) y trabajé sobre una copia llamada `tp-08-salas-http-mongodb`. De esta manera, conservé el práctico anterior sin modificarlo.

El objetivo fue que las reservas se guardaran en MongoDB Atlas y no solamente en la memoria del servidor. También incorporé una API para consultar y crear reservas desde Postman.

## 2. Versiones y entorno

- Node.js: v24.19.0.
- Express: 5.2.1.
- Mongoose: 9.11.1.
- Base de datos: MongoDB Atlas.
- Base utilizada: `reservas_salas_u8`.
- Colección: `reservas`.

## 3. Configuración de Atlas

Configuré la conexión con MongoDB Atlas mediante las variables de entorno. El archivo `.env.example` sirve como ejemplo para preparar el archivo `.env`, donde se colocan los datos reales de conexión.

El archivo `.env` no se entrega ni se publica en GitHub porque contiene información privada.

En `src/config/base-datos.js` también se conserva la configuración de DNS utilizada para resolver los problemas de conexión que se habían presentado.

## 4. Instalación y ejecución

Para instalar las dependencias:

```bash
npm install
```

Para iniciar el servidor:

```bash
npm run start:local
```

Para comprobar la conexión con la base de datos:

```bash
node --env-file=.env scripts/comprobar-conexion.js
```

Para revisar el formato y la calidad del código:

```bash
npm run format
npm run check
```

## 5. Organización del proyecto

Separé el código en distintos archivos para organizar mejor las tareas:

- `src/index.js`: inicia la aplicación.
- `src/app.js`: configura Express y conecta las rutas y los middleware.
- `src/config/`: contiene la configuración y la conexión con MongoDB.
- `src/rutas/`: separa las rutas del sitio web y las de la API.
- `src/controladores/`: prepara las respuestas.
- `src/servicios/reservas-mongo.js`: realiza las operaciones con las reservas.
- `src/modelos/reserva.js`: define la estructura de las reservas con Mongoose.
- `src/middleware/`: contiene componentes que intervienen durante las solicitudes.
- `views/`: contiene las páginas HTML.
- `public/`: contiene los archivos estáticos, como el CSS.
- `scripts/`: contiene programas para comprobar la conexión y trabajar con la base de datos desde la terminal.

La idea de esta organización es que cada parte tenga una responsabilidad. Las rutas reciben las solicitudes, los controladores coordinan las respuestas y el servicio se encarga de trabajar con los datos.

## 6. Endpoints de la API

La API permite trabajar con las reservas desde Postman, sin necesidad de utilizar el formulario de la página web.

| Método | Función |
|---|---|
| `GET /api/reservas` | Lista las reservas. |
| `GET /api/reservas?sala=Sala%20Norte` | Filtra por sala. |
| `GET /api/reservas/:id` | Busca una reserva por su identificador. |
| `POST /api/reservas` | Crea una reserva. |

Las respuestas contemplan distintos códigos HTTP: `200` cuando la consulta es correcta, `201` cuando se crea una reserva, `400` cuando los datos son inválidos, `404` cuando no se encuentra una reserva y `500` cuando ocurre un error inesperado del servidor.

## 7. Pruebas realizadas

Utilicé Postman para comprobar las operaciones de la API y verificar las respuestas.

Las pruebas incluyen:

- Listar las reservas.
- Crear una reserva con datos válidos.
- Consultar una reserva por su ID.
- Consultar identificadores inválidos e inexistentes.
- Probar datos incorrectos y campos obligatorios.
- Filtrar las reservas por sala.
- Comprobar las respuestas cuando se envían parámetros repetidos.

También comprobé la persistencia: una reserva guardada en MongoDB Atlas continúa disponible después de reiniciar el servidor.

## 8. Persistencia y límites

En el TP 07, las reservas del sitio se guardaban en memoria, por lo que se perdían al reiniciar el servidor.

En el TP 08, el sitio y la API utilizan MongoDB Atlas mediante Mongoose. Por eso, las reservas quedan guardadas en la base de datos.

Las validaciones comprueban los campos obligatorios, las salas y los turnos permitidos, el email y la cantidad de personas, que debe ser un número entero entre 1 y 6.

El proyecto no implementa autenticación ni operaciones para modificar o eliminar reservas. Tampoco controla los posibles solapamientos de horarios o las reservas duplicadas.

## 9. Evidencias

## 9. Evidencias

## 9. Evidencias

Para comprobar el funcionamiento del proyecto, realicé estas pruebas:

- Consulta de todas las reservas.
- Búsqueda de reservas por sala, incluyendo una sala sin reservas.
- Consulta de una reserva por su ID.
- Registro de nuevas reservas.
- Pruebas con datos incorrectos para comprobar las validaciones.

Con estas pruebas comprobé que las consultas y el registro de reservas funcionan correctamente.

Estas evidencias permiten mostrar la creación y consulta de reservas, las respuestas de error y la persistencia de los datos después de reiniciar el servidor.

No se incluyen contraseñas, credenciales ni el archivo `.env`.

## 10. Conclusión

Con este práctico aprendí a conectar la aplicación con MongoDB Atlas y a trabajar con reservas persistentes. También incorporé una API JSON para consultar y crear registros desde Postman.

Aunque todavía estoy aprendiendo a comprender mejor la organización por capas y el funcionamiento de las operaciones asíncronas, este trabajo me permitió avanzar en la separación del código y en el manejo de datos almacenados en una base de datos.