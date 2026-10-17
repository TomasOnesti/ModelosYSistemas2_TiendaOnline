const express = require("express");
const { load } = require("../db");
const { authRequired, requirePermiso } = require("../middleware");

const router = express.Router();

// GET /api/movimientos
router.get("/", authRequired, requirePermiso("CONSULTAR_MOVIMIENTOS"), (req, res) => {
  const db = load();
  let list = db.movimientos;
  if (req.query.productoId) {
    list = list.filter((m) => m.productoId === Number(req.query.productoId));
  }
  list = [...list].sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
  res.json(list);
});

module.exports = router;
