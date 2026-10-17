/** Views — API REST + dark mode + footer */
const Views = {
  formatPrice(n) {
    return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(n);
  },
  formatDate(iso) {
    if (!iso) return "—";
    return new Date(iso).toLocaleString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
  },
  stockBadge(stock) {
    if (stock <= 0) return '<span class="text-red-500 dark:text-red-400 font-medium">Agotado</span>';
    if (stock <= 5) return `<span class="text-amber-600 dark:text-amber-400 font-medium">Quedan ${stock}</span>`;
    return `<span class="text-green-600 dark:text-green-400 font-medium">${stock} en stock</span>`;
  },
  roleBadge(rol) {
    const labels = { cliente: "Cliente", vendedor: "Vendedor", admin: "Administrador" };
    const colors = {
      cliente: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
      vendedor: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
      admin: "bg-pink-100 text-pink-800 dark:bg-pink-900/40 dark:text-pink-300"
    };
    return `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[rol] || ""}">${labels[rol] || rol}</span>`;
  },
  emptyState(icon, title, subtitle = "") {
    return `<div class="text-center py-16"><div class="text-5xl mb-4">${icon}</div>
      <h3 class="text-lg font-semibold text-slate-700 dark:text-slate-200">${title}</h3>
      ${subtitle ? `<p class="text-slate-500 dark:text-slate-400 mt-1">${subtitle}</p>` : ""}</div>`;
  },
  inputCls: "w-full px-3.5 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white",
  cardCls: "bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700",

  login() {
    return `<div class="max-w-md mx-auto mt-12"><div class="${this.cardCls} p-8 shadow-sm">
      <div class="text-center mb-8">
        <div class="w-14 h-14 bg-primary-600 rounded-xl flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4">T</div>
        <h1 class="text-2xl font-bold text-slate-900 dark:text-white">Iniciar sesión</h1>
        <p class="text-slate-500 dark:text-slate-400 mt-1">Accedé a tu cuenta</p>
      </div>
      <form id="form-login" class="space-y-5">
        <div><label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Email</label>
          <input type="email" name="email" required class="${this.inputCls}" placeholder="tu@email.com" /></div>
        <div><label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Contraseña</label>
          <input type="password" name="password" required class="${this.inputCls}" /></div>
        <button type="submit" class="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-2.5 rounded-lg">Entrar</button>
      </form>
      <p class="text-center text-sm text-slate-500 dark:text-slate-400 mt-6">¿No tenés cuenta?
        <a href="#" onclick="App.navigate('register');return false" class="text-primary-600 dark:text-primary-400 font-medium hover:underline">Registrate</a></p>
      <div class="mt-8 pt-6 border-t border-slate-100 dark:border-slate-700">
        <p class="text-xs font-medium text-slate-400 uppercase tracking-wide mb-3">Cuentas de prueba</p>
        <div class="space-y-2 text-xs text-slate-600 dark:text-slate-400">
          <div class="flex justify-between bg-slate-50 dark:bg-slate-900 rounded-lg px-3 py-2"><span>admin@tienda.com</span><span>admin123</span></div>
          <div class="flex justify-between bg-slate-50 dark:bg-slate-900 rounded-lg px-3 py-2"><span>vendedor@tienda.com</span><span>vendedor123</span></div>
          <div class="flex justify-between bg-slate-50 dark:bg-slate-900 rounded-lg px-3 py-2"><span>cliente@tienda.com</span><span>cliente123</span></div>
        </div>
      </div>
    </div></div>`;
  },

  register() {
    return `<div class="max-w-md mx-auto mt-12"><div class="${this.cardCls} p-8 shadow-sm">
      <div class="text-center mb-8"><h1 class="text-2xl font-bold text-slate-900 dark:text-white">Crear cuenta</h1>
        <p class="text-slate-500 dark:text-slate-400 mt-1">Registrate como cliente</p></div>
      <form id="form-register" class="space-y-5">
        <div><label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Nombre</label>
          <input type="text" name="nombre" required class="${this.inputCls}" /></div>
        <div><label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Email</label>
          <input type="email" name="email" required class="${this.inputCls}" /></div>
        <div><label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Contraseña</label>
          <input type="password" name="password" required minlength="6" class="${this.inputCls}" /></div>
        <button type="submit" class="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-2.5 rounded-lg">Registrarme</button>
      </form>
      <p class="text-center text-sm text-slate-500 dark:text-slate-400 mt-6">¿Ya tenés cuenta?
        <a href="#" onclick="App.navigate('login');return false" class="text-primary-600 dark:text-primary-400 font-medium hover:underline">Iniciá sesión</a></p>
    </div></div>`;
  },

  catalog(products, tags, filters = {}) {
    const user = Auth.currentUser();
    return `<div class="mb-8"><h1 class="text-2xl font-bold text-slate-900 dark:text-white">Catálogo de productos</h1>
      <p class="text-slate-500 dark:text-slate-400 mt-1">${products.length} producto(s)</p></div>
      <div class="${this.cardCls} p-4 mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div class="flex-1 w-full"><input type="search" id="search-input" value="${filters.search || ""}" placeholder="Buscar..."
          class="${this.inputCls}" onkeyup="if(event.key==='Enter') App.applyFilters()" /></div>
        <div class="flex flex-wrap gap-2">${tags.map(t => `<button onclick="App.toggleTag(${t.id})"
          class="px-3 py-1.5 rounded-full text-xs font-medium border transition ${(filters.tags || []).includes(t.id)
            ? "bg-primary-600 text-white border-primary-600"
            : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-600"}">${t.nombre}</button>`).join("")}</div>
        <button onclick="App.applyFilters()" class="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-medium rounded-lg">Filtrar</button>
      </div>
      ${products.length === 0 ? this.emptyState("🔍", "No se encontraron productos")
        : `<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">${products.map(p => this._productCard(p, user)).join("")}</div>`}`;
  },

  _productCard(p, user) {
    const canAdd = user && Auth.hasPermission("AGREGAR_CARRITO") && p.stock > 0;
    return `<div class="product-card ${this.cardCls} overflow-hidden flex flex-col">
      <div class="aspect-[4/3] bg-slate-100 dark:bg-slate-700 relative cursor-pointer" onclick="App.navigate('product', ${p.id})">
        <img src="${p.imagen}" alt="${p.nombre}" class="w-full h-full object-cover" onerror="this.src='https://images.unsplash.com/photo-1560393464-5c69a73c5770?w=400&h=300&fit=crop'" />
        ${p.stock <= 0 ? '<div class="absolute inset-0 bg-black/40 flex items-center justify-center"><span class="bg-red-500 text-white text-xs font-semibold px-3 py-1 rounded-full">Agotado</span></div>' : ""}
      </div>
      <div class="p-4 flex flex-col flex-1">
        <h3 class="font-semibold text-slate-900 dark:text-white cursor-pointer hover:text-primary-600" onclick="App.navigate('product', ${p.id})">${p.nombre}</h3>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 flex-1">${p.descripcion}</p>
        <div class="mt-3 flex items-center justify-between">
          <span class="text-lg font-bold text-slate-900 dark:text-white">${this.formatPrice(p.precio)}</span>
          ${this.stockBadge(p.stock)}
        </div>
        ${canAdd
          ? `<button onclick="App.addToCart(${p.id})" class="mt-3 w-full bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium py-2 rounded-lg">Agregar al carrito</button>`
          : !user
            ? `<button onclick="App.navigate('login')" class="mt-3 w-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-sm font-medium py-2 rounded-lg">Iniciá sesión para comprar</button>`
            : ""}
      </div></div>`;
  },

  productDetail(p, tags) {
    if (!p) return this.emptyState("❌", "Producto no encontrado");
    const user = Auth.currentUser();
    const canAdd = user && Auth.hasPermission("AGREGAR_CARRITO") && p.stock > 0;
    return `<button onclick="App.navigate('catalog')" class="text-sm text-primary-600 dark:text-primary-400 hover:underline mb-6">← Volver</button>
      <div class="${this.cardCls} overflow-hidden"><div class="grid md:grid-cols-2">
        <div class="aspect-square bg-slate-100 dark:bg-slate-700">
          <img src="${p.imagen}" class="w-full h-full object-cover" onerror="this.src='https://images.unsplash.com/photo-1560393464-5c69a73c5770?w=600&h=600&fit=crop'" />
        </div>
        <div class="p-8 flex flex-col">
          <div class="flex flex-wrap gap-1.5 mb-3">${(p.tags || []).map(tid => {
            const t = tags.find(x => x.id === tid);
            return t ? `<span class="text-xs bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 px-2.5 py-1 rounded-full font-medium">${t.nombre}</span>` : "";
          }).join("")}</div>
          <h1 class="text-2xl font-bold text-slate-900 dark:text-white">${p.nombre}</h1>
          <p class="text-3xl font-bold text-primary-600 dark:text-primary-400 mt-3">${this.formatPrice(p.precio)}</p>
          <div class="mt-2">${this.stockBadge(p.stock)}</div>
          <p class="text-slate-600 dark:text-slate-300 mt-6 flex-1">${p.descripcion}</p>
          ${canAdd
            ? `<div class="mt-8 flex gap-3">
                <input type="number" id="qty-detail" value="1" min="1" max="${p.stock}" class="w-20 px-3 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg text-sm text-center bg-white dark:bg-slate-900 text-slate-900 dark:text-white" />
                <button onclick="App.addToCart(${p.id}, parseInt(document.getElementById('qty-detail').value))" class="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-medium py-2.5 rounded-lg">Agregar al carrito</button>
              </div>`
            : !user
              ? `<button onclick="App.navigate('login')" class="mt-8 w-full bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium py-2.5 rounded-lg">Iniciá sesión</button>`
              : p.stock <= 0 ? `<div class="mt-8 text-center text-red-500 font-medium">Agotado</div>` : ""}
        </div>
      </div></div>`;
  },

  cart(cartData) {
    if (!cartData || !cartData.items.length) {
      return `<div class="mb-6"><h1 class="text-2xl font-bold text-slate-900 dark:text-white">Mi carrito</h1></div>
        ${this.emptyState("🛒", "Carrito vacío")}
        <div class="text-center"><button onclick="App.navigate('catalog')" class="px-5 py-2.5 bg-primary-600 text-white text-sm font-medium rounded-lg">Ir al catálogo</button></div>`;
    }
    return `<div class="mb-6"><h1 class="text-2xl font-bold text-slate-900 dark:text-white">Mi carrito</h1></div>
      <div class="grid lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2 space-y-3">${cartData.items.map(item => {
          const p = item.producto;
          if (!p) return "";
          return `<div class="${this.cardCls} p-4 flex gap-4 items-center">
            <img src="${p.imagen}" class="w-20 h-20 object-cover rounded-lg" onerror="this.src='https://images.unsplash.com/photo-1560393464-5c69a73c5770?w=100&h=100&fit=crop'" />
            <div class="flex-1"><h3 class="font-semibold text-slate-900 dark:text-white">${p.nombre}</h3>
              <p class="text-sm text-slate-500 dark:text-slate-400">${this.formatPrice(p.precio)} c/u</p></div>
            <div class="flex items-center gap-2">
              <button onclick="App.updateCartItem(${p.id}, ${item.cantidad - 1})" class="w-8 h-8 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300">−</button>
              <span class="w-8 text-center font-medium text-slate-900 dark:text-white">${item.cantidad}</span>
              <button onclick="App.updateCartItem(${p.id}, ${item.cantidad + 1})" class="w-8 h-8 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300">+</button>
            </div>
            <div class="text-right min-w-[90px]">
              <p class="font-bold text-slate-900 dark:text-white">${this.formatPrice(p.precio * item.cantidad)}</p>
              <button onclick="App.updateCartItem(${p.id}, 0)" class="text-xs text-red-500 hover:underline">Quitar</button>
            </div>
          </div>`;
        }).join("")}</div>
        <div class="${this.cardCls} p-6 h-fit sticky top-24">
          <h2 class="font-semibold text-slate-900 dark:text-white mb-4">Resumen</h2>
          <div class="flex justify-between font-bold text-lg border-t border-slate-100 dark:border-slate-700 pt-3">
            <span class="text-slate-900 dark:text-white">Total</span>
            <span class="text-primary-600 dark:text-primary-400">${this.formatPrice(cartData.total)}</span>
          </div>
          <button onclick="App.checkout()" class="mt-6 w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 rounded-lg">Confirmar compra</button>
        </div>
      </div>`;
  },

  orders(compras) {
    return `<div class="mb-6"><h1 class="text-2xl font-bold text-slate-900 dark:text-white">Mis compras</h1></div>
      ${!compras.length ? this.emptyState("📦", "Sin compras aún")
        : `<div class="space-y-4">${compras.map(c => `<div class="${this.cardCls} overflow-hidden">
          <div class="px-5 py-3 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700 flex justify-between flex-wrap gap-2">
            <span class="text-sm font-medium text-slate-900 dark:text-white">Compra #${c.id}
              <span class="text-xs px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300">${c.estado}</span></span>
            <span class="text-sm text-slate-500 dark:text-slate-400">${this.formatDate(c.fecha)}</span>
          </div>
          <div class="p-5">
            ${c.detalles.map(d => `<div class="flex justify-between text-sm mb-1">
              <span class="text-slate-700 dark:text-slate-300">Producto #${d.productoId} × ${d.cantidad}</span>
              <span class="font-medium text-slate-900 dark:text-white">${this.formatPrice(d.precioUnitario * d.cantidad)}</span>
            </div>`).join("")}
            <div class="border-t border-slate-100 dark:border-slate-700 mt-3 pt-3 flex justify-between font-bold">
              <span class="text-slate-900 dark:text-white">Total</span>
              <span class="text-primary-600 dark:text-primary-400">${this.formatPrice(c.total)}</span>
            </div>
          </div>
        </div>`).join("")}</div>`}`;
  },

  productsAdmin(products, tags) {
    return `<div class="mb-6 flex flex-wrap items-center justify-between gap-4">
      <div><h1 class="text-2xl font-bold text-slate-900 dark:text-white">Gestión de productos</h1>
        <p class="text-slate-500 dark:text-slate-400 mt-1">${products.filter(p => p.activo).length} activos</p></div>
      <div class="flex gap-2">
        <button onclick="App.navigate('tags')" class="px-4 py-2 ${this.cardCls} text-slate-700 dark:text-slate-200 text-sm font-medium">Tags</button>
        <button onclick="App.showProductForm()" class="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg">+ Nuevo</button>
      </div></div>
      <div class="${this.cardCls} overflow-hidden"><div class="overflow-x-auto"><table class="w-full text-sm">
        <thead class="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
          <tr>
            <th class="text-left px-4 py-3 font-medium text-slate-600 dark:text-slate-400">Producto</th>
            <th class="text-left px-4 py-3 font-medium text-slate-600 dark:text-slate-400">Precio</th>
            <th class="text-left px-4 py-3 font-medium text-slate-600 dark:text-slate-400">Stock</th>
            <th class="text-left px-4 py-3 font-medium text-slate-600 dark:text-slate-400">Estado</th>
            <th class="text-right px-4 py-3 font-medium text-slate-600 dark:text-slate-400">Acciones</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100 dark:divide-slate-700">
          ${products.map(p => `<tr class="hover:bg-slate-50 dark:hover:bg-slate-900/30 ${!p.activo ? "opacity-50" : ""}">
            <td class="px-4 py-3"><div class="flex items-center gap-3">
              <img src="${p.imagen}" class="w-10 h-10 rounded-lg object-cover" onerror="this.src='https://images.unsplash.com/photo-1560393464-5c69a73c5770?w=50&h=50&fit=crop'" />
              <div class="font-medium text-slate-900 dark:text-white">${p.nombre}</div></div></td>
            <td class="px-4 py-3 font-medium text-slate-900 dark:text-white">${this.formatPrice(p.precio)}</td>
            <td class="px-4 py-3">${this.stockBadge(p.stock)}</td>
            <td class="px-4 py-3">${p.activo
              ? '<span class="text-xs px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300">Activo</span>'
              : '<span class="text-xs px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300">Baja</span>'}</td>
            <td class="px-4 py-3 text-right">${p.activo ? `<div class="flex justify-end gap-1">
              <button onclick="App.showRestockForm(${p.id})" class="px-2.5 py-1.5 text-xs font-medium text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/30 rounded-lg">Stock</button>
              <button onclick="App.showProductForm(${p.id})" class="px-2.5 py-1.5 text-xs font-medium text-primary-700 dark:text-primary-300 bg-primary-50 dark:bg-primary-900/30 rounded-lg">Editar</button>
              <button onclick="App.deleteProduct(${p.id})" class="px-2.5 py-1.5 text-xs font-medium text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/30 rounded-lg">Baja</button>
            </div>` : "—"}</td>
          </tr>`).join("")}
        </tbody>
      </table></div></div>`;
  },

  tags(tagsList) {
    return `<button onclick="App.navigate('productsAdmin')" class="text-sm text-primary-600 dark:text-primary-400 hover:underline mb-6">← Volver</button>
      <div class="mb-6"><h1 class="text-2xl font-bold text-slate-900 dark:text-white">Gestionar tags</h1></div>
      <div class="${this.cardCls} p-6 max-w-lg">
        <form id="form-tag" class="flex gap-2 mb-6">
          <input type="text" name="nombre" required placeholder="Nuevo tag..." class="flex-1 ${this.inputCls}" />
          <button type="submit" class="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg">Agregar</button>
        </form>
        <div class="space-y-2">${tagsList.map(t => `<div class="flex justify-between px-3 py-2.5 bg-slate-50 dark:bg-slate-900 rounded-lg">
          <span class="text-sm font-medium text-slate-700 dark:text-slate-200">${t.nombre}</span>
          <button onclick="App.deleteTag(${t.id})" class="text-xs text-red-500 hover:underline">Eliminar</button>
        </div>`).join("")}</div>
      </div>`;
  },

  movimientos(movimientos, products, users) {
    const tipoColors = {
      ALTA_INICIAL: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
      REPOSICION: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
      VENTA: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
      BAJA: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
    };
    return `<div class="mb-6"><h1 class="text-2xl font-bold text-slate-900 dark:text-white">Movimientos de stock</h1></div>
      <div class="${this.cardCls} overflow-hidden"><div class="overflow-x-auto"><table class="w-full text-sm">
        <thead class="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
          <tr>
            <th class="text-left px-4 py-3 font-medium text-slate-600 dark:text-slate-400">Fecha</th>
            <th class="text-left px-4 py-3 font-medium text-slate-600 dark:text-slate-400">Producto</th>
            <th class="text-left px-4 py-3 font-medium text-slate-600 dark:text-slate-400">Tipo</th>
            <th class="text-left px-4 py-3 font-medium text-slate-600 dark:text-slate-400">Cantidad</th>
            <th class="text-left px-4 py-3 font-medium text-slate-600 dark:text-slate-400">Stock</th>
            <th class="text-left px-4 py-3 font-medium text-slate-600 dark:text-slate-400">Usuario</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100 dark:divide-slate-700">
          ${movimientos.map(m => {
            const p = products.find(x => x.id === m.productoId);
            const u = users.find(x => x.id === m.usuarioId);
            return `<tr class="hover:bg-slate-50 dark:hover:bg-slate-900/30">
              <td class="px-4 py-3 text-slate-500 dark:text-slate-400 whitespace-nowrap">${this.formatDate(m.fecha)}</td>
              <td class="px-4 py-3 font-medium text-slate-900 dark:text-white">${p ? p.nombre : "#" + m.productoId}</td>
              <td class="px-4 py-3"><span class="text-xs px-2 py-0.5 rounded-full font-medium ${tipoColors[m.tipo] || ""}">${m.tipo}</span></td>
              <td class="px-4 py-3 font-medium ${m.cantidad > 0 ? "text-green-600" : "text-red-600"}">${m.cantidad > 0 ? "+" : ""}${m.cantidad}</td>
              <td class="px-4 py-3 text-slate-500 dark:text-slate-400">${m.stockAnterior} → ${m.stockNuevo}</td>
              <td class="px-4 py-3 text-slate-600 dark:text-slate-300">${u ? u.nombre : "—"}</td>
            </tr>`;
          }).join("")}
        </tbody>
      </table></div></div>`;
  },

  usersAdmin(users) {
    const current = Auth.currentUser();
    return `<div class="mb-6"><h1 class="text-2xl font-bold text-slate-900 dark:text-white">Gestión de usuarios</h1></div>
      <div class="${this.cardCls} overflow-hidden"><div class="overflow-x-auto"><table class="w-full text-sm">
        <thead class="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
          <tr>
            <th class="text-left px-4 py-3 font-medium text-slate-600 dark:text-slate-400">Usuario</th>
            <th class="text-left px-4 py-3 font-medium text-slate-600 dark:text-slate-400">Rol</th>
            <th class="text-left px-4 py-3 font-medium text-slate-600 dark:text-slate-400">Estado</th>
            <th class="text-left px-4 py-3 font-medium text-slate-600 dark:text-slate-400">Registro</th>
            <th class="text-right px-4 py-3 font-medium text-slate-600 dark:text-slate-400">Acciones</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100 dark:divide-slate-700">
          ${users.map(u => `<tr class="hover:bg-slate-50 dark:hover:bg-slate-900/30">
            <td class="px-4 py-3"><div class="font-medium text-slate-900 dark:text-white">${u.nombre}</div>
              <div class="text-xs text-slate-400">${u.email}</div></td>
            <td class="px-4 py-3">${this.roleBadge(u.rol)}</td>
            <td class="px-4 py-3">${u.activo
              ? '<span class="text-xs px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300">Activo</span>'
              : '<span class="text-xs px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300">Inactivo</span>'}</td>
            <td class="px-4 py-3 text-slate-500 dark:text-slate-400">${this.formatDate(u.fechaRegistro)}</td>
            <td class="px-4 py-3 text-right">${u.id === current?.id
              ? '<span class="text-xs text-slate-400">Vos</span>'
              : `<div class="flex justify-end gap-1">
                  ${u.rol === "cliente"
                    ? `<button onclick="App.changeRole(${u.id}, 'vendedor')" class="px-2.5 py-1.5 text-xs font-medium text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-900/30 rounded-lg">→ Vendedor</button>`
                    : u.rol === "vendedor"
                      ? `<button onclick="App.changeRole(${u.id}, 'cliente')" class="px-2.5 py-1.5 text-xs font-medium text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/30 rounded-lg">→ Cliente</button>`
                      : ""}
                  <button onclick="App.toggleUserActive(${u.id}, ${!u.activo})" class="px-2.5 py-1.5 text-xs font-medium ${u.activo ? "text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/30" : "text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-900/30"} rounded-lg">${u.activo ? "Desactivar" : "Activar"}</button>
                </div>`}</td>
          </tr>`).join("")}
        </tbody>
      </table></div></div>`;
  },

  auditoria(logs, users) {
    return `<div class="mb-6"><h1 class="text-2xl font-bold text-slate-900 dark:text-white">Auditoría</h1></div>
      <div class="${this.cardCls} overflow-hidden"><div class="overflow-x-auto"><table class="w-full text-sm">
        <thead class="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
          <tr>
            <th class="text-left px-4 py-3 font-medium text-slate-600 dark:text-slate-400">Fecha</th>
            <th class="text-left px-4 py-3 font-medium text-slate-600 dark:text-slate-400">Usuario</th>
            <th class="text-left px-4 py-3 font-medium text-slate-600 dark:text-slate-400">Acción</th>
            <th class="text-left px-4 py-3 font-medium text-slate-600 dark:text-slate-400">Entidad</th>
            <th class="text-left px-4 py-3 font-medium text-slate-600 dark:text-slate-400">Detalle</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100 dark:divide-slate-700">
          ${logs.map(a => {
            const u = users.find(x => x.id === a.usuarioId);
            return `<tr class="hover:bg-slate-50 dark:hover:bg-slate-900/30">
              <td class="px-4 py-3 text-slate-500 dark:text-slate-400 whitespace-nowrap">${this.formatDate(a.fecha)}</td>
              <td class="px-4 py-3 text-slate-700 dark:text-slate-300">${u ? u.nombre : "Sistema"}</td>
              <td class="px-4 py-3"><span class="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium">${a.accion}</span></td>
              <td class="px-4 py-3 text-slate-600 dark:text-slate-400">${a.entidad}${a.entidadId ? " #" + a.entidadId : ""}</td>
              <td class="px-4 py-3 text-xs text-slate-400 max-w-xs truncate">${a.valorNuevo ? JSON.stringify(a.valorNuevo).slice(0, 60) : "—"}</td>
            </tr>`;
          }).join("")}
        </tbody>
      </table></div></div>`;
  },

  terminos() {
    return `<div class="max-w-3xl mx-auto"><h1 class="text-2xl font-bold text-slate-900 dark:text-white mb-6">Términos y Condiciones</h1>
      <div class="${this.cardCls} p-8 text-slate-700 dark:text-slate-300 space-y-4 text-sm leading-relaxed">
        <p><strong>1. Aceptación.</strong> Al usar Tienda Online aceptás estos términos.</p>
        <p><strong>2. Cuentas.</strong> Sos responsable de tus credenciales. Cuentas inactivas pueden deshabilitarse.</p>
        <p><strong>3. Productos y precios.</strong> Precios en ARS. Stock y precios pueden cambiar sin aviso.</p>
        <p><strong>4. Compras.</strong> Al confirmar se descuenta stock. Pago y envío fuera de alcance de esta demo.</p>
        <p><strong>5. Roles.</strong> Cliente, Vendedor y Administrador con permisos según casos de uso UML.</p>
        <p><strong>6. Auditoría.</strong> Login, compras y cambios quedan registrados.</p>
        <p class="text-slate-400 text-xs mt-8">Última actualización: octubre 2026</p>
      </div></div>`;
  },

  privacidad() {
    return `<div class="max-w-3xl mx-auto"><h1 class="text-2xl font-bold text-slate-900 dark:text-white mb-6">Política de Privacidad</h1>
      <div class="${this.cardCls} p-8 text-slate-700 dark:text-slate-300 space-y-4 text-sm leading-relaxed">
        <p><strong>Datos.</strong> Nombre, email y contraseña. Historial de compras y acciones.</p>
        <p><strong>Uso.</strong> Autenticación, pedidos, stock y auditoría.</p>
        <p><strong>Almacenamiento.</strong> Servidor con persistencia JSON (demo).</p>
        <p><strong>Sesión.</strong> Token en sessionStorage.</p>
        <p class="text-slate-400 text-xs mt-8">Última actualización: octubre 2026</p>
      </div></div>`;
  },

  contacto() {
    return `<div class="max-w-3xl mx-auto"><h1 class="text-2xl font-bold text-slate-900 dark:text-white mb-6">Contacto</h1>
      <div class="${this.cardCls} p-8 text-slate-700 dark:text-slate-300 text-sm space-y-3">
        <p><strong>Email:</strong> soporte@tienda.com</p>
        <p><strong>Horario:</strong> Lun–Vie 9:00–18:00</p>
        <p class="text-slate-500 dark:text-slate-400 mt-4">Aplicación de demostración basada en diagramas UML.</p>
      </div></div>`;
  },

  productFormModal(product, tags) {
    const isEdit = !!product;
    return `<div class="fixed inset-0 z-[90] flex items-center justify-center p-4 modal-backdrop" onclick="if(event.target===this) App.closeModal()">
      <div class="${this.cardCls} shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div class="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
          <h2 class="text-lg font-bold text-slate-900 dark:text-white">${isEdit ? "Editar producto" : "Nuevo producto"}</h2>
          <button onclick="App.closeModal()" class="text-slate-400 text-xl">&times;</button>
        </div>
        <form id="form-product" class="p-6 space-y-4">
          <input type="hidden" name="id" value="${product?.id || ""}" />
          <div><label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nombre *</label>
            <input type="text" name="nombre" required value="${product?.nombre || ""}" class="${this.inputCls}" /></div>
          <div><label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Descripción</label>
            <textarea name="descripcion" rows="3" class="${this.inputCls}">${product?.descripcion || ""}</textarea></div>
          <div class="grid grid-cols-2 gap-4">
            <div><label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Precio *</label>
              <input type="number" name="precio" required min="0" value="${product?.precio || ""}" class="${this.inputCls}" /></div>
            ${!isEdit ? `<div><label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Stock inicial</label>
              <input type="number" name="stock" min="0" value="0" class="${this.inputCls}" /></div>` : ""}
          </div>
          <div><label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">URL imagen</label>
            <input type="url" name="imagen" value="${product?.imagen || ""}" class="${this.inputCls}" /></div>
          <div><label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Tags</label>
            <div class="flex flex-wrap gap-2">${tags.map(t => `<label class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs cursor-pointer ${(product?.tags || []).includes(t.id) ? "bg-primary-50 dark:bg-primary-900/30 border-primary-300 text-primary-700" : "border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300"}">
              <input type="checkbox" name="tags" value="${t.id}" class="sr-only" ${(product?.tags || []).includes(t.id) ? "checked" : ""} />${t.nombre}</label>`).join("")}</div></div>
          <div class="flex gap-3 pt-2">
            <button type="button" onclick="App.closeModal()" class="flex-1 px-4 py-2.5 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 text-sm font-medium rounded-lg">Cancelar</button>
            <button type="submit" class="flex-1 px-4 py-2.5 bg-primary-600 text-white text-sm font-medium rounded-lg">${isEdit ? "Guardar" : "Crear"}</button>
          </div>
        </form>
      </div></div>`;
  },

  restockModal(product) {
    return `<div class="fixed inset-0 z-[90] flex items-center justify-center p-4 modal-backdrop" onclick="if(event.target===this) App.closeModal()">
      <div class="${this.cardCls} shadow-xl w-full max-w-sm">
        <div class="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex justify-between">
          <h2 class="text-lg font-bold text-slate-900 dark:text-white">Reponer stock</h2>
          <button onclick="App.closeModal()" class="text-slate-400 text-xl">&times;</button>
        </div>
        <form id="form-restock" class="p-6 space-y-4">
          <input type="hidden" name="id" value="${product.id}" />
          <p class="text-sm text-slate-600 dark:text-slate-300"><strong>${product.nombre}</strong></p>
          <p class="text-sm text-slate-500 dark:text-slate-400">Stock actual: <strong>${product.stock}</strong></p>
          <div><label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Cantidad *</label>
            <input type="number" name="cantidad" required min="1" value="10" class="${this.inputCls}" /></div>
          <div class="flex gap-3">
            <button type="button" onclick="App.closeModal()" class="flex-1 px-4 py-2.5 border border-slate-300 dark:border-slate-600 text-sm font-medium rounded-lg text-slate-700 dark:text-slate-200">Cancelar</button>
            <button type="submit" class="flex-1 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium rounded-lg">Reponer</button>
          </div>
        </form>
      </div></div>`;
  },

  footer() {
    return `<footer class="border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 mt-auto">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div class="flex items-center gap-2 mb-3">
              <div class="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">T</div>
              <span class="font-semibold text-slate-900 dark:text-white">Tienda Online</span>
            </div>
            <p class="text-sm text-slate-500 dark:text-slate-400">Frontend → API REST → BD. Basado en diagramas UML.</p>
          </div>
          <div>
            <h4 class="text-sm font-semibold text-slate-900 dark:text-white mb-3">Legal</h4>
            <ul class="space-y-2 text-sm text-slate-500 dark:text-slate-400">
              <li><a href="#" onclick="App.navigate('terminos');return false" class="hover:text-primary-600 dark:hover:text-primary-400">Términos y condiciones</a></li>
              <li><a href="#" onclick="App.navigate('privacidad');return false" class="hover:text-primary-600 dark:hover:text-primary-400">Política de privacidad</a></li>
            </ul>
          </div>
          <div>
            <h4 class="text-sm font-semibold text-slate-900 dark:text-white mb-3">Soporte</h4>
            <ul class="space-y-2 text-sm text-slate-500 dark:text-slate-400">
              <li><a href="#" onclick="App.navigate('contacto');return false" class="hover:text-primary-600 dark:hover:text-primary-400">Contacto</a></li>
              <li><a href="#" onclick="App.navigate('catalog');return false" class="hover:text-primary-600 dark:hover:text-primary-400">Catálogo</a></li>
            </ul>
          </div>
          <div>
            <h4 class="text-sm font-semibold text-slate-900 dark:text-white mb-3">Roles</h4>
            <ul class="space-y-2 text-sm text-slate-500 dark:text-slate-400"><li>Cliente · Vendedor · Admin</li></ul>
          </div>
        </div>
        <div class="border-t border-slate-100 dark:border-slate-800 mt-8 pt-6 flex flex-col sm:flex-row justify-between text-xs text-slate-400">
          <span>© 2026 Tienda Online. Proyecto académico.</span>
          <span>API REST · JWT · Auditoría</span>
        </div>
      </div>
    </footer>`;
  }
};
