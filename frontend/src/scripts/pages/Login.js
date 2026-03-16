import { ref } from "vue";
import { useRouter } from "vue-router";
import api from "../../api/axios";

export function useLogin() {
  const router = useRouter();
  const email = ref("");
  const password = ref("");
  const error = ref("");
  const showPassword = ref(false);
  const loading = ref(false);
  const currentYear = new Date().getFullYear();

function togglePassword() {
  showPassword.value = !showPassword.value;
}

async function login() {
  error.value = "";
  loading.value = true;

  if (!email.value || !password.value) {
    error.value = "Email et mot de passe sont obligatoires";
    loading.value = false;
    return;
  }

  try {
    const payload = {
      email: email.value,
      password: password.value
    };

    const res = await api.post("/auth/login", payload);

    // Vérifier si un changement de mot de passe est forcé
    if (res.data.forcePasswordChange) {
      loading.value = false;
      // Stocker userId et le flag dans sessionStorage
      sessionStorage.setItem("userId", res.data.userId);
      sessionStorage.setItem("forcedChange", "true");
      // Rediriger vers la page de changement de mot de passe
      router.push({
        path: "/change-password",
        query: { userId: res.data.userId, forced: "true" }
      });
      return;
    }

    if (!res.data.token || !res.data.role) {
      error.value = "Données de connexion incomplètes reçues du serveur";
      loading.value = false;
      return;
    }

    // Stocker le token et le rôle détecté automatiquement
    localStorage.setItem("token", res.data.token);
    localStorage.setItem("role", res.data.role);

    loading.value = false;

    // Rediriger selon le rôle détecté automatiquement
    const detectedRole = res.data.role;
    if (detectedRole === "super_admin" || detectedRole === "admin") {
      router.push("/dashboard/admin");
    } else if (detectedRole === "pf") {
      router.push("/dashboard-point-focal");
    } else {
      error.value = "Rôle non reconnu. Veuillez contacter l'administrateur.";
    }

  } catch (err) {
    console.error("Erreur de connexion:", err);
    
    if (err.response) {
      error.value = err.response.data?.message || "Erreur de connexion";
    } else if (err.request) {
      error.value = "Impossible de contacter le serveur. Vérifiez que le backend est démarré.";
    } else {
      error.value = err.message || "Erreur de connexion";
    }
    
    loading.value = false;
  }
}

  return {
    email,
    password,
    error,
    showPassword,
    loading,
    currentYear,
    togglePassword,
    login
  };
}
