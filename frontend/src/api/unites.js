import axios from "./axios"; // ton axios configuré

export default {
  getAll() {
    return axios.get("/unites");
  },

  create(data) {
    return axios.post("/unites", data);
  },

  update(id, data) {
    return axios.put(`/unites/${id}`, data);
  },

  remove(id) {
    return axios.delete(`/unites/${id}`);
  }
};
