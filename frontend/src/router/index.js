import { createRouter, createWebHistory } from "vue-router";

import Departements from "../pages/Departements.vue";
import Equipements from "../pages/Equipements.vue";
import Unites from "../pages/Unites.vue";
import Reparations from "../pages/Reparations.vue";
import Home from "../pages/Home.vue";
import Login from "../pages/Login.vue";
import DashboardAdmin from "../pages/DashboardAdmin.vue";
import DashboardPointFocal from "../pages/DashboardPointFocal.vue";
import Utilisateurs from "../pages/Utilisateurs.vue";


const routes = [
  { 
    path: "/", 
    name: "home",
    component: Home 
  },
  { 
    path: "/login", 
    name: "login",
    component: Login 
  },
  { 
    path: "/dashboard/admin", 
    name: "dashboard-admin",
    component: DashboardAdmin,
    meta: { requiresAuth: true, role: "admin" }
  },
  {
    path: "/dashboard-point-focal",
    name: "DashboardPointFocal",
    component: DashboardPointFocal,
    meta: { requiresAuth: true, role: "pf" }
  },
  { 
    path: "/departements", 
    component: Departements,
    meta: { requiresAuth: true, role: "admin" }
  },
  { 
    path: "/equipements", 
    component: Equipements,
    meta: { requiresAuth: true }
  },
  { 
    path: "/reparations", 
    component: Reparations,
    meta: { requiresAuth: true }
  },
  { 
    path: "/unites", 
    component: Unites,
    meta: { requiresAuth: true, role: "admin" }
  },
  { 
    path: "/utilisateurs", 
    component: Utilisateurs,
    meta: { requiresAuth: true, role: "admin" }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Sécurisation : Rediriger si pas connecté et vérifier les rôles
router.beforeEach((to, from, next) => {
  const publicPages = ["/", "/login"];
  const authRequired = !publicPages.includes(to.path);
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  // Si la page nécessite une authentification
  if (authRequired && !token) {
    return next("/login");
  }

  // Si la page nécessite un rôle spécifique
  if (to.meta?.role && role !== to.meta.role) {
    // Rediriger selon le rôle de l'utilisateur
    if (role === "admin") {
      return next("/dashboard/admin");
    } else if (role === "pf") {
      return next("/dashboard-point-focal");
    } else {
      return next("/login");
    }
  }

  // Si connecté et sur la page login ou home, rediriger vers le dashboard approprié
  if ((to.path === "/login" || to.path === "/") && token) {
    if (role === "admin") {
      return next("/dashboard/admin");
    } else if (role === "pf") {
      return next("/dashboard-point-focal");
    }
  }

  next();
});


export default router;
