import { inject, ref } from "vue";
import { useRouter } from "vue-router";

export function useSidebarPointFocal() {
  const router = useRouter();
  const sidebarOpen = inject("sidebarOpen", ref(true));
  const toggleSidebar = inject("toggleSidebar", () => {});
  const isMobile = inject("isMobile", ref(false));

  function goAndClose(path) {
    router.push(path);
    if (isMobile.value) toggleSidebar();
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
    goAndClose,
    goBackAndClose,
    logout
  };
}
