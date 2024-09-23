# Gestión de Usuarios API

Esta es una API RESTful para gestionar usuarios, desarrollada con Node.js y Express.

## Endpoints

### Crear un usuario

- **URL**: `/users`
- **Método**: `POST`
- **Cuerpo de la solicitud**:
  ```json
  {
    "dpi": "123456789",
    "name": "John Doe",
    "email": "john@example.com",
    "password": "mypassword"
  }
