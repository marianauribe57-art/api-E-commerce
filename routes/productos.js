const express = require('express');
const router = express.Router();
const db = require('../db');

// GET - Obtener productos
router.get('/productos', (req, res) => {
    const { nombre, precio, descripcion, stock, categoriaId } = req.query;

    let query = "SELECT * FROM Productos WHERE 1=1";
    let params = [];

    const filters = { nombre, descripcion };
    Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
            query += ` AND ${key} LIKE ?`;
            params.push(`%${value}%`);
        }
    });

    if (precio !== undefined) { query += " AND precio = ?"; params.push(parseFloat(precio)); }
    if (stock !== undefined) { query += " AND stock = ?"; params.push(parseInt(stock)); }
    if (categoriaId !== undefined) { query += " AND categoriaId = ?"; params.push(parseInt(categoriaId)); }

    db.all(query, params, (err, rows) => {
        if (err) return res.status(500).json({ success: false, error: err.message });
        res.json({ success: true, total: rows.length, data: rows });
    });
});

// GET - Obtener un producto por ID
router.get('/productos/:id', (req, res) => {
    if (isNaN(req.params.id)) {
        return res.status(400).json({ success: false, message: 'El ID debe ser un número válido' });
    }

    const id = parseInt(req.params.id);

    db.get("SELECT * FROM Productos WHERE id = ?", [id], (err, row) => {
        if (err) return res.status(500).json({ success: false, error: err.message });
        if (!row) return res.status(404).json({ success: false, message: 'Producto no encontrado' });
        res.json({ success: true, data: row });
    });
});

// POST - Crear nuevo producto
router.post('/productos', (req, res) => {
    const { nombre, precio, descripcion, stock, categoriaId } = req.body;

    if (!nombre || precio === undefined || !descripcion || stock === undefined || !categoriaId) {
        return res.status(400).json({ success: false, message: 'Faltan datos requeridos: nombre, precio, descripcion, stock, categoriaId' });
    }

    if (isNaN(precio) || precio <= 0) {
        return res.status(400).json({ success: false, message: 'El precio debe ser un número mayor a 0' });
    }

    if (isNaN(stock) || stock < 0) {
        return res.status(400).json({ success: false, message: 'El stock debe ser un número mayor o igual a 0' });
    }

    // Verificar que la categoria existe (FK)
    db.get("SELECT * FROM Categorias WHERE id = ?", [categoriaId], (err, categoria) => {
        if (err) return res.status(500).json({ success: false, error: err.message });
        if (!categoria) return res.status(404).json({ success: false, message: 'La categoria no existe' });

        db.run(
            "INSERT INTO Productos (nombre, precio, descripcion, stock, categoriaId) VALUES (?, ?, ?, ?, ?)",
            [nombre, precio, descripcion, stock, categoriaId],
            function (err) {
                if (err) return res.status(500).json({ success: false, error: err.message });
                res.status(201).json({ success: true, data: { id: this.lastID, nombre, precio, descripcion, stock, categoriaId } });
            }
        );
    });
});

// PUT - Actualizar producto por ID
router.put('/productos/:id', (req, res) => {
    if (isNaN(req.params.id)) {
        return res.status(400).json({ success: false, message: 'El ID debe ser un número válido' });
    }

    const id = parseInt(req.params.id);
    const { nombre, precio, descripcion, stock, categoriaId } = req.body;

    if (!nombre || precio === undefined || !descripcion || stock === undefined || !categoriaId) {
        return res.status(400).json({ success: false, message: 'Faltan datos requeridos: nombre, precio, descripcion, stock, categoriaId' });
    }

    if (isNaN(precio) || precio <= 0) {
        return res.status(400).json({ success: false, message: 'El precio debe ser un número mayor a 0' });
    }

    if (isNaN(stock) || stock < 0) {
        return res.status(400).json({ success: false, message: 'El stock debe ser un número mayor o igual a 0' });
    }

    // Verificar que el producto existe
    db.get("SELECT * FROM Productos WHERE id = ?", [id], (err, row) => {
        if (err) return res.status(500).json({ success: false, error: err.message });
        if (!row) return res.status(404).json({ success: false, message: 'Producto no encontrado' });

        // Verificar que la categoria existe (FK)
        db.get("SELECT * FROM Categorias WHERE id = ?", [categoriaId], (err, categoria) => {
            if (err) return res.status(500).json({ success: false, error: err.message });
            if (!categoria) return res.status(404).json({ success: false, message: 'La categoria no existe' });

            db.run(
                "UPDATE Productos SET nombre = ?, precio = ?, descripcion = ?, stock = ?, categoriaId = ? WHERE id = ?",
                [nombre, precio, descripcion, stock, categoriaId, id],
                function (err) {
                    if (err) return res.status(500).json({ success: false, error: err.message });
                    res.json({ success: true, data: 'Producto actualizado' });
                }
            );
        });
    });
});

// DELETE - Eliminar un producto por ID
router.delete('/productos/:id', (req, res) => {
    if (isNaN(req.params.id)) {
        return res.status(400).json({ success: false, message: 'El ID debe ser un número válido' });
    }

    const id = parseInt(req.params.id);

    db.get("SELECT * FROM Productos WHERE id = ?", [id], (err, row) => {
        if (err) return res.status(500).json({ success: false, error: err.message });
        if (!row) return res.status(404).json({ success: false, message: 'Producto no encontrado' });

        db.run("DELETE FROM Productos WHERE id = ?", [id], function (err) {
            if (err) return res.status(500).json({ success: false, error: err.message });
            res.status(200).json({ success: true, data: 'El Producto se ha eliminado' });
        });
    });
});

module.exports = router;