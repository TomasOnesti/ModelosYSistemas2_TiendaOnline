const express = require("express");
const { load, save, nextId, addAuditoria, addMovimiento } = require("../db");
const { authRequired, requirePermiso } = require("../middleware");

const router = express.Router();

// POST /api/orders  — realizar compra
router.post("/", authRequired, requirePermiso("REALIZAR_COMPRA"), (req, res) => {
  const db = load();
  const cart = db.carritos[req.user.id];
  if (!cart || !cart.items.length) {
    return res.status(400).json({ error: "El carrito está vacío" });
  }

  // Validar stock
  for (const item of cart.items) {
    const p = db.products.find((x) => x.id === item.productoId);
    if (!p || !p.activo) {
      return res.status(400).json({ error: `Producto ${item.productoId} no disponible` });
    }
    if (p.stock < item.cantidad) {
      return res.status(400).json({ error: `Stock insuficiente para "${p.nombre}"` });
    }
  }

  const detalles = cart.items.map((item) => {
    const p = db.products.find((x) => x.id === item.productoId);
    return { productoId: item.productoId, cantidad: item.cantidad, precioUnitario: p.precio };
  });
  const total = detalles.reduce((s, d) => s + d.precioUnitario * d.cantidad, 0);
  const compraId = nextId(db.compras);

  const compra = {
    id: compraId,
    usuarioId: req.user.id,
    fecha: new Date().toISOString(),
    total,
    estado: "CONFIRMADA",
    detalles
  };

  // Descontar stock + movimientos
  for (const item of cart.items) {
    const p = db.products.find((x) => x.id === item.productoId);
    const anterior = p.stock;
    p.stock -= item.cantidad;
    addMovimiento(db, {
      productoId: item.productoId,
      usuarioId: req.user.id,
      compraId,
      tipo: "VENTA",
      cantidad: -item.cantidad,
      stockAnterior: anterior,
      stockNuevo: p.stock
    });
  }

  db.compras.push(compra);
  db.carritos[req.user.id] = { items: [], fechaActualizacion: new Date().toISOString() };
  addAuditoria(db, req.user.id, "REALIZAR_COMPRA", "Compra", compraId, null, compra);
  save(db);

  res.status(201).json(compra);
});

// GET /api/orders  — historial del usuario (o todas si admin)
router.get("/", authRequired, requirePermiso("VER_HISTORIAL"), (req, res) => {
  const db = load();
  let list = db.compras;
  if (req.user.rol !== "admin") {
    list = list.filter((c) => c.usuarioId === req.user.id);
  }
  list = [...list].sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
  res.json(list);
});

// GET /api/orders/:id
router.get("/:id", authRequired, requirePermiso("VER_HISTORIAL"), (req, res) => {
  const db = load();
  const compra = db.compras.find((c) => c.id === Number(req.params.id));
  if (!compra) return res.status(404).json({ error: "Compra no encontrada" });
  if (req.user.rol !== "admin" && compra.usuarioId !== req.user.id) {
    return res.status(403).json({ error: "No tenés permiso" });
  }
  res.json(compra);
});

module.exports = router;
