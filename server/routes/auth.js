const express = require("express");
const { load, save, nextId, addAuditoria } = require("../db");
const { createToken, revokeToken, authRequired } = require("../middleware");

const router = express.Router();

// POST /api/auth/register
router.post("/register", (req, res) => {
  const { nombre, email, password } = req.body;
  if (!nombre || !email || !password) {
    return res.status(400).json({ error: "Completá todos los campos" });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: "La contraseña debe tener al menos 6 caracteres" });
  }

  const db = load();
  if (db.users.find((u) => u.email.toLowerCase() === email.toLowerCase())) {
    return res.status(409).json({ error: "El email ya está registrado" });
  }

  const user = {
    id: nextId(db.users),
    nombre,
    email,
    password,
    rol: "cliente",
    activo: true,
    fechaRegistro: new Date().toISOString()
  };
  db.users.push(user);
  addAuditoria(db, user.id, "REGISTRO", "Usuario", user.id, null, { email, rol: "cliente" });
  save(db);

  const token = createToken(user);
  res.status(201).json({
    token,
    user: { id: user.id, nombre: user.nombre, email: user.email, rol: user.rol }
  });
});

// POST /api/auth/login
router.post("/login", (req, res) => {
  const { email, password } = req.body;
  const db = load();
  const user = db.users.find((u) => u.email.toLowerCase() === (email || "").toLowerCase());

  if (!user) {
    addAuditoria(db, null, "LOGIN_FALLIDO", "Usuario", null, null, { email });
    save(db);
    return res.status(401).json({ error: "Credenciales incorrectas" });
  }
  if (!user.activo) {
    addAuditoria(db, user.id, "LOGIN_FALLIDO", "Usuario", user.id, null, { motivo: "cuenta inactiva" });
    save(db);
    return res.status(403).json({ error: "Tu cuenta está desactivada. Contactá al administrador." });
  }
  if (user.password !== password) {
    addAuditoria(db, user.id, "LOGIN_FALLIDO", "Usuario", user.id, null, { email });
    save(db);
    return res.status(401).json({ error: "Credenciales incorrectas" });
  }

  addAuditoria(db, user.id, "LOGIN", "Usuario", user.id, null, null);
  save(db);

  const token = createToken(user);
  res.json({
    token,
    user: { id: user.id, nombre: user.nombre, email: user.email, rol: user.rol }
  });
});

// POST /api/auth/logout
router.post("/logout", authRequired, (req, res) => {
  const db = load();
  addAuditoria(db, req.user.id, "LOGOUT", "Usuario", req.user.id, null, null);
  save(db);
  revokeToken(req.token);
  res.status(204).end();
});

// GET /api/auth/me
router.get("/me", authRequired, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
