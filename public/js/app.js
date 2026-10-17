/**
 * App — controlador principal (API REST + dark mode + footer)
 */
const App = {
  currentView: "catalog",
  filters: { search: "", tags: [] },
  currentProductId: null,
  _cache: {},

  async init() {
    this.initTheme();
    await Auth.init();
    this.render();
  },

  // ── Theme ──────────────────────────────────────────────
  initTheme() {
    const saved = localStorage.getItem("tienda_theme");
    const preferDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const dark = saved === "dark" || (!saved && preferDark);
    document.documentElement.classList.toggle("dark", dark);
  },

  toggleTheme() {
    const isDark = document.documentElement.classList.toggle("dark");
    localStorage.setItem("tienda_theme", isDark ? "dark" : "light");
    this.renderNavbar();
  },

  // ── Navigation ─────────────────────────────────────────
  navigate(view, param = null) {
    this.currentView = view;
    if (view === "product") this.currentProductId = param;
    if (view === "catalog") this.filters = { search: "", tags: [] };
    this.render();
    window.scrollTo({ top: 0, behavior: "smooth" });
  },

  // ── Render ─────────────────────────────────────────────
  async render() {
    this.renderNavbar();
    await this.renderView();
    this.bindViewEvents();
    this.renderFooter();
  },

  renderNavbar() {
    const user = Auth.currentUser();
    const isDark = document.documentElement.classList.contains("dark");
    const navLinks = document.getElementById("nav-links");
    const navUser = document.getElementById("nav-user");

    const active = (v) => {
      const map = { catalog: ["catalog", "product"], productsAdmin: ["productsAdmin", "tags"] };
      const views = map[v] || [v];
      return views.includes(this.currentView)
        ? "bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300"
        : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800";
    };

    let links = `<button onclick="App.navigate('catalog')" class="px-3 py-2 text-sm font-medium rounded-lg transition ${active("catalog")}">Catálogo</button>`;

    if (user) {
      if (Auth.hasPermission("VER_CARRITO")) {
        links += `<button onclick="App.navigate('cart')" class="px-3 py-2 text-sm font-medium rounded-lg transition ${active("cart")}">Carrito</button>`;
      }
      if (Auth.hasPermission("VER_HISTORIAL")) {
        links += `<button onclick="App.navigate('orders')" class="px-3 py-2 text-sm font-medium rounded-lg transition ${active("orders")}">Mis compras</button>`;
      }
      if (Auth.hasPermission("AGREGAR_PRODUCTO")) {
        links += `<button onclick="App.navigate('productsAdmin')" class="px-3 py-2 text-sm font-medium rounded-lg transition ${active("productsAdmin")}">Productos</button>`;
      }
      if (Auth.hasPermission("CONSULTAR_MOVIMIENTOS")) {
        links += `<button onclick="App.navigate('movimientos')" class="px-3 py-2 text-sm font-medium rounded-lg transition ${active("movimientos")}">Stock</button>`;
      }
      if (Auth.hasPermission("ASIGNAR_ROL")) {
        links += `<button onclick="App.navigate('usersAdmin')" class="px-3 py-2 text-sm font-medium rounded-lg transition ${active("usersAdmin")}">Usuarios</button>`;
      }
      if (Auth.hasPermission("CONSULTAR_AUDITORIA")) {
        links += `<button onclick="App.navigate('auditoria')" class="px-3 py-2 text-sm font-medium rounded-lg transition ${active("auditoria")}">Auditoría</button>`;
      }
    }
    navLinks.innerHTML = links;

    const themeBtn = `<button onclick="App.toggleTheme()" title="Cambiar tema" class="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition" aria-label="Tema">
      ${isDark
        ? `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/></svg>`
        : `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/></svg>`}
    </button>`;

    if (user) {
      navUser.innerHTML = `
        ${themeBtn}
        <div class="text-right hidden sm:block ml-1">
          <div class="text-sm font-medium text-slate-900 dark:text-white">${user.nombre}</div>
          <div class="text-xs">${Views.roleBadge(user.rol)}</div>
        </div>
        <button onclick="App.logout()" class="px-3 py-1.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition">Salir</button>`;
    } else {
      navUser.innerHTML = `
        ${themeBtn}
        <button onclick="App.navigate('login')" class="px-3 py-1.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">Iniciar sesión</button>
        <button onclick="App.navigate('register')" class="px-3.5 py-1.5 text-sm font-medium bg-primary-600 hover:bg-primary-700 text-white rounded-lg">Registrarse</button>`;
    }
  },

  renderFooter() {
    const el = document.getElementById("footer");
    if (el) el.innerHTML = Views.footer();
  },

  async renderView() {
    const app = document.getElementById("app");
    app.innerHTML = `<div class="flex justify-center py-20"><div class="spinner"></div></div>`;

    const guards = {
      cart: "VER_CARRITO", orders: "VER_HISTORIAL", productsAdmin: "AGREGAR_PRODUCTO",
      tags: "GESTIONAR_TAGS", movimientos: "CONSULTAR_MOVIMIENTOS",
      usersAdmin: "ASIGNAR_ROL", auditoria: "CONSULTAR_AUDITORIA"
    };
    if (guards[this.currentView] && !Auth.hasPermission(guards[this.currentView])) {
      this.currentView = "catalog";
    }

    try {
      switch (this.currentView) {
        case "login":
          app.innerHTML = Views.login();
          break;
        case "register":
          app.innerHTML = Views.register();
          break;
        case "catalog": {
          const [products, tags] = await Promise.all([
            API.getProducts({ search: this.filters.search, tags: this.filters.tags }),
            API.getTags()
          ]);
          this._cache.tags = tags;
          app.innerHTML = Views.catalog(products, tags, this.filters);
          break;
        }
        case "product": {
          const [p, tags] = await Promise.all([
            API.getProduct(this.currentProductId),
            API.getTags()
          ]);
          app.innerHTML = Views.productDetail(p, tags);
          break;
        }
        case "cart": {
          const cart = await API.getCart();
          app.innerHTML = Views.cart(cart);
          break;
        }
        case "orders": {
          const orders = await API.getOrders();
          app.innerHTML = Views.orders(orders);
          break;
        }
        case "productsAdmin": {
          const [products, tags] = await Promise.all([
            API.getProducts({ all: true }),
            API.getTags()
          ]);
          this._cache.tags = tags;
          this._cache.products = products;
          app.innerHTML = Views.productsAdmin(products, tags);
          break;
        }
        case "tags": {
          const tags = await API.getTags();
          app.innerHTML = Views.tags(tags);
          break;
        }
        case "movimientos": {
          const [movs, products] = await Promise.all([
            API.getMovimientos(),
            API.getProducts({ all: true })
          ]);
          let users = [];
          try { users = await API.getUsers(); } catch { /* vendedor no tiene acceso a users */ }
          // Fallback: construir usuarios mínimos desde movimientos no es ideal; dejar vacío ok
          app.innerHTML = Views.movimientos(movs, products, users);
          break;
        }
        case "usersAdmin": {
          const users = await API.getUsers();
          app.innerHTML = Views.usersAdmin(users);
          break;
        }
        case "auditoria": {
          const [logs, users] = await Promise.all([
            API.getAuditoria({ limit: 80 }),
            API.getUsers()
          ]);
          app.innerHTML = Views.auditoria(logs, users);
          break;
        }
        case "terminos":
          app.innerHTML = Views.terminos();
          break;
        case "privacidad":
          app.innerHTML = Views.privacidad();
          break;
        case "contacto":
          app.innerHTML = Views.contacto();
          break;
        default:
          app.innerHTML = Views.catalog([], [], {});
      }
    } catch (err) {
      app.innerHTML = Views.emptyState("⚠️", "Error al cargar", err.message);
    }
  },

  bindViewEvents() {
    const formLogin = document.getElementById("form-login");
    if (formLogin) {
      formLogin.onsubmit = async (e) => {
        e.preventDefault();
        const fd = new FormData(formLogin);
        try {
          await Auth.login(fd.get("email"), fd.get("password"));
          this.toast("Sesión iniciada", "success");
          this.navigate("catalog");
        } catch (err) { this.toast(err.message, "error"); }
      };
    }

    const formRegister = document.getElementById("form-register");
    if (formRegister) {
      formRegister.onsubmit = async (e) => {
        e.preventDefault();
        const fd = new FormData(formRegister);
        try {
          await Auth.register({ nombre: fd.get("nombre"), email: fd.get("email"), password: fd.get("password") });
          this.toast("Cuenta creada", "success");
          this.navigate("catalog");
        } catch (err) { this.toast(err.message, "error"); }
      };
    }

    const formTag = document.getElementById("form-tag");
    if (formTag) {
      formTag.onsubmit = async (e) => {
        e.preventDefault();
        try {
          await API.createTag(new FormData(formTag).get("nombre"));
          this.toast("Tag creado", "success");
          this.render();
        } catch (err) { this.toast(err.message, "error"); }
      };
    }

    const formProduct = document.getElementById("form-product");
    if (formProduct) {
      formProduct.onsubmit = async (e) => {
        e.preventDefault();
        const fd = new FormData(formProduct);
        const id = fd.get("id");
        const tags = [...formProduct.querySelectorAll('input[name="tags"]:checked')].map(c => Number(c.value));
        const data = {
          nombre: fd.get("nombre"),
          descripcion: fd.get("descripcion"),
          precio: Number(fd.get("precio")),
          imagen: fd.get("imagen"),
          tags
        };
        try {
          if (id) {
            await API.updateProduct(Number(id), data);
            this.toast("Producto actualizado", "success");
          } else {
            data.stock = Number(fd.get("stock") || 0);
            await API.createProduct(data);
            this.toast("Producto creado", "success");
          }
          this.closeModal();
          this.navigate("productsAdmin");
        } catch (err) { this.toast(err.message, "error"); }
      };
    }

    const formRestock = document.getElementById("form-restock");
    if (formRestock) {
      formRestock.onsubmit = async (e) => {
        e.preventDefault();
        const fd = new FormData(formRestock);
        try {
          await API.restockProduct(Number(fd.get("id")), Number(fd.get("cantidad")));
          this.toast("Stock repuesto", "success");
          this.closeModal();
          this.render();
        } catch (err) { this.toast(err.message, "error"); }
      };
    }
  },

  // ── Actions ────────────────────────────────────────────
  applyFilters() {
    this.filters.search = document.getElementById("search-input")?.value || "";
    this.render();
  },

  toggleTag(tagId) {
    const idx = this.filters.tags.indexOf(tagId);
    if (idx >= 0) this.filters.tags.splice(idx, 1);
    else this.filters.tags.push(tagId);
    this.render();
  },

  async addToCart(productoId, cantidad = 1) {
    try {
      await API.addToCart(productoId, cantidad);
      this.toast("Agregado al carrito", "success");
      this.renderNavbar();
    } catch (err) { this.toast(err.message, "error"); }
  },

  async updateCartItem(productoId, cantidad) {
    try {
      if (cantidad <= 0) await API.removeCartItem(productoId);
      else await API.updateCartItem(productoId, cantidad);
      this.render();
    } catch (err) { this.toast(err.message, "error"); }
  },

  async checkout() {
    try {
      const compra = await API.createOrder();
      this.toast(`¡Compra #${compra.id} confirmada! Total: ${Views.formatPrice(compra.total)}`, "success");
      this.navigate("orders");
    } catch (err) { this.toast(err.message, "error"); }
  },

  async showProductForm(id = null) {
    let product = null;
    if (id) {
      product = (this._cache.products || []).find(p => p.id === id) || await API.getProduct(id);
    }
    const tags = this._cache.tags || await API.getTags();
    document.getElementById("modal-root").innerHTML = Views.productFormModal(product, tags);
    this.bindViewEvents();
  },

  async showRestockForm(id) {
    const product = (this._cache.products || []).find(p => p.id === id) || await API.getProduct(id);
    document.getElementById("modal-root").innerHTML = Views.restockModal(product);
    this.bindViewEvents();
  },

  closeModal() {
    document.getElementById("modal-root").innerHTML = "";
  },

  async deleteProduct(id) {
    if (!confirm("¿Dar de baja este producto?")) return;
    try {
      await API.deleteProduct(id);
      this.toast("Producto dado de baja", "success");
      this.render();
    } catch (err) { this.toast(err.message, "error"); }
  },

  async deleteTag(id) {
    if (!confirm("¿Eliminar este tag?")) return;
    try {
      await API.deleteTag(id);
      this.toast("Tag eliminado", "success");
      this.render();
    } catch (err) { this.toast(err.message, "error"); }
  },

  async changeRole(userId, rol) {
    try {
      await API.changeRole(userId, rol);
      this.toast(`Rol actualizado a ${rol}`, "success");
      this.render();
    } catch (err) { this.toast(err.message, "error"); }
  },

  async toggleUserActive(userId, activo) {
    try {
      await API.toggleActive(userId, activo);
      this.toast(activo ? "Usuario activado" : "Usuario desactivado", "success");
      this.render();
    } catch (err) { this.toast(err.message, "error"); }
  },

  async logout() {
    await Auth.logout();
    this.toast("Sesión cerrada", "info");
    this.navigate("catalog");
  },

  toast(message, type = "info") {
    const colors = { success: "bg-green-600", error: "bg-red-600", info: "bg-slate-700" };
    const el = document.createElement("div");
    el.className = `toast-enter ${colors[type] || colors.info} text-white text-sm font-medium px-4 py-3 rounded-xl shadow-lg max-w-sm`;
    el.textContent = message;
    document.getElementById("toasts").appendChild(el);
    setTimeout(() => { el.style.opacity = "0"; el.style.transition = "opacity 0.3s"; setTimeout(() => el.remove(), 300); }, 3200);
  }
};

document.addEventListener("DOMContentLoaded", () => App.init());
