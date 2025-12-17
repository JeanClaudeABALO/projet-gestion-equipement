import api from "./axios";

export default {
  getAll() {
    return api.get("/equipements-types");
  },

  getOne(id) {
    return api.get(`/equipements-types/${id}`);
  },

  create(data) {
    return api.post("/equipements-types", data);
  },

  update(id, data) {
    return api.put(`/equipements-types/${id}`, data);
  },

  remove(id) {
    return api.delete(`/equipements-types/${id}`);
  }
};

