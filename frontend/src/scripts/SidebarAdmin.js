import { inject, ref, computed } from "vue";
import { useRouter } from "vue-router";

export function useSidebarAdmin() {
  const router = useRouter();
  const sidebarOpen = inject("sidebarOpen", ref(true));
  const toggleSidebar = inject("toggleSidebar", () => {});
  const isMobile = inject("isMobile", ref(false));
  const userRole = ref(localStorage.getItem("role"));
  const isSuperAdmin = computed(() => userRole.value === "super_admin");

  function go(path) {
    router.push(path);
  }

  function goAndClose(path) {
    router.push(path);
    if (isMobile.value) toggleSidebar();
  }

  function goBack() {
    router.go(-1);
  }

  function goBackAndClose() {
    router.go(-1);
    if (isMobile.value) toggleSidebar();
  }

  function logout() {
    if (confirm("Êtes-vous sûr de vouloir vous déconnecter ?")) {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      window.dispatchEvent(new Event("storage"));
      router.replace("/");
    }
  }

  return {
    sidebarOpen,
    toggleSidebar,
    isMobile,
    go,
    goAndClose,
    goBackAndClose,
    logout
  };
}
