import axios from "axios";

/** URL de l’API en production : définir VITE_API_BASE_URL dans .env.production (voir README). */
const baseURL =
    import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") || "http://localhost:3000/api";

const api = axios.create({
    baseURL: baseURL.endsWith("/api") ? baseURL : `${baseURL}/api`,
    timeout: 10000,
    headers: {
        "Content-Type": "application/json"
    }
});

// Injecter automatiquement le token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token && token !== "undefined" && token !== "null") {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

const AUTH_FAIL_CODES = new Set(["INVALID_TOKEN", "TOKEN_EXPIRED", "NO_TOKEN"]);

function redirectToLogin(reason) {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    window.dispatchEvent(new Event("storage"));
    if (window.location.pathname.includes("/login")) return;
    const base = (import.meta.env.BASE_URL || "/").replace(/\/$/, "") || "";
    window.location.href = `${base}/login?session=${encodeURIComponent(reason)}`;
}

// Session expirée / token rejeté : nettoyer et renvoyer vers la connexion (sans boucle sur /login)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status;
        const data = error.response?.data;
        const code = data?.code;
        const url = String(error.config?.url || "");

        const isAuthRoute =
            url.includes("/auth/login") ||
            url.includes("/auth/register-admin") ||
            url.includes("/auth/change-password");

        if (isAuthRoute) {
            return Promise.reject(error);
        }

        if (status === 401 && AUTH_FAIL_CODES.has(code)) {
            redirectToLogin(code === "TOKEN_EXPIRED" ? "expired" : "invalid");
            return Promise.reject(error);
        }

        // Compatibilité si l’API renvoie encore l’ancien message sans `code`
        if (status === 401 && typeof data?.message === "string") {
            const m = data.message.toLowerCase();
            if (m.includes("token invalide") || m.includes("session expirée")) {
                redirectToLogin(m.includes("expir") ? "expired" : "invalid");
                return Promise.reject(error);
            }
        }

        if (status === 403 && code === "NO_TOKEN") {
            redirectToLogin("required");
            return Promise.reject(error);
        }

        return Promise.reject(error);
    }
);

export default api;