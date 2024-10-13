"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
const bcrypt_1 = __importDefault(require("bcrypt")); // Asegúrate de instalar bcrypt
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use(express_1.default.json());
const users = [];
// Middleware para autenticar el token JWT
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        res.sendStatus(401); // No hay token, respuesta 401
        return; // Salir de la función
    }
    jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            res.sendStatus(403); // Token inválido, respuesta 403
            return; // Salir de la función
        }
        req.user = user; // Esto requiere la extensión de la interfaz Request
        next(); // Continuar con el siguiente middleware o endpoint
    });
}
// Endpoint para crear un usuario
app.post('/users', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
    const hashedPassword = yield bcrypt_1.default.hash(password, 10); // Hash de la contraseña
    const newUser = { dpi, name, email, password: hashedPassword };
    users.push(newUser);
    res.status(201).json({ message: 'Usuario creado exitosamente', user: newUser });
}));
// Endpoint para listar todos los usuarios (Protegido por JWT)
app.get('/users', authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.json(users);
}));
// Endpoint para iniciar sesión y generar un token JWT
app.post('/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email);
    if (!user || !(yield bcrypt_1.default.compare(password, user.password))) { // Comparar la contraseña
        res.status(401).json({ message: 'Credenciales inválidas' });
        return; // Salimos de la función
    }
    // Generar el token JWT
    const token = jsonwebtoken_1.default.sign({ email: user.email }, process.env.JWT_SECRET, { expiresIn: '30s' });
    res.json({ message: `Bienvenido ${user.name}`, token });
}));
// Endpoint para actualizar un usuario
app.put('/users/:dpi', authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
    const updatedUser = Object.assign(Object.assign({}, users[userIndex]), { name: name || users[userIndex].name, email: email || users[userIndex].email, password: password ? yield bcrypt_1.default.hash(password, 10) : users[userIndex].password, dpi: newDpi || dpi // Actualiza el DPI solo si se proporciona
     });
    users[userIndex] = updatedUser;
    // Responder con el usuario actualizado
    res.status(200).json(updatedUser);
}));
// Endpoint para eliminar un usuario
app.delete('/users/:dpi', authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
}));
const PORT = process.env.PORT || 3000; // Usará el puerto de Render o el 3000 localmente
app.listen(PORT, () => {
    console.log(`API escuchando en el puerto ${PORT}`);
});
