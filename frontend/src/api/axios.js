import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:4000/api",
    timeout : 10000
});

// Injecter automatiquement le token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

export default axios.create({
  baseURL: "http://localhost:3000/api",
  headers: {
    "Content-Type": "application/json"
  }
});