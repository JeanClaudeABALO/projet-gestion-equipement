import { ref, provide, computed, onMounted, onUnmounted } from "vue";
import { useRoute } from "vue-router";

const MOBILE_BREAKPOINT = 768;

export function useAppSetup() {
  const sidebarOpen = ref(false);
  const route = useRoute();
  const isMobile = ref(false);

  function checkMobile() {
    isMobile.value = window.innerWidth < MOBILE_BREAKPOINT;
    if (isMobile.value) {
      sidebarOpen.value = false;
    }
  }

  onMounted(() => {
    checkMobile();
    window.addEventListener("resize", checkMobile);
  });

  onUnmounted(() => {
    window.removeEventListener("resize", checkMobile);
  });

  const showFooter = computed(() => {
    const path = route.path;
    const hasSidebar =
      path.startsWith("/dashboard") ||
      path.startsWith("/dashboard-point-focal") ||
      path === "/departements" ||
      path === "/unites" ||
      path === "/reparations" ||
      path === "/equipements" ||
      path === "/utilisateurs";
    return !hasSidebar && path !== "/login" && path !== "/change-password";
  });

  function toggleSidebar() {
    sidebarOpen.value = !sidebarOpen.value;
  }

  provide("sidebarOpen", sidebarOpen);
  provide("toggleSidebar", toggleSidebar);
  provide("isMobile", isMobile);
  provide("MOBILE_BREAKPOINT", MOBILE_BREAKPOINT);

  return { showFooter };
}
