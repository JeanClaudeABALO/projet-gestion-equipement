import api from "./axios";

export default {
  getAll() {
    return api.get("/utilisateurs");
  },

  getOne(id) {
    return api.get(`/utilisateurs/${id}`);
  },

  create(data) {
    return api.post("/utilisateurs", data);
  },

  update(id, data) {
    return api.put(`/utilisateurs/${id}`, data);
  },

  remove(id) {
    return api.delete(`/utilisateurs/${id}`);
  }
};

