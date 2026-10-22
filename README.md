# Trabajo práctico 08

Endpoints persistentes de reservas de salas de estudio: sitio HTML y API JSON sobre MongoDB Atlas con Mongoose.

## 1. Origen de la copia

Partí de mi TP 07 (`tp-07-salas-mongodb`) y lo copié con el nombre `tp-08-salas-http-mongodb`, sin `.git`, `node_modules` ni `.env`. El TP 07 quedó intacto.

## 2. Versiones y entorno

- Node.js: v24.19.0
- Express: 5.2.1
- Mongoose: 9.11.1
- Base de datos: MongoDB Atlas, clúster gratuito Free (M0), base `reservas_salas_u8`, colección `reservas`.

## 3. Preparación de Atlas y entorno

1. Clúster gratuito (Free, M0) con un usuario de base de datos con permisos de lectura y escritura (el mío tiene el rol `atlasAdmin`).
2. IP permitida: mi IP pública actual, agregada con el botón "Add Current IP Address" de Atlas. 
3. Copiar la plantilla y completar con los datos reales:

       copy .env.example .env

   La plantilla `.env.example` tiene este contenido, con marcadores ilustrativos que no permiten conectar:

       PORT=3000
       NODE_ENV=development
       MONGODB_URI=mongodb+srv://USUARIO:CLAVE@HOST/reservas_salas_u8?retryWrites=true&w=majority

   El `.env` real, con los datos de conexión, no se entrega.


**DNS:** se conserva la corrección acordada: en `src/config/base-datos.js` se configuran los resolutores `8.8.8.8` y `1.1.1.1` una sola vez, antes de conectar.

## 4. Comandos

- Instalar: `npm install`
- Iniciar el servidor: `npm run start:local` (equivale a `node --env-file=.env src/index.js`)
- Comprobar la conexión: `node --env-file=.env scripts/comprobar-conexion.js`
- Formato y calidad: `npm run format` y `npm run check`

## 5. Estructura por capas

- `src/config/`: lectura del entorno (`entorno.js`) y conexión (`base-datos.js`).
- `src/modelos/reserva.js`: esquema y modelo `Reserva`.
- `src/servicios/reservas-mongo.js`: servicio asíncrono que usa MongoDB.
- `src/controladores/reservas.js`: respuestas HTTP (HTML y JSON).
- `src/rutas/reservas.js` (sitio) y `src/rutas/reservas-api.js` (API): routers separados.
- `src/middleware/`: identificador y medición de solicitudes, validación de entrada y manejador de errores.
- `scripts/`: programas de terminal del TP 07.

## 6. Endpoints de la API

| Método y dirección | Resultado |
|---|---|
| GET /api/reservas | 200 y arreglo (puede ser `[]`) |
| GET /api/reservas?sala=Sala%20Norte | 200 y coincidencias exactas |
| GET /api/reservas/:id | 200 y el recurso |
| POST /api/reservas | 201, recurso guardado y cabecera Location |
| ID mal formado | 400 JSON |
| ID bien formado inexistente | 404 JSON |
| Creación inválida o JSON mal formado | 400 JSON, sin escritura |
| Fallo inesperado | 500 JSON, sin traza ni secretos |

Ejemplo de reserva (datos ficticios):

```json
{
  "id": "6ad925a4b4503965dc53d0ff",
  "estudiante": "Ana Ejemplo",
  "email": "ana@example.com",
  "sala": "Sala Norte",
  "fecha": "2026-10-21",
  "turno": "Mañana",
  "personas": 2,
  "estado": "pendiente"
}
```

El `id` es el `_id` de MongoDB convertido a texto. El campo `estado` lo asigna el servidor (`pendiente` por defecto); el cliente no lo envía.

## 7. Cómo reproducir las pruebas en Postman

Con el servidor iniciado:

