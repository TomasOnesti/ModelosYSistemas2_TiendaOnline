const express = require("express");
const { load, save, nextId, addAuditoria, addMovimiento } = require("../db");
const { authOptional, authRequired, requirePermiso } = require("../middleware");

const router = express.Router();

// GET /api/products  (público — solo activos por defecto)
router.get("/", authOptional, (req, res) => {
  const db = load();
  const { search = "", tags = "", all = "false" } = req.query;
  let list = db.products;

  // Solo admin/vendedor pueden ver inactivos
  const canSeeAll = req.user && ["vendedor", "admin"].includes(req.user.rol);
  if (all !== "true" || !canSeeAll) {
    list = list.filter((p) => p.activo);
  }

  if (tags) {
    const tagIds = tags.split(",").map(Number).filter(Boolean);
    if (tagIds.length) {
      list = list.filter((p) => tagIds.every((t) => p.tags.includes(t)));
    }
  }
  if (search.trim()) {
    const q = search.trim().toLowerCase();
    list = list.filter(
      (p) => p.nombre.toLowerCase().includes(q) || p.descripcion.toLowerCase().includes(q)
    );
  }

  res.json(list);
});

// GET /api/products/:id
router.get("/:id", authOptional, (req, res) => {
  const db = load();
  const p = db.products.find((x) => x.id === Number(req.params.id));
  if (!p) return res.status(404).json({ error: "Producto no encontrado" });
  if (!p.activo) {
    const canSee = req.user && ["vendedor", "admin"].includes(req.user.rol);
    if (!canSee) return res.status(404).json({ error: "Producto no encontrado" });
  }
  res.json(p);
});

// POST /api/products
router.post("/", authRequired, requirePermiso("AGREGAR_PRODUCTO"), (req, res) => {
  const { nombre, descripcion, precio, stock, imagen, tags } = req.body;
  if (!nombre || precio == null) {
    return res.status(400).json({ error: "Nombre y precio son obligatorios" });
  }

  const db = load();
  const product = {
    id: nextId(db.products),
    nombre,
    descripcion: descripcion || "",
    precio: Number(precio),
    stock: Number(stock) || 0,
    activo: true,
    imagen: imagen || "https://images.unsplash.com/photo-1560393464-5c69a73c5770?w=400&h=300&fit=crop",
    tags: tags || [],
    fechaCreacion: new Date().toISOString()
  };
  db.products.push(product);
  addMovimiento(db, {
    productoId: product.id,
    usuarioId: req.user.id,
    tipo: "ALTA_INICIAL",
    cantidad: product.stock,
    stockAnterior: 0,
    stockNuevo: product.stock
  });
  addAuditoria(db, req.user.id, "CREAR_PRODUCTO", "Producto", product.id, null, product);
  save(db);
  res.status(201).json(product);
});

// PUT /api/products/:id
router.put("/:id", authRequired, requirePermiso("EDITAR_PRODUCTO"), (req, res) => {
  const db = load();
  const product = db.products.find((x) => x.id === Number(req.params.id));
  if (!product) return res.status(404).json({ error: "Producto no encontrado" });

  const anterior = { ...product };
  const { nombre, descripcion, precio, imagen, tags } = req.body;
  if (nombre != null) product.nombre = nombre;
  if (descripcion != null) product.descripcion = descripcion;
  if (precio != null) product.precio = Number(precio);
  if (imagen != null) product.imagen = imagen;
  if (tags != null) product.tags = tags;

  addAuditoria(db, req.user.id, "EDITAR_PRODUCTO", "Producto", product.id, anterior, product);
  save(db);
  res.json(product);
});

// PATCH /api/products/:id/stock  — reponer
router.patch("/:id/stock", authRequired, requirePermiso("REPONER_STOCK"), (req, res) => {
  const cantidad = Number(req.body.cantidad);
  if (!cantidad || cantidad <= 0) {
    return res.status(400).json({ error: "La cantidad debe ser mayor a 0" });
  }

  const db = load();
  const product = db.products.find((x) => x.id === Number(req.params.id));
  if (!product) return res.status(404).json({ error: "Producto no encontrado" });

  const anterior = product.stock;
  product.stock += cantidad;
  addMovimiento(db, {
    productoId: product.id,
    usuarioId: req.user.id,
    tipo: "REPOSICION",
    cantidad,
    stockAnterior: anterior,
    stockNuevo: product.stock
  });
  addAuditoria(db, req.user.id, "REPONER_STOCK", "Producto", product.id, { stock: anterior }, { stock: product.stock });
  save(db);
  res.json(product);
});

// DELETE /api/products/:id  — baja lógica
router.delete("/:id", authRequired, requirePermiso("ELIMINAR_PRODUCTO"), (req, res) => {
  const db = load();
  const product = db.products.find((x) => x.id === Number(req.params.id));
  if (!product) return res.status(404).json({ error: "Producto no encontrado" });

  const anterior = { ...product };
  product.activo = false;
  addMovimiento(db, {
    productoId: product.id,
    usuarioId: req.user.id,
    tipo: "BAJA",
    cantidad: 0,
    stockAnterior: product.stock,
    stockNuevo: product.stock
  });
  addAuditoria(db, req.user.id, "ELIMINAR_PRODUCTO", "Producto", product.id, anterior, product);
  save(db);
  res.status(204).end();
});

module.exports = router;
