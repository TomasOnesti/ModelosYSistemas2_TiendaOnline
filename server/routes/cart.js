const express = require("express");
const { load, save } = require("../db");
const { authRequired, requirePermiso } = require("../middleware");

const router = express.Router();

function getCart(db, usuarioId) {
  if (!db.carritos[usuarioId]) {
    db.carritos[usuarioId] = { items: [], fechaActualizacion: new Date().toISOString() };
  }
  return db.carritos[usuarioId];
}

function enrichCart(db, cart) {
  const items = cart.items.map((item) => {
    const p = db.products.find((x) => x.id === item.productoId);
    return {
      productoId: item.productoId,
      cantidad: item.cantidad,
      producto: p
        ? { id: p.id, nombre: p.nombre, precio: p.precio, stock: p.stock, imagen: p.imagen, activo: p.activo }
        : null
    };
  });
  const total = items.reduce((s, i) => s + (i.producto ? i.producto.precio * i.cantidad : 0), 0);
  return { items, total, fechaActualizacion: cart.fechaActualizacion };
}

// GET /api/cart
router.get("/", authRequired, requirePermiso("VER_CARRITO"), (req, res) => {
  const db = load();
  const cart = getCart(db, req.user.id);
  res.json(enrichCart(db, cart));
});

// POST /api/cart/items
router.post("/items", authRequired, requirePermiso("AGREGAR_CARRITO"), (req, res) => {
  const { productoId, cantidad = 1 } = req.body;
  const db = load();
  const product = db.products.find((x) => x.id === Number(productoId));
  if (!product || !product.activo) {
    return res.status(404).json({ error: "Producto no disponible" });
  }

  const cart = getCart(db, req.user.id);
  const existing = cart.items.find((i) => i.productoId === Number(productoId));
  const newQty = (existing ? existing.cantidad : 0) + Number(cantidad);

  if (product.stock < newQty) {
    return res.status(400).json({ error: "Stock insuficiente" });
  }

  if (existing) existing.cantidad = newQty;
  else cart.items.push({ productoId: Number(productoId), cantidad: Number(cantidad) });

  cart.fechaActualizacion = new Date().toISOString();
  save(db);
  res.json(enrichCart(db, cart));
});

// PUT /api/cart/items/:productoId
router.put("/items/:productoId", authRequired, requirePermiso("MODIFICAR_CARRITO"), (req, res) => {
  const cantidad = Number(req.body.cantidad);
  const productoId = Number(req.params.productoId);
  const db = load();
  const cart = getCart(db, req.user.id);
  const item = cart.items.find((i) => i.productoId === productoId);
  if (!item) return res.status(404).json({ error: "Ítem no encontrado en el carrito" });

  if (cantidad <= 0) {
    cart.items = cart.items.filter((i) => i.productoId !== productoId);
  } else {
    const product = db.products.find((x) => x.id === productoId);
    if (!product || product.stock < cantidad) {
      return res.status(400).json({ error: "Stock insuficiente" });
    }
    item.cantidad = cantidad;
  }

  cart.fechaActualizacion = new Date().toISOString();
  save(db);
  res.json(enrichCart(db, cart));
});

// DELETE /api/cart/items/:productoId
router.delete("/items/:productoId", authRequired, requirePermiso("MODIFICAR_CARRITO"), (req, res) => {
  const db = load();
  const cart = getCart(db, req.user.id);
  cart.items = cart.items.filter((i) => i.productoId !== Number(req.params.productoId));
  cart.fechaActualizacion = new Date().toISOString();
  save(db);
  res.json(enrichCart(db, cart));
});

module.exports = router;