1. **Listado:** GET `http://localhost:3000/api/reservas`, Body en `none`. Esperado: 200 y un arreglo.
2. **Crear:** POST `http://localhost:3000/api/reservas`, Body `raw` en formato JSON con el ejemplo de arriba (sin `id` ni `estado`), cabecera `Content-Type: application/json`. Esperado: 201, el recurso con `estado: "pendiente"` y la cabecera `Location` en la respuesta.
3. **Consultar:** GET a la dirección de `Location` (o `http://localhost:3000/api/reservas/ID`), Body en `none`. Esperado: 200 y el mismo recurso.
4. **ID inválido:** GET `http://localhost:3000/api/reservas/1`, Body en `none`. Esperado: 400.
5. **ID inexistente:** GET `http://localhost:3000/api/reservas/000000000000000000000000`, Body en `none`. Esperado: 404.
6. **Filtro:** GET `http://localhost:3000/api/reservas` con el parámetro `sala` = `Sala Norte` en Params, Body en `none`. Esperado: 200 y solo coincidencias exactas. Para el rechazo, dos filas `sala` con valores distintos: 400.

## 8. Matriz de resultados

Resultados observados en mis pruebas.

| Caso | Resultado observado |
|---|---|
| Listado vacío (base nueva) | COMPLETAR |
| Creación válida | COMPLETAR (estado y Location) |
| Consulta por ID creado | COMPLETAR |
| Consulta tras reiniciar | COMPLETAR |
| ID "1" | COMPLETAR |
| ID válido inexistente | COMPLETAR |
| Estudiante vacío / email sin @ | COMPLETAR |
| Sala o turno no permitido | COMPLETAR |
| Fecha vacía | COMPLETAR |
| Personas 0, 7, 2.5, "abc" | COMPLETAR |
| Personas true, arreglo, objeto | COMPLETAR |
| POST sin cuerpo / JSON mal formado | COMPLETAR |
| Campos extra estado o _id | COMPLETAR |
| Filtro exacto por sala / sin coincidencias | GET `/api/reservas` con `sala=Sala Norte`: 200 y las 2 reservas; con `sala=Sala Sur`: 200 y `[]` |
| Sala repetida como parámetro | GET `/api/reservas` con `sala=Sala Norte` y `sala=Sala Sur`: 400 |
| Listar dos veces | COMPLETAR |
| Formulario válido / inválido | COMPLETAR |
| /estado y vistas | COMPLETAR |
| Arranque con URI ausente | COMPLETAR |

Observación: el mismo POST válido se ejecutó más de una vez, por lo que hay dos reservas con los mismos datos y distinto `id` (`...d0fe` y `...d0ff`). No se borraron.

## 9. Prueba de reinicio

AQUI ME FALTA COMPLETAR: ID creado antes de reiniciar, ID consultado después de reiniciar, cantidades antes y después, y captura del documento en Atlas (`reservas_salas_u8` / `reservas`).

## 10. Límites de validación

Se valida que los seis campos estén presentes, que sala y turno estén en las listas permitidas, que `personas` sea un entero entre 1 y 6 y que el email contenga `@`. No se controla: email completo, fecha real o futura, solapamientos, cupos ni duplicados. No hay índice único. No se implementan PUT, PATCH ni DELETE, ni autenticación.

## 11. Qué dejó de usarse del servicio en memoria

`src/index.js` ya no importa el servicio en memoria (`servicios/reservas.js`) ni carga reservas de ejemplo al arrancar. Ese archivo queda como referencia, pero la única fuente activa es `servicios/reservas-mongo.js`, que usan el sitio y la API.

## 12. Comparación con el TP 07

- TP 07: el sitio guardaba en un arreglo en memoria; MongoDB se usaba solo desde scripts de terminal.
- TP 08: el sitio y la API leen y escriben en MongoDB mediante un servicio asíncrono; se agrega la API JSON, el campo `estado` y el cierre ordenado del servidor.

## 13. Evidencias

AQUI ME FALTA COMPLETAR: lista de capturas o registros que respaldan los resultados (Postman: método, URL, estado y Location; navegador; Atlas).