const express = require('express');
const router = express.Router();
const db = require('../db');

const estadosValidos = ['pendiente', 'enviado', 'entregado', 'cancelado'];

// GET - Obtener todos los pedidos
router.get('/pedidos', (req, res) => {
    const { usuarioId, estado, fecha } = req.query;

    let query = "SELECT * FROM Pedidos WHERE 1=1";
    let params = [];

    const filters = { estado, fecha };
    Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
            query += ` AND ${key} LIKE ?`;
            params.push(`%${value}%`);
        }
    });

    if (usuarioId !== undefined) { query += " AND usuarioId = ?"; params.push(parseInt(usuarioId)); }

    db.all(query, params, (err, rows) => {
        if (err) return res.status(500).json({ success: false, error: err.message });
        res.json({ success: true, total: rows.length, data: rows });
    });
});

// GET - Obtener pedido por ID
router.get('/pedidos/:id', (req, res) => {
    if (isNaN(req.params.id)) {
        return res.status(400).json({ success: false, message: 'El ID debe ser un número válido' });
    }

    const id = parseInt(req.params.id);

    db.get("SELECT * FROM Pedidos WHERE id = ?", [id], (err, row) => {
        if (err) return res.status(500).json({ success: false, error: err.message });
        if (!row) return res.status(404).json({ success: false, message: 'Pedido no encontrado' });
        res.json({ success: true, data: row });
    });
});

// POST - Crear nuevo pedido
router.post('/pedidos', (req, res) => {
    const { usuarioId, total, estado, fecha } = req.body;

    if (!usuarioId || total === undefined || !estado || !fecha) {
        return res.status(400).json({ success: false, message: 'Faltan datos requeridos: usuarioId, total, estado, fecha' });
    }

    if (isNaN(usuarioId) || parseInt(usuarioId) <= 0) {
        return res.status(400).json({ success: false, message: 'El usuarioId debe ser un número válido mayor a 0' });
    }

    if (isNaN(total) || total <= 0) {
        return res.status(400).json({ success: false, message: 'El total debe ser un número mayor a 0' });
    }

    if (!estadosValidos.includes(estado.toLowerCase())) {
        return res.status(400).json({ success: false, message: `El estado debe ser uno de: ${estadosValidos.join(', ')}` });
    }

    const fechaRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!fechaRegex.test(fecha)) {
        return res.status(400).json({ success: false, message: 'El formato de fecha debe ser YYYY-MM-DD' });
    }

    // Verificar que el usuario existe (FK)
    db.get("SELECT * FROM Usuarios WHERE id = ?", [usuarioId], (err, usuario) => {
        if (err) return res.status(500).json({ success: false, error: err.message });
        if (!usuario) return res.status(404).json({ success: false, message: 'El usuario no existe' });

        db.run(
            "INSERT INTO Pedidos (usuarioId, total, estado, fecha) VALUES (?, ?, ?, ?)",
            [usuarioId, total, estado, fecha],
            function (err) {
                if (err) return res.status(500).json({ success: false, error: err.message });
                res.status(201).json({ success: true, data: { id: this.lastID, usuarioId, total, estado, fecha } });
            }
        );
    });
});

// PUT - Actualizar pedido por ID
router.put('/pedidos/:id', (req, res) => {
    if (isNaN(req.params.id)) {
        return res.status(400).json({ success: false, message: 'El ID debe ser un número válido' });
    }

    const id = parseInt(req.params.id);
    const { usuarioId, total, estado, fecha } = req.body;

    if (!usuarioId || total === undefined || !estado || !fecha) {
        return res.status(400).json({ success: false, message: 'Faltan datos requeridos: usuarioId, total, estado, fecha' });
    }

    if (isNaN(usuarioId) || parseInt(usuarioId) <= 0) {
        return res.status(400).json({ success: false, message: 'El usuarioId debe ser un número válido mayor a 0' });
    }

    if (isNaN(total) || total <= 0) {
        return res.status(400).json({ success: false, message: 'El total debe ser un número mayor a 0' });
    }

    if (!estadosValidos.includes(estado.toLowerCase())) {
        return res.status(400).json({ success: false, message: `El estado debe ser uno de: ${estadosValidos.join(', ')}` });
    }

    const fechaRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!fechaRegex.test(fecha)) {
        return res.status(400).json({ success: false, message: 'El formato de fecha debe ser YYYY-MM-DD' });
    }

    // Verificar que el pedido existe
    db.get("SELECT * FROM Pedidos WHERE id = ?", [id], (err, row) => {
        if (err) return res.status(500).json({ success: false, error: err.message });
        if (!row) return res.status(404).json({ success: false, message: 'Pedido no encontrado' });

        // Verificar que el usuario existe (FK)
        db.get("SELECT * FROM Usuarios WHERE id = ?", [usuarioId], (err, usuario) => {
            if (err) return res.status(500).json({ success: false, error: err.message });
            if (!usuario) return res.status(404).json({ success: false, message: 'El usuario no existe' });

            db.run(
                "UPDATE Pedidos SET usuarioId = ?, total = ?, estado = ?, fecha = ? WHERE id = ?",
                [usuarioId, total, estado, fecha, id],
                function (err) {
                    if (err) return res.status(500).json({ success: false, error: err.message });
                    res.json({ success: true, data: 'Pedido actualizado' });
                }
            );
        });
    });
});

// DELETE - Eliminar pedido por ID
router.delete('/pedidos/:id', (req, res) => {
    if (isNaN(req.params.id)) {
        return res.status(400).json({ success: false, message: 'El ID debe ser un número válido' });
    }

    const id = parseInt(req.params.id);

    db.get("SELECT * FROM Pedidos WHERE id = ?", [id], (err, row) => {
        if (err) return res.status(500).json({ success: false, error: err.message });
        if (!row) return res.status(404).json({ success: false, message: 'Pedido no encontrado' });

        db.run("DELETE FROM Pedidos WHERE id = ?", [id], function (err) {
            if (err) return res.status(500).json({ success: false, error: err.message });
            res.status(200).json({ success: true, data: 'El pedido se ha eliminado' });
        });
    });
});

module.exports = router;