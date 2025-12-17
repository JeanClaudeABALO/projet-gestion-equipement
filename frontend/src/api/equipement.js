import api from "./axios";

export default {
  // Routes ADMIN
  getAll() {
    return api.get("/equipements");
  },

  getOne(id) {
    return api.get(`/equipements/${id}`);
  },

  create(data) {
    return api.post("/equipements", data);
  },

  update(id, data) {
    return api.put(`/equipements/${id}`, data);
  },

  remove(id) {
    return api.delete(`/equipements/${id}`);
  },

  // Routes Point Focal
  getByDepartement() {
    return api.get("/equipements/departement/mon-departement");
  },

  updateEtat(id, data) {
    return api.patch(`/equipements/${id}/etat`, data);
  },

  declarerReparation(id, data) {
    return api.patch(`/equipements/${id}/reparation`, data);
  },

  marquerManquant(id, data) {
    return api.patch(`/equipements/${id}/manquant`, data);
  }
};

