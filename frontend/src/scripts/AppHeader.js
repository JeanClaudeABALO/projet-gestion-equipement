import { computed, ref, onMounted, watch, inject } from "vue";
import { useRouter, useRoute } from "vue-router";

export function useAppHeader() {
  const router = useRouter();
  const route = useRoute();
  const sidebarOpen = inject("sidebarOpen", ref(true));
  const toggleSidebar = inject("toggleSidebar", () => {});
  const isMobile = inject("isMobile", ref(false));

  const isAuthenticated = ref(!!localStorage.getItem("token"));
  const userRole = ref(localStorage.getItem("role"));

  function updateAuthState() {
    isAuthenticated.value = !!localStorage.getItem("token");
    userRole.value = localStorage.getItem("role");
  }

  watch(
    () => route.path,
    () => {
      updateAuthState();
    }
  );

  onMounted(() => {
    updateAuthState();
    window.addEventListener("storage", updateAuthState);
  });

  const publicMenuItems = [
    { label: "Accueil", path: "/" },
    { label: "La Plateforme", path: "/la-plateforme" },
    { label: "Équipements", path: "/equipements-public" },
    { label: "Statistiques", path: "/statistiques" },
    { label: "Contact", path: "/contact" }
  ];

  const adminMenuItems = [
    { label: "Départements", path: "/departements" },
    { label: "Unités", path: "/unites" },
    { label: "Equipements", path: "/equipements" },
    { label: "Utilisateurs", path: "/utilisateurs" },
    { label: "Réparations", path: "/reparations" }
  ];

  const pointFocalMenuItems = [
    { label: "Unités", path: "/dashboard-point-focal/unites" },
    { label: "Equipements", path: "/equipements" },
    { label: "Réparations", path: "/dashboard-point-focal/reparations" }
  ];

  const menuItems = computed(() => {
    if (isAuthenticated.value) {
      const role = userRole.value;
      if (role === "admin" || role === "super_admin") return adminMenuItems;
      if (role === "pf") return pointFocalMenuItems;
    }
    return publicMenuItems;
  });

  function isActive(path) {
    if (path === "/" && route.path === "/") return true;
    if (path !== "/" && route.path.startsWith(path)) return true;
    return false;
  }

  function logout() {
    if (confirm("Êtes-vous sûr de vouloir vous déconnecter ?")) {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      updateAuthState();
      window.dispatchEvent(new Event("storage"));
      router.replace("/");
    }
  }

  function goToPlatform() {
    if (isAuthenticated.value) {
      if (userRole.value === "admin") router.push("/dashboard/admin");
      else if (userRole.value === "pf") router.push("/dashboard-point-focal");
    } else {
      router.push("/login");
    }
  }

  return {
    router,
    sidebarOpen,
    toggleSidebar,
    isMobile,
    isAuthenticated,
    menuItems,
    isActive,
    logout,
    goToPlatform
  };
}
