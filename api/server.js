const express = require('express');
const mongoose = require('mongoose');
const Movie = require('./models/Movie');

const app = express();

// Middlewares
app.use(express.json()); // parse JSON bodies

// --- CORS: permitir peticiones desde el frontend ---
// Añadimos headers para evitar errores CORS y manejamos preflight (OPTIONS).
app.use((req, res, next) => {
    // Ajusta el valor de Access-Control-Allow-Origin según seguridad requerida
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

    // Si es una petición preflight, respondemos pronto
    if (req.method === 'OPTIONS') {
        return res.sendStatus(204);
    }

    next();
});

// 🔗 Conexión a MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/mflix', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('✅ Conectado a MongoDB'))
.catch(err => console.error('❌ Error al conectar a MongoDB:', err));


// Ruta de prueba
app.get('/', (req, res) => {
    res.send('Servidor nuevo funcionando 🚀');
});

// Rutas

// 👉 Obtener todas las películas
app.get('/movies', async (req, res) => {
    try {
        // Ordenar por `lastupdated` descendente (más reciente primero) y limitar a 50
        const movies = await Movie.find().sort({ lastupdated: -1 }).limit(50);
        res.json(movies);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 👉 Obtener una película por ID
app.get('/movies/:id', async (req, res) => {
    try {
        const movie = await Movie.findById(req.params.id);
        if (!movie) return res.status(404).json({ error: 'Película no encontrada' });
        res.json(movie);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 👉 Crear una nueva película
app.post('/movies', async (req, res) => {
    try {
        // Establecer `lastupdated` como string ISO en el servidor (compatible con orden lexicográfico)
        req.body.lastupdated = new Date().toISOString();
        const newMovie = new Movie(req.body);
        const saved = await newMovie.save();
        res.status(201).json(saved);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// 👉 Actualizar una película
app.put('/movies/:id', async (req, res) => {
    try {
        // Forzar `lastupdated` en formato ISO string desde el servidor
        const updatePayload = { ...req.body, lastupdated: new Date().toISOString() };
        const updated = await Movie.findByIdAndUpdate(req.params.id, updatePayload, { new: true });
        if (!updated) return res.status(404).json({ error: 'Película no encontrada' });
        res.json(updated);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// 👉 Eliminar una película
app.delete('/movies/:id', async (req, res) => {
    try {
        const deleted = await Movie.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ error: 'Película no encontrada' });
        res.json({ mensaje: 'Película eliminada' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// Manejador de errores
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: 'Error interno del servidor' });
});

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});

// Cierre detallado
const shutdown = () => {
    console.log('Cerrando servidor...');
    server.close(() => {
        console.log('Servidor detenido');
        process.exit(0);
    });
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);