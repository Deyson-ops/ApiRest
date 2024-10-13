import express, { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt'; // Asegúrate de instalar bcrypt

dotenv.config();
const app = express();
app.use(express.json());

interface User {
  dpi: string;
  name: string;
  email: string;
  password: string; // La contraseña aquí puede ser en texto plano, pero será encriptada al guardar
}

interface RequestWithUser extends Request {
  user?: { email: string }; // Extiende la interfaz Request para incluir el usuario
}

const users: User[] = [];

// Middleware para autenticar el token JWT
function authenticateToken(req: RequestWithUser, res: Response, next: NextFunction): void {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.sendStatus(401); // No hay token, respuesta 401
    return; // Salir de la función
  }

  jwt.verify(token, process.env.JWT_SECRET as string, (err, user) => {
    if (err) {
      res.sendStatus(403); // Token inválido, respuesta 403
      return; // Salir de la función
    }
    req.user = user as { email: string }; // Esto requiere la extensión de la interfaz Request
    next(); // Continuar con el siguiente middleware o endpoint
  });
}


// Endpoint para crear un usuario
app.post('/users', async (req: Request, res: Response): Promise<void> => {
  const { dpi, name, email, password } = req.body;

  // Validar que todos los campos estén presentes
  if (!dpi || !name || !email || !password) {
    res.status(400).json({ message: 'Todos los campos son requeridos' });
    return; // Salimos de la función
  }

  // Validar que el DPI no exista
  const userExists = users.some(user => user.dpi === dpi);
  if (userExists) {
    res.status(400).json({ message: 'El DPI ya está registrado' });
    return; // Salimos de la función
  }

  const hashedPassword = await bcrypt.hash(password, 10); // Hash de la contraseña
  const newUser: User = { dpi, name, email, password: hashedPassword };
  users.push(newUser);
  res.status(201).json({ message: 'Usuario creado exitosamente', user: newUser });
});

// Endpoint para listar todos los usuarios (Protegido por JWT)
app.get('/users', authenticateToken, async (req: RequestWithUser, res: Response): Promise<void> => {
  res.json(users);
});

// Endpoint para iniciar sesión y generar un token JWT
app.post('/login', async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email);

  if (!user || !(await bcrypt.compare(password, user.password))) { // Comparar la contraseña
    res.status(401).json({ message: 'Credenciales inválidas' });
    return; // Salimos de la función
  }

  // Generar el token JWT
  const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET as string, { expiresIn: '30s' });
  res.json({ message: `Bienvenido ${user.name}`, token });
});

// Endpoint para actualizar un usuario
app.put('/users/:dpi', authenticateToken, async (req: RequestWithUser, res: Response): Promise<void> => {
  const { dpi } = req.params;
  const { name, email, password, newDpi } = req.body;

  const userIndex = users.findIndex(user => user.dpi === dpi);
  if (userIndex === -1) {
    res.status(404).json({ message: 'Usuario no encontrado' });
    return; // Salimos de la función
  }

  // Validar que el nuevo DPI no esté ya en uso si se va a cambiar
  if (newDpi && users.some(user => user.dpi === newDpi && user.dpi !== dpi)) {
    res.status(400).json({ message: 'El nuevo DPI ya está registrado' });
    return; // Salimos de la función
  }

  // Actualizar datos
  const updatedUser: User = {
    ...users[userIndex],
    name: name || users[userIndex].name, // Mantener el valor existente si no se proporciona
    email: email || users[userIndex].email, // Mantener el valor existente si no se proporciona
    password: password ? await bcrypt.hash(password, 10) : users[userIndex].password, // Solo si se pasa
    dpi: newDpi || dpi // Actualiza el DPI solo si se proporciona
  };

  users[userIndex] = updatedUser;

  // Responder con el mensaje de éxito y el usuario actualizado
  res.status(200).json({
    message: 'Usuario actualizado correctamente',
    user: updatedUser
  });
});


// Endpoint para eliminar un usuario
app.delete('/users/:dpi', authenticateToken, async (req: RequestWithUser, res: Response): Promise<void> => {
  const { dpi } = req.params;

  const userIndex = users.findIndex(user => user.dpi === dpi);
  if (userIndex === -1) {
    res.status(404).json({ message: 'Usuario no encontrado' });
    return; // Salimos de la función
  }

  // Eliminar el usuario del arreglo
  users.splice(userIndex, 1);

  // Responder con un mensaje de éxito
  res.status(200).json({ message: `Usuario con DPI ${dpi} eliminado exitosamente` });
});

const PORT = process.env.PORT || 3000; // Usará el puerto de Render o el 3000 localmente
app.listen(PORT, () => {
  console.log(`API escuchando en el puerto ${PORT}`);
});
