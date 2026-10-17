const express = require("express");
const { load } = require("../db");
const { authRequired, requirePermiso } = require("../middleware");

const router = express.Router();

// GET /api/auditoria
router.get("/", authRequired, requirePermiso("CONSULTAR_AUDITORIA"), (req, res) => {
  const db = load();
  let list = db.auditoria;
  if (req.query.usuarioId) {
    list = list.filter((a) => a.usuarioId === Number(req.query.usuarioId));
  }
  if (req.query.accion) {
    list = list.filter((a) => a.accion === req.query.accion);
  }
  const limit = Number(req.query.limit) || 100;
  list = [...list].sort((a, b) => new Date(b.fecha) - new Date(a.fecha)).slice(0, limit);
  res.json(list);
});

module.exports = router;
