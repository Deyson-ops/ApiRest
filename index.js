const express = require('express');
const jwt = require('jsonwebtoken'); // Importar JWT
require('dotenv').config(); // Cargar variables de entorno
const app = express();
app.use(express.json());

const users = []; // Almacenará los usuarios

// Endpoint para crear un usuario
app.post('/users', (req, res) => {
  const { dpi, name, email, password } = req.body;

  // Validar que todos los campos estén presentes
  if (!dpi || !name || !email || !password) {
    return res.status(400).json({ message: 'Todos los campos son requeridos' });
  }

  // Validar que el DPI no exista
  const userExists = users.some(user => user.dpi === dpi);
  if (userExists) {
    return res.status(400).json({ message: 'El DPI ya está registrado' });
  }

  const newUser = { dpi, name, email, password }; // Aquí la contraseña se guarda sin encriptar
  users.push(newUser);
  res.status(201).json({ message: 'Usuario creado exitosamente', user: newUser });
});


// Endpoint para listar todos los usuarios (Protegido por JWT)
app.get('/users', authenticateToken, (req, res) => {
  res.json(users);
});

// Middleware para autenticar el token JWT
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Obtener el token del header

  if (!token) return res.sendStatus(401); // No hay token, respuesta 401

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403); // Token inválido, respuesta 403
    req.user = user;
    next(); // Continuar con el siguiente middleware o endpoint
  });
}

// Endpoint para iniciar sesión y generar un token JWT
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email && u.password === password);

  if (!user) {
    return res.status(401).json({ message: 'Credenciales inválidas' });
  }

  // Generar el token JWT
  const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET, { expiresIn: '30s' });

  // Responder con un mensaje de bienvenida y el token
  res.json({ message: `Bienvenido ${user.name}`, token });
});

// Endpoint para actualizar un usuario
app.put('/users/:dpi', authenticateToken, (req, res) => {
  const { dpi } = req.params;
  const { name, email, password, newDpi } = req.body;

  const userIndex = users.findIndex(user => user.dpi === dpi);
  if (userIndex === -1) {
    return res.status(404).json({ message: 'Usuario no encontrado' });
  }

  // Validar que el nuevo DPI no esté ya en uso si se va a cambiar
  if (newDpi && users.some(user => user.dpi === newDpi)) {
    return res.status(400).json({ message: 'El nuevo DPI ya está registrado' });
  }

  // Actualizar datos
  users[userIndex] = { ...users[userIndex], name, email, password, dpi: newDpi || dpi };
  res.json(users[userIndex]);
});

// Endpoint para eliminar un usuario
app.delete('/users/:dpi', authenticateToken, (req, res) => {
  const { dpi } = req.params;

  const userIndex = users.findIndex(user => user.dpi === dpi);
  if (userIndex === -1) {
    return res.status(404).json({ message: 'Usuario no encontrado' });
  }

  // Eliminar el usuario del arreglo
  users.splice(userIndex, 1);

  // Responder con un mensaje de éxito
  res.status(200).json({ message: `Usuario con DPI ${dpi} eliminado exitosamente` });
});

const PORT = process.env.PORT || 3000;  // Usará el puerto de Render o el 3000 localmente
app.listen(PORT, () => {
  console.log(`API escuchando en el puerto ${PORT}`);
});
