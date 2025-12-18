import api from "./axios";

export default {
  // PF : déclarer une panne
  create(data) {
    return api.post("/reparations", data);
  },

  // PF : réparations de son département
  getByDepartement() {
    return api.get("/reparations/departement/mon-departement");
  },

  // ADMIN : toutes les réparations
  getAll() {
    return api.get("/reparations");
  },

  // ADMIN : mise à jour du statut
  updateStatut(id, data) {
    return api.put(`/reparations/${id}/statut`, data);
  },

  // ADMIN : suppression éventuelle
  remove(id) {
    return api.delete(`/reparations/${id}`);
  }
};


