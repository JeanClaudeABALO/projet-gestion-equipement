import axios from "./axios"; // ton axios configuré

export default {
  getAll() {
    return axios.get("/departements");
  },

  getOne(id) {
    return axios.get(`/departements/${id}`);
  },

  create(data) {
    return axios.post("/departements", data);
  },

  update(id, data) {
    return axios.put(`/departements/${id}`, data);
  },

  remove(id) {
    return axios.delete(`/departements/${id}`);
  }
};
