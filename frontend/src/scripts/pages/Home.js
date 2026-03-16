import { ref, onMounted, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import api from "../../api/axios";
import AdminRegisterModal from "../../components/AdminRegisterModal.vue";
import authApi from "../../api/auth";

export function useHome() {
  const router = useRouter();
  const route = useRoute();
  const isAnimated = ref(false);

  const stats = ref({
    totalEquipements: 0,
    fonctionnels: 0,
    enReparation: 0,
    totalDepartements: 0,
    totalUnites: 0
  });

  const loadingStats = ref(true);
  const adminExists = ref(true);
  const loadingAdminCheck = ref(true);
  const showAdminModal = ref(false);

  async function checkAdminExists() {
    loadingAdminCheck.value = true;
    try {
      const res = await authApi.checkAdminExists();
      adminExists.value = res.data.exists;
    } catch (error) {
      console.error("Erreur vérification admin:", error);
      adminExists.value = true;
    } finally {
      loadingAdminCheck.value = false;
    }
  }

  function handleAdminRegistered() {
    adminExists.value = true;
    showAdminModal.value = false;
  }

  function goToPlatform() {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (token && role) {
      if (role === "admin" || role === "super_admin") {
        router.push("/dashboard/admin");
      } else if (role === "pf") {
        router.push("/dashboard-point-focal");
      }
    } else {
      router.push("/login");
    }
  }

  function formatNumber(num) {
    return new Intl.NumberFormat("fr-FR").format(num);
  }

  async function loadPublicStats() {
    loadingStats.value = true;
    try {
      const res = await api.get("/dashboard/public-stats").catch(() => null);

      if (res?.data) {
        stats.value = {
          totalEquipements: res.data.totalEquipements || 0,
          fonctionnels: res.data.fonctionnels || 0,
          enReparation: res.data.enReparation || 0,
          totalDepartements: res.data.totalDepartements || 0,
          totalUnites: res.data.totalUnites || 0
        };
      }
    } catch (error) {
      console.error("Erreur chargement stats publiques:", error);
    } finally {
      loadingStats.value = false;
    }
  }

  function triggerAnimation() {
    isAnimated.value = false;
    setTimeout(() => {
      isAnimated.value = true;
    }, 50);
  }

  onMounted(() => {
    loadPublicStats();
    checkAdminExists();
    setTimeout(() => {
      triggerAnimation();
    }, 150);
  });

  watch(
    () => route.path,
    (newPath) => {
      if (newPath === "/") {
        setTimeout(() => {
          triggerAnimation();
        }, 150);
      }
    },
    { immediate: false }
  );

  return {
    AdminRegisterModal,
    isAnimated,
    stats,
    loadingStats,
    adminExists,
    loadingAdminCheck,
    showAdminModal,
    goToPlatform,
    formatNumber,
    handleAdminRegistered
  };
}
