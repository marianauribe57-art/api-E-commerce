const express = require('express');
const router = express.Router();
const db = require('../db');

// GET - Obtener todos los detalles de pedido
router.get('/detalle_pedido', (req, res) => {
    const { pedidoId, productoId, cantidad, precio } = req.query;

    let query = "SELECT * FROM Detalle_Pedido WHERE 1=1";
    let params = [];

    const filters = { pedidoId, productoId, cantidad, precio };
    Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
            query += ` AND ${key} = ?`;
            params.push(Number(value));
        }
    });

    db.all(query, params, (err, rows) => {
        if (err) return res.status(500).json({ success: false, error: err.message });
        res.json({ success: true, total: rows.length, data: rows });
    });
});

// GET - Obtener un detalle de pedido por ID
router.get('/detalle_pedido/:id', (req, res) => {
    if (isNaN(req.params.id)) {
        return res.status(400).json({ success: false, message: 'El ID debe ser un número válido' });
    }

    const id = parseInt(req.params.id);

    db.get("SELECT * FROM Detalle_Pedido WHERE id = ?", [id], (err, row) => {
        if (err) return res.status(500).json({ success: false, error: err.message });
        if (!row) return res.status(404).json({ success: false, message: 'Detalle de pedido no encontrado' });
        res.json({ success: true, data: row });
    });
});

// POST - Crear nuevo detalle de pedido
router.post('/detalle_pedido', (req, res) => {
    const { pedidoId, productoId, cantidad, precio } = req.body;

    if (!pedidoId || !productoId || cantidad === undefined || precio === undefined) {
        return res.status(400).json({ success: false, message: 'Faltan datos requeridos: pedidoId, productoId, cantidad, precio' });
    }

    if (isNaN(pedidoId) || parseInt(pedidoId) <= 0) {
        return res.status(400).json({ success: false, message: 'El pedidoId debe ser un número válido mayor a 0' });
    }

    if (isNaN(productoId) || parseInt(productoId) <= 0) {
        return res.status(400).json({ success: false, message: 'El productoId debe ser un número válido mayor a 0' });
    }

    if (isNaN(cantidad) || parseInt(cantidad) <= 0) {
        return res.status(400).json({ success: false, message: 'La cantidad debe ser un número mayor a 0' });
    }

    if (isNaN(precio) || parseFloat(precio) <= 0) {
        return res.status(400).json({ success: false, message: 'El precio debe ser un número mayor a 0' });
    }

    // Verificar que el pedido existe (FK)
    db.get("SELECT * FROM Pedidos WHERE id = ?", [pedidoId], (err, pedido) => {
        if (err) return res.status(500).json({ success: false, error: err.message });
        if (!pedido) return res.status(404).json({ success: false, message: 'El pedido no existe' });

        // Verificar que el producto existe (FK)
        db.get("SELECT * FROM Productos WHERE id = ?", [productoId], (err, producto) => {
            if (err) return res.status(500).json({ success: false, error: err.message });
            if (!producto) return res.status(404).json({ success: false, message: 'El producto no existe' });

            // Verificar que hay stock suficiente
            if (producto.stock < cantidad) {
                return res.status(400).json({ success: false, message: `Stock insuficiente. Stock disponible: ${producto.stock}` });
            }

            db.run(
                "INSERT INTO Detalle_Pedido (pedidoId, productoId, cantidad, precio) VALUES (?, ?, ?, ?)",
                [pedidoId, productoId, cantidad, precio],
                function (err) {
                    if (err) return res.status(500).json({ success: false, error: err.message });

                    // Descontar stock del producto
                    db.run("UPDATE Productos SET stock = stock - ? WHERE id = ?", [cantidad, productoId]);

                    res.status(201).json({ success: true, data: { id: this.lastID, pedidoId, productoId, cantidad, precio } });
                }
            );
        });
    });
});

// PUT - Actualizar detalle de pedido por ID
router.put('/detalle_pedido/:id', (req, res) => {
    if (isNaN(req.params.id)) {
        return res.status(400).json({ success: false, message: 'El ID debe ser un número válido' });
    }

    const id = parseInt(req.params.id);
    const { pedidoId, productoId, cantidad, precio } = req.body;

    if (!pedidoId || !productoId || cantidad === undefined || precio === undefined) {
        return res.status(400).json({ success: false, message: 'Faltan datos requeridos: pedidoId, productoId, cantidad, precio' });
    }

    if (isNaN(pedidoId) || parseInt(pedidoId) <= 0) {
        return res.status(400).json({ success: false, message: 'El pedidoId debe ser un número válido mayor a 0' });
    }

    if (isNaN(productoId) || parseInt(productoId) <= 0) {
        return res.status(400).json({ success: false, message: 'El productoId debe ser un número válido mayor a 0' });
    }

    if (isNaN(cantidad) || parseInt(cantidad) <= 0) {
        return res.status(400).json({ success: false, message: 'La cantidad debe ser un número mayor a 0' });
    }

    if (isNaN(precio) || parseFloat(precio) <= 0) {
        return res.status(400).json({ success: false, message: 'El precio debe ser un número mayor a 0' });
    }

    // Verificar que el detalle existe
    db.get("SELECT * FROM Detalle_Pedido WHERE id = ?", [id], (err, row) => {
        if (err) return res.status(500).json({ success: false, error: err.message });
        if (!row) return res.status(404).json({ success: false, message: 'Detalle de pedido no encontrado' });

        // Verificar que el pedido existe (FK)
        db.get("SELECT * FROM Pedidos WHERE id = ?", [pedidoId], (err, pedido) => {
            if (err) return res.status(500).json({ success: false, error: err.message });
            if (!pedido) return res.status(404).json({ success: false, message: 'El pedido no existe' });

            // Verificar que el producto existe (FK)
            db.get("SELECT * FROM Productos WHERE id = ?", [productoId], (err, producto) => {
                if (err) return res.status(500).json({ success: false, error: err.message });
                if (!producto) return res.status(404).json({ success: false, message: 'El producto no existe' });

                db.run(
                    "UPDATE Detalle_Pedido SET pedidoId = ?, productoId = ?, cantidad = ?, precio = ? WHERE id = ?",
                    [pedidoId, productoId, cantidad, precio, id],
                    function (err) {
                        if (err) return res.status(500).json({ success: false, error: err.message });
                        res.json({ success: true, data: 'Detalle de pedido actualizado' });
                    }
                );
            });
        });
    });
});

// DELETE - Eliminar detalle de pedido por ID
router.delete('/detalle_pedido/:id', (req, res) => {
    if (isNaN(req.params.id)) {
        return res.status(400).json({ success: false, message: 'El ID debe ser un número válido' });
    }

    const id = parseInt(req.params.id);

    db.get("SELECT * FROM Detalle_Pedido WHERE id = ?", [id], (err, row) => {
        if (err) return res.status(500).json({ success: false, error: err.message });
        if (!row) return res.status(404).json({ success: false, message: 'Detalle de pedido no encontrado' });

        db.run("DELETE FROM Detalle_Pedido WHERE id = ?", [id], function (err) {
            if (err) return res.status(500).json({ success: false, error: err.message });
            res.status(200).json({ success: true, data: 'El detalle de pedido se ha eliminado' });
        });
    });
});

module.exports = router;