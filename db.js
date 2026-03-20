const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./database.db', (err) => {
    if (err) console.error(err.message);
    else console.log('Conectado a la base de datos SQLite');
});

db.run(`PRAGMA foreign_keys = ON`);


db.run(`CREATE TABLE IF NOT EXISTS Categorias (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL UNIQUE,
    descripcion TEXT,
    activo INTEGER NOT NULL DEFAULT 1 CHECK(activo IN (0, 1))
)`);


db.run(`CREATE TABLE IF NOT EXISTS Usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    rol TEXT NOT NULL CHECK(rol IN ('admin', 'cliente')),
    activo INTEGER NOT NULL DEFAULT 1 CHECK(activo IN (0, 1))
)`);


db.run(`CREATE TABLE IF NOT EXISTS Productos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    precio REAL NOT NULL CHECK(precio > 0),
    descripcion TEXT,
    stock INTEGER NOT NULL DEFAULT 0 CHECK(stock >= 0),
    categoriaId INTEGER NOT NULL,
    FOREIGN KEY (categoriaId) REFERENCES Categorias(id)
)`);


db.run(`CREATE TABLE IF NOT EXISTS Pedidos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuarioId INTEGER NOT NULL,
    total REAL NOT NULL CHECK(total >= 0),
    estado TEXT NOT NULL CHECK(estado IN ('pendiente', 'enviado', 'entregado', 'cancelado')),
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuarioId) REFERENCES Usuarios(id)
)`);


db.run(`CREATE TABLE IF NOT EXISTS Detalle_Pedido (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pedidoId INTEGER NOT NULL,
    productoId INTEGER NOT NULL,
    cantidad INTEGER NOT NULL CHECK(cantidad > 0),
    precio REAL NOT NULL CHECK(precio > 0),
    FOREIGN KEY (pedidoId) REFERENCES Pedidos(id),
    FOREIGN KEY (productoId) REFERENCES Productos(id)
)`);

module.exports = db;