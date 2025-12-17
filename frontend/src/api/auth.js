import api from "./axios";

export default {
  login(data) {
    return api.post("/auth/login", data);
  },

  checkAdminExists() {
    return api.get("/auth/admin-exists");
  },

  registerAdmin(data) {
    return api.post("/auth/register-admin", data);
  }
};

