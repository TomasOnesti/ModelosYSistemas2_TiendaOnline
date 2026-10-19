/**
 * Cliente API REST — todas las llamadas al backend
 */
const API = {
  BASE: "/api",

  _token() {
    return sessionStorage.getItem("tienda_token") || null;
  },

  _headers(json = true) {
    const h = {};
    if (json) h["Content-Type"] = "application/json";
    const token = this._token();
    if (token) h["Authorization"] = `Bearer ${token}`;
    return h;
  },

  async _req(method, path, body = null) {
    const opts = { method, headers: this._headers(body !== null) };
    if (body !== null) opts.body = JSON.stringify(body);
    const res = await fetch(this.BASE + path, opts);
    if (res.status === 204) return null;
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || `Error ${res.status}`);
    return data;
  },

  // Auth
  register(data) { return this._req("POST", "/auth/register", data); },
  login(data) { return this._req("POST", "/auth/login", data); },
  logout() { return this._req("POST", "/auth/logout"); },
  me() { return this._req("GET", "/auth/me"); },

  // Products
  getProducts(params = {}) {
    const q = new URLSearchParams();
    if (params.search) q.set("search", params.search);
    if (params.tags?.length) q.set("tags", params.tags.join(","));
    if (params.all) q.set("all", "true");
    const qs = q.toString();
    return this._req("GET", "/products" + (qs ? "?" + qs : ""));
  },
  getProduct(id) { return this._req("GET", `/products/${id}`); },
  createProduct(data) { return this._req("POST", "/products", data); },
  updateProduct(id, data) { return this._req("PUT", `/products/${id}`, data); },
  restockProduct(id, cantidad) { return this._req("PATCH", `/products/${id}/stock`, { cantidad }); },
  deleteProduct(id) { return this._req("DELETE", `/products/${id}`); },

  // Tags
  getTags() { return this._req("GET", "/tags"); },
  createTag(nombre) { return this._req("POST", "/tags", { nombre }); },
  deleteTag(id) { return this._req("DELETE", `/tags/${id}`); },

  // Cart
  getCart() { return this._req("GET", "/cart"); },
  addToCart(productoId, cantidad = 1) { return this._req("POST", "/cart/items", { productoId, cantidad }); },
  updateCartItem(productoId, cantidad) { return this._req("PUT", `/cart/items/${productoId}`, { cantidad }); },
  removeCartItem(productoId) { return this._req("DELETE", `/cart/items/${productoId}`); },

  // Orders
  createOrder(data) { return this._req("POST", "/orders", data || {}); },
  getOrders() { return this._req("GET", "/orders"); },

  // Users
  getUsers() { return this._req("GET", "/users"); },
  changeRole(id, rol) { return this._req("PATCH", `/users/${id}/rol`, { rol }); },
  toggleActive(id, activo) { return this._req("PATCH", `/users/${id}/activo`, { activo }); },

  // Movimientos & Auditoría
  getMovimientos(productoId) {
    const qs = productoId ? `?productoId=${productoId}` : "";
    return this._req("GET", "/movimientos" + qs);
  },
  getAuditoria(params = {}) {
    const q = new URLSearchParams();
    if (params.limit) q.set("limit", params.limit);
    if (params.usuarioId) q.set("usuarioId", params.usuarioId);
    const qs = q.toString();
    return this._req("GET", "/auditoria" + (qs ? "?" + qs : ""));
  }
};

// Permisos (espejo del backend para UI)
const PERMISOS = {
  visitante: ["VER_CATALOGO", "VER_DETALLE", "FILTRAR_TAGS", "REGISTRARSE", "INICIAR_SESION"],
  cliente: ["VER_CATALOGO", "VER_DETALLE", "FILTRAR_TAGS", "CERRAR_SESION", "AGREGAR_CARRITO", "MODIFICAR_CARRITO", "VER_CARRITO", "REALIZAR_COMPRA", "VER_HISTORIAL"],
  vendedor: ["VER_CATALOGO", "VER_DETALLE", "FILTRAR_TAGS", "CERRAR_SESION", "AGREGAR_CARRITO", "MODIFICAR_CARRITO", "VER_CARRITO", "REALIZAR_COMPRA", "VER_HISTORIAL", "AGREGAR_PRODUCTO", "EDITAR_PRODUCTO", "REPONER_STOCK", "ELIMINAR_PRODUCTO", "GESTIONAR_TAGS", "CONSULTAR_MOVIMIENTOS"],
  admin: ["VER_CATALOGO", "VER_DETALLE", "FILTRAR_TAGS", "CERRAR_SESION", "AGREGAR_CARRITO", "MODIFICAR_CARRITO", "VER_CARRITO", "REALIZAR_COMPRA", "VER_HISTORIAL", "AGREGAR_PRODUCTO", "EDITAR_PRODUCTO", "REPONER_STOCK", "ELIMINAR_PRODUCTO", "GESTIONAR_TAGS", "CONSULTAR_MOVIMIENTOS", "ASIGNAR_ROL", "REVOCAR_ROL", "ACTIVAR_USUARIOS", "CONSULTAR_AUDITORIA"]
};

function tienePermiso(rol, permiso) {
  if (!rol) return PERMISOS.visitante.includes(permiso);
  return (PERMISOS[rol] || []).includes(permiso);
}
