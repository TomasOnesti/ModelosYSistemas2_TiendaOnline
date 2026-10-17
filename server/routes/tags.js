const express = require("express");
const { load, save, nextId, addAuditoria } = require("../db");
const { authOptional, authRequired, requirePermiso } = require("../middleware");

const router = express.Router();

// GET /api/tags  (público)
router.get("/", authOptional, (req, res) => {
  const db = load();
  res.json(db.tags);
});

// POST /api/tags
router.post("/", authRequired, requirePermiso("GESTIONAR_TAGS"), (req, res) => {
  const { nombre } = req.body;
  if (!nombre || !nombre.trim()) {
    return res.status(400).json({ error: "El nombre es obligatorio" });
  }

  const db = load();
  if (db.tags.find((t) => t.nombre.toLowerCase() === nombre.trim().toLowerCase())) {
    return res.status(409).json({ error: "El tag ya existe" });
  }

  const tag = { id: nextId(db.tags), nombre: nombre.trim() };
  db.tags.push(tag);
  addAuditoria(db, req.user.id, "CREAR_TAG", "Tag", tag.id, null, tag);
  save(db);
  res.status(201).json(tag);
});

// DELETE /api/tags/:id
router.delete("/:id", authRequired, requirePermiso("GESTIONAR_TAGS"), (req, res) => {
  const db = load();
  const idx = db.tags.findIndex((t) => t.id === Number(req.params.id));
  if (idx === -1) return res.status(404).json({ error: "Tag no encontrado" });

  const tag = db.tags[idx];
  db.products.forEach((p) => {
    p.tags = p.tags.filter((t) => t !== tag.id);
  });
  db.tags.splice(idx, 1);
  addAuditoria(db, req.user.id, "ELIMINAR_TAG", "Tag", tag.id, tag, null);
  save(db);
  res.status(204).end();
});

module.exports = router;
