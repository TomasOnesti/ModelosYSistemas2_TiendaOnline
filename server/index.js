/**
 * Servidor API REST + Frontend estático
 * Tienda Online — basado en diagramas UML
 */
const express = require("express");
const cors = require("cors");
const path = require("path");

const authRoutes = require("./routes/auth");
const productsRoutes = require("./routes/products");
const cartRoutes = require("./routes/cart");
const ordersRoutes = require("./routes/orders");
const usersRoutes = require("./routes/users");
const tagsRoutes = require("./routes/tags");
const movimientosRoutes = require("./routes/movimientos");
const auditoriaRoutes = require("./routes/auditoria");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// ── API REST ─────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", ordersRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/tags", tagsRoutes);
app.use("/api/movimientos", movimientosRoutes);
app.use("/api/auditoria", auditoriaRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ── Frontend estático ────────────────────────────────────
app.use(express.static(path.join(__dirname, "../public")));

// SPA fallback
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

app.listen(PORT, () => {
  console.log(`\n  🛒 Tienda Online corriendo en http://localhost:${PORT}`);
  console.log(`  📡 API REST en http://localhost:${PORT}/api\n`);
});
