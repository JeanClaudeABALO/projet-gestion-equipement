import { createRouter, createWebHistory } from "vue-router";

import Departements from "../pages/Departements.vue";
import Equipements from "../pages/Equipements.vue";
import Unites from "../pages/Unites.vue";
import Reparations from "../pages/Reparations.vue";
import Home from "../pages/Home.vue";
import Login from "../pages/Login.vue";
import DashboardAdmin from "../pages/DashboardAdmin.vue";
import DashboardPointFocal from "../pages/DashboardPointFocal.vue";


const routes = [

  { path: "/dashboard/admin", component: DashboardAdmin },
  {
    path: "/dashboard-point-focal",
    name: "DashboardPointFocal",
    component: DashboardPointFocal,
  },
  { path: "/departements", component: Departements },
  { path: "/equipements", component: Equipements },
  { path: "/reparations", component: Reparations },

  {
    path: "/",
    name: "home",
    component: Home,
  },
  { path: "/", component: Login },
  { path: "/unites", component: Unites },
  {
    path: "/dashboard/admin",
    name: "dashboard-admin",
    component: DashboardAdmin,
    meta: { requiresAuth: true, role: "admin" }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Sécurisation : Rediriger si pas connecté
router.beforeEach((to, from, next) => {
  const publicPages = ["/"];
  const authRequired = !publicPages.includes(to.path);
  const token = localStorage.getItem("token");

  if (authRequired && !token) return next("/");
  next();
});


export default router;
