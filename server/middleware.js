/**
 * Middleware de autenticación y autorización (simula JWT)
 */
const { load, tienePermiso } = require("./db");

// Tokens en memoria (en prod sería JWT firmado)
const sessions = new Map();

function createToken(user) {
  const token = `tok_${user.id}_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  sessions.set(token, {
    id: user.id,
    email: user.email,
    rol: user.rol,
    exp: Date.now() + 8 * 60 * 60 * 1000
  });
  return token;
}

function revokeToken(token) {
  sessions.delete(token);
}

function getSession(token) {
  if (!token) return null;
  const session = sessions.get(token);
  if (!session) return null;
  if (Date.now() > session.exp) {
    sessions.delete(token);
    return null;
  }
  // Refrescar datos del usuario desde la BD
  const db = load();
  const user = db.users.find((u) => u.id === session.id);
  if (!user || !user.activo) {
    sessions.delete(token);
    return null;
  }
  return { id: user.id, nombre: user.nombre, email: user.email, rol: user.rol, activo: user.activo };
}

function authOptional(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  req.user = getSession(token);
  req.token = token;
  next();
}

function authRequired(req, res, next) {
  authOptional(req, res, () => {
    if (!req.user) {
      return res.status(401).json({ error: "No autenticado" });
    }
    next();
  });
}

function requirePermiso(...permisos) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "No autenticado" });
    }
    const ok = permisos.some((p) => tienePermiso(req.user.rol, p));
    if (!ok) {
      return res.status(403).json({ error: "No tenés permiso para esta acción" });
    }
    next();
  };
}

module.exports = { createToken, revokeToken, getSession, authOptional, authRequired, requirePermiso };
