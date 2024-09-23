const express = require('express');
const app = express();
app.use(express.json());

const users = []; // Almacenará los usuarios

// Endpoint para crear un usuario
app.post('/users', (req, res) => {
  const { dpi, name, email, password } = req.body;

  // Validar que el DPI no exista
  const userExists = users.some(user => user.dpi === dpi);
  if (userExists) {
    return res.status(400).json({ message: 'El DPI ya está registrado' });
  }

  const newUser = { dpi, name, email, password };
  users.push(newUser);
  res.status(201).json(newUser);
});

// Endpoint para listar todos los usuarios
app.get('/users', (req, res) => {
  res.json(users);
});

// Endpoint para actualizar un usuario
app.put('/users/:dpi', (req, res) => {
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
app.delete('/users/:dpi', (req, res) => {
  const { dpi } = req.params;

  const userIndex = users.findIndex(user => user.dpi === dpi);
  if (userIndex === -1) {
    return res.status(404).json({ message: 'Usuario no encontrado' });
  }

  users.splice(userIndex, 1);
  res.status(204).send();
});

const PORT = process.env.PORT || 3000;  // Usará el puerto de Render o el 3000 localmente
app.listen(PORT, () => {
  console.log(`API escuchando en el puerto ${PORT}`);
});
