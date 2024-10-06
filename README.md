# Gestión de Usuarios API

Esta es una API RESTful para gestionar usuarios, desarrollada con Node.js y Express.

La API está desplegada en Render y puedes acceder a ella mediante la siguiente URL:<br>
https://apirest-jwt.onrender.com

## Endpoints
Pruebas de API realizadas con Postman.

Instrucciones para ejecutar la API localmente:

Clonar el repositorio.
Instalar las dependencias con npm install.
Crear un archivo .env con la clave secreta del JWT y la duración del token.
Ejecutar la API con npm start.
Descripción de los endpoints y ejemplos:

POST /login:

Request body: { "email": "user1@example.com", "password": "password1" }
Respuesta: { "token": "jwt_token_generado" }
GET /users (Protegido por JWT):

Debes enviar el token en el header de autorización: Authorization: Bearer jwt_token_generado
Respuesta: [ { "id": 1, "email": "user1@example.com", ... }, ... ]
PUT /users/:id (Protegido por JWT):

Actualiza los datos de un usuario con el ID proporcionado.
Request body: { "email": "nuevo_email@example.com" }
Respuesta: { "id": 1, "email": "nuevo_email@example.com", ... }
DELETE /users/:id (Protegido por JWT):

Elimina al usuario con el ID proporcionado.
Respuesta: { "message": "Usuario eliminado" }

### Crear un usuario

- **URL**: `/users`
- **Método**: `POST`
- **Cuerpo de la solicitud**:
  ```json
  {
    "dpi": "123456789",
    "name": "Deyson Donado",
    "email": "dey@gmail.com",
    "password": "password"
  }
  ```
Respuestas:<br>
201 Created: Usuario creado correctamente.<br>
400 Bad Request: El DPI ya está registrado.

### Listar usuarios
- **URL**: `/users`
- **Método**: `GET`

Respuestas:<br>
200 OK: Devuelve un arreglo de usuarios.

Ejemplo de respuesta:
```json
[
  {
    "dpi": "123456789",
    "name": "Deyson Donado",
    "email": "dey@gmail.com",
    "password": "password"
  },
  ...
]
```
### Actualizar un usuario
- **URL**: `/users/:dpi`
- **Método**: `PUT`
- **Cuerpo de la solicitud**:
```json
{
    "name": "Deyson López",
    "email": "deyl@gmail.com",
    "password": "password2"
}
```
Respuestas:<br>
200 OK: Usuario actualizado correctamente. <br>
400 Bad Request: El nuevo DPI ya está registrado.<br>
404 Not Found: Usuario no encontrado.

### Eliminar un usuario
- **URL**: `/users/:dpi`
- **Método**: `DELETE`

Respuestas:<br>
204 No Content: Usuario eliminado correctamente.<br>
404 Not Found: Usuario no encontrado.
