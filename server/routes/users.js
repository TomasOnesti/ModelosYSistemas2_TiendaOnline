const express = require("express");
const { load, save, addAuditoria } = require("../db");
const { authRequired, requirePermiso } = require("../middleware");

const router = express.Router();

// GET /api/users
router.get("/", authRequired, requirePermiso("ASIGNAR_ROL", "ACTIVAR_USUARIOS"), (req, res) => {
  const db = load();
  const users = db.users.map(({ password, ...u }) => u);
  res.json(users);
});

// PATCH /api/users/:id/rol
router.patch("/:id/rol", authRequired, requirePermiso("ASIGNAR_ROL"), (req, res) => {
  const { rol } = req.body;
  if (!["cliente", "vendedor"].includes(rol)) {
    return res.status(400).json({ error: "Rol inválido. Solo cliente o vendedor." });
  }

  const db = load();
  const user = db.users.find((u) => u.id === Number(req.params.id));
  if (!user) return res.status(404).json({ error: "Usuario no encontrado" });
  if (user.rol === "admin") return res.status(403).json({ error: "No se puede cambiar el rol de un administrador" });
  if (user.id === req.user.id) return res.status(403).json({ error: "No podés cambiar tu propio rol" });

  const anterior = { rol: user.rol };
  user.rol = rol;
  addAuditoria(db, req.user.id, "CAMBIAR_ROL", "Usuario", user.id, anterior, { rol });
  save(db);

  const { password, ...safe } = user;
  res.json(safe);
});

// PATCH /api/users/:id/activo
router.patch("/:id/activo", authRequired, requirePermiso("ACTIVAR_USUARIOS"), (req, res) => {
  const db = load();
  const user = db.users.find((u) => u.id === Number(req.params.id));
  if (!user) return res.status(404).json({ error: "Usuario no encontrado" });
  if (user.rol === "admin") return res.status(403).json({ error: "No se puede desactivar un administrador" });
  if (user.id === req.user.id) return res.status(403).json({ error: "No podés desactivar tu propia cuenta" });

  const anterior = { activo: user.activo };
  user.activo = req.body.activo !== undefined ? Boolean(req.body.activo) : !user.activo;
  addAuditoria(db, req.user.id, "CAMBIAR_ESTADO", "Usuario", user.id, anterior, { activo: user.activo });
  save(db);

  const { password, ...safe } = user;
  res.json(safe);
});

module.exports = router;
