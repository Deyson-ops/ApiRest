# Gestión de Usuarios API

Esta es una API RESTful para gestionar usuarios, desarrollada con Node.js y Express.

La API está desplegada en Render y puedes acceder a ella mediante la siguiente URL:<br>
https://apirest-7mr1.onrender.com

## Endpoints
Pruebas de API realizadas con Postman.

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
