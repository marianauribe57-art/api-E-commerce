const express = require('express');
const router = express.Router();
const db = require('../db');

// GET - Obtener categorias
router.get('/categorias', (req, res) => {
    const { nombre, descripcion, activo } = req.query;

    let query = "SELECT * FROM Categorias WHERE 1=1";
    let params = [];

    const filters = { nombre, descripcion, activo };
    Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
            query += ` AND ${key} LIKE ?`;
            params.push(`%${value}%`);
        }
    });

    db.all(query, params, (err, rows) => {
        if (err) return res.status(500).json({ success: false, error: err.message });
        res.json({ success: true, total: rows.length, data: rows });
    });
});

// GET - Obtener una categoria por ID
router.get('/categorias/:id', (req, res) => {
    if (isNaN(req.params.id)) {
        return res.status(400).json({ success: false, message: 'El ID debe ser un número válido' });
    }

    const id = parseInt(req.params.id);

    db.get("SELECT * FROM Categorias WHERE id = ?", [id], (err, row) => {
        if (err) return res.status(500).json({ success: false, error: err.message });
        if (!row) return res.status(404).json({ success: false, message: 'Categoria no encontrada' });
        res.json({ success: true, data: row });
    });
});

// POST - Crear una nueva categoria
router.post('/categorias', (req, res) => {
    const { nombre, descripcion, activo } = req.body;

    if (!nombre || !descripcion || activo === undefined) {
        return res.status(400).json({ success: false, message: 'Faltan datos requeridos: nombre, descripcion, activo' });
    }

    if (typeof activo !== 'boolean') {
        return res.status(400).json({ success: false, message: 'El campo activo debe ser true o false' });
    }

    db.get("SELECT * FROM Categorias WHERE LOWER(nombre) = LOWER(?)", [nombre], (err, row) => {
        if (err) return res.status(500).json({ success: false, error: err.message });
        if (row) return res.status(400).json({ success: false, message: 'Ya existe una categoría con ese nombre' });

        db.run(
            "INSERT INTO Categorias (nombre, descripcion, activo) VALUES (?, ?, ?)",
            [nombre, descripcion, activo],
            function (err) {
                if (err) return res.status(500).json({ success: false, error: err.message });
                res.status(201).json({ success: true, data: { id: this.lastID, nombre, descripcion, activo } });
            }
        );
    });
});

// PUT - Actualizar una categoria por ID
router.put('/categorias/:id', (req, res) => {
    if (isNaN(req.params.id)) {
        return res.status(400).json({ success: false, message: 'El ID debe ser un número válido' });
    }

    const id = parseInt(req.params.id);
    const { nombre, descripcion, activo } = req.body;

    if (!nombre || !descripcion || activo === undefined) {
        return res.status(400).json({ success: false, message: 'Faltan datos requeridos: nombre, descripcion, activo' });
    }

    if (typeof activo !== 'boolean') {
        return res.status(400).json({ success: false, message: 'El campo activo debe ser true o false' });
    }

    db.get("SELECT * FROM Categorias WHERE id = ?", [id], (err, row) => {
        if (err) return res.status(500).json({ success: false, error: err.message });
        if (!row) return res.status(404).json({ success: false, message: 'Categoria no encontrada' });

        db.run(
            "UPDATE Categorias SET nombre = ?, descripcion = ?, activo = ? WHERE id = ?",
            [nombre, descripcion, activo, id],
            function (err) {
                if (err) return res.status(500).json({ success: false, error: err.message });
                res.json({ success: true, data: 'Categoria actualizada' });
            }
        );
    });
});

// DELETE - Eliminar una categoria por ID
router.delete('/categorias/:id', (req, res) => {
    if (isNaN(req.params.id)) {
        return res.status(400).json({ success: false, message: 'El ID debe ser un número válido' });
    }

    const id = parseInt(req.params.id);

    db.get("SELECT * FROM Categorias WHERE id = ?", [id], (err, row) => {
        if (err) return res.status(500).json({ success: false, error: err.message });
        if (!row) return res.status(404).json({ success: false, message: 'Categoria no encontrada' });

        db.run("DELETE FROM Categorias WHERE id = ?", [id], function (err) {
            if (err) return res.status(500).json({ success: false, error: err.message });
            res.status(200).json({ success: true, data: 'La Categoria se ha eliminado' });
        });
    });
});

module.exports = router;