const express = require('express');
const router = express.Router();
const db = require('../db');

// GET - Obtener todos los usuarios
router.get('/usuarios', (req, res) => {
    const { nombre, email, rol, activo } = req.query;

    let query = "SELECT * FROM Usuarios WHERE 1=1";
    let params = [];

    const filters = { nombre, email, rol, activo };
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

// GET - Obtener un usuario por ID
router.get('/usuarios/:id', (req, res) => {
    if (isNaN(req.params.id)) {
        return res.status(400).json({ success: false, message: 'El ID debe ser un número válido' });
    }

    const id = parseInt(req.params.id);

    db.get("SELECT * FROM Usuarios WHERE id = ?", [id], (err, row) => {
        if (err) return res.status(500).json({ success: false, error: err.message });
        if (!row) return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
        res.json({ success: true, data: row });
    });
});

// POST - Crear un nuevo usuario
router.post('/usuarios', (req, res) => {
    const { nombre, email, rol, activo } = req.body;

    if (!nombre || !email || !rol || activo === undefined) {
        return res.status(400).json({ success: false, message: 'Faltan datos requeridos: nombre, email, rol, activo' });
    }

    if (typeof activo !== 'boolean') {
        return res.status(400).json({ success: false, message: 'El campo activo debe ser true o false' });
    }

    if (!['admin', 'cliente'].includes(rol)) {
        return res.status(400).json({ success: false, message: 'El rol debe ser admin o cliente' });
    }

    db.get("SELECT * FROM Usuarios WHERE LOWER(email) = LOWER(?)", [email], (err, row) => {
        if (err) return res.status(500).json({ success: false, error: err.message });
        if (row) return res.status(400).json({ success: false, message: 'El email ya está registrado' });

        db.run(
            "INSERT INTO Usuarios (nombre, email, rol, activo) VALUES (?, ?, ?, ?)",
            [nombre, email, rol, activo],
            function (err) {
                if (err) return res.status(500).json({ success: false, error: err.message });
                res.status(201).json({ success: true, data: { id: this.lastID, nombre, email, rol, activo } });
            }
        );
    });
});

// PUT - Actualizar un usuario por ID
router.put('/usuarios/:id', (req, res) => {
    if (isNaN(req.params.id)) {
        return res.status(400).json({ success: false, message: 'El ID debe ser un número válido' });
    }

    const id = parseInt(req.params.id);
    const { nombre, email, rol, activo } = req.body;

    if (!nombre || !email || !rol || activo === undefined) {
        return res.status(400).json({ success: false, message: 'Faltan datos requeridos: nombre, email, rol, activo' });
    }

    if (typeof activo !== 'boolean') {
        return res.status(400).json({ success: false, message: 'El campo activo debe ser true o false' });
    }

    if (!['admin', 'cliente'].includes(rol)) {
        return res.status(400).json({ success: false, message: 'El rol debe ser admin o cliente' });
    }

    db.get("SELECT * FROM Usuarios WHERE id = ?", [id], (err, row) => {
        if (err) return res.status(500).json({ success: false, error: err.message });
        if (!row) return res.status(404).json({ success: false, message: 'Usuario no encontrado' });

        db.run(
            "UPDATE Usuarios SET nombre = ?, email = ?, rol = ?, activo = ? WHERE id = ?",
            [nombre, email, rol, activo, id],
            function (err) {
                if (err) return res.status(500).json({ success: false, error: err.message });
                res.json({ success: true, data: 'Usuario actualizado' });
            }
        );
    });
});

// DELETE - Eliminar un usuario por ID
router.delete('/usuarios/:id', (req, res) => {
    if (isNaN(req.params.id)) {
        return res.status(400).json({ success: false, message: 'El ID debe ser un número válido' });
    }

    const id = parseInt(req.params.id);

    db.get("SELECT * FROM Usuarios WHERE id = ?", [id], (err, row) => {
        if (err) return res.status(500).json({ success: false, error: err.message });
        if (!row) return res.status(404).json({ success: false, message: 'Usuario no encontrado' });

        db.run("DELETE FROM Usuarios WHERE id = ?", [id], function (err) {
            if (err) return res.status(500).json({ success: false, error: err.message });
            res.status(200).json({ success: true, data: 'El usuario se ha eliminado' });
        });
    });
});

module.exports = router;