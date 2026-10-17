/**
 * Auth frontend — sesión vía token de la API
 */
const Auth = {
  _user: null,

  currentUser() {
    return this._user;
  },

  isLoggedIn() {
    return !!this._user;
  },

  hasPermission(permiso) {
    const rol = this._user ? this._user.rol : null;
    return tienePermiso(rol, permiso);
  },

  async init() {
    const token = sessionStorage.getItem("tienda_token");
    if (!token) {
      this._user = null;
      return null;
    }
    try {
      const data = await API.me();
      this._user = data.user;
      return this._user;
    } catch {
      sessionStorage.removeItem("tienda_token");
      this._user = null;
      return null;
    }
  },

  async login(email, password) {
    const data = await API.login({ email, password });
    sessionStorage.setItem("tienda_token", data.token);
    this._user = data.user;
    return data.user;
  },

  async register({ nombre, email, password }) {
    const data = await API.register({ nombre, email, password });
    sessionStorage.setItem("tienda_token", data.token);
    this._user = data.user;
    return data.user;
  },

  async logout() {
    try {
      await API.logout();
    } catch { /* ignore */ }
    sessionStorage.removeItem("tienda_token");
    this._user = null;
  },

  requirePermission(permiso) {
    if (!this.hasPermission(permiso)) {
      throw new Error("No tenés permiso para realizar esta acción");
    }
  }
};
