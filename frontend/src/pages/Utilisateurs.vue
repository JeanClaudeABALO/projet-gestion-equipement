<template>
  <div class="utilisateurs-page">
    <SidebarAdmin />

    <div class="content-wrapper">
      <!-- HEADER -->
      <div class="header-bar">
        <div class="header-content">
          <h1>Gestion des Utilisateurs</h1>
          <p class="subtitle">Gérez les administrateurs et points focaux de votre organisation</p>
        </div>
        <button class="add-btn" @click="openAdd">
          <span>＋</span> Créer un utilisateur
        </button>
      </div>

    <!-- TABLE CARD - Structure à 2 tables : header fixe + body scrollable -->
    <div class="table-card-wrapper">
      <div class="table-header-fixed" ref="headerScrollRef">
        <table class="data-table">
          <colgroup>
            <col style="width: 50px">
            <col style="width: 12%">
            <col style="width: 15%">
            <col style="width: 10%">
            <col style="width: 12%">
            <col style="width: 15%">
            <col style="width: 10%">
            <col style="width: 100px">
          </colgroup>
          <thead>
            <tr>
              <th>N°</th>
              <th>Nom</th>
              <th>Email</th>
              <th>Téléphone</th>
              <th>Rôle</th>
              <th>Département</th>
              <th>Statut</th>
              <th class="center">Actions</th>
            </tr>
          </thead>
        </table>
      </div>
      <div class="table-body-scroll" ref="bodyScrollRef" @scroll="onTableScroll">
        <table class="data-table">
          <colgroup>
            <col style="width: 50px">
            <col style="width: 12%">
            <col style="width: 15%">
            <col style="width: 10%">
            <col style="width: 12%">
            <col style="width: 15%">
            <col style="width: 10%">
            <col style="width: 100px">
          </colgroup>
          <tbody>
          <tr v-for="(u, index) in sortedUtilisateurs" :key="u.id">
            <td>{{ index + 1 }}</td>
            <td class="bold">{{ u.nom }}</td>
            <td>{{ u.email }}</td>
            <td>{{ u.telephone || "-" }}</td>
            <td>
              <span :class="['badge', getRoleClass(u.role_nom)]">
                {{ u.role_nom }}
              </span>
            </td>
            <td>{{ u.departement_nom || "-" }}</td>
            <td>
              <span :class="['status', u.actif ? 'actif' : 'inactif']">
                {{ u.actif ? "Actif" : "Inactif" }}
              </span>
            </td>
            <td class="center">
              <div class="actions-container">
                <button 
                  class="action edit" 
                  @click="openEdit(u)" 
                  :disabled="u.role_nom === 'Super Administrateur'"
                  title="Modifier"
                >
                  <svg class="action-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                  </svg>
                </button>
                <button 
                  class="action delete" 
                  @click="remove(u.id)" 
                  :disabled="u.role_nom === 'Super Administrateur' || u.id === currentUserId"
                  title="Supprimer"
                >
                  <svg class="action-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    <line x1="10" y1="11" x2="10" y2="17"></line>
                    <line x1="14" y1="11" x2="14" y2="17"></line>
                  </svg>
                </button>
              </div>
            </td>
          </tr>

          <tr v-if="sortedUtilisateurs.length === 0">
            <td colspan="8" class="empty">Aucun utilisateur enregistré</td>
          </tr>
          </tbody>
        </table>
      </div>
    </div>

      <!-- MODAL -->
      <UtilisateurModal
        v-if="showModal"
        :modelValue="selected"
        :departements="departementsDisponibles"
        @close="showModal = false"
        @save="saveUtilisateur"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import utilisateursApi from "../api/utilisateurs";
import departementsApi from "../api/departement";
import UtilisateurModal from "../components/UtilisateurModal.vue";
import SidebarAdmin from "../components/SidebarAdmin.vue";
import api from "../api/axios";

const headerScrollRef = ref(null);
const bodyScrollRef = ref(null);
const utilisateurs = ref([]);
const departements = ref([]);
const showModal = ref(false);

function onTableScroll() {
  if (headerScrollRef.value && bodyScrollRef.value) {
    headerScrollRef.value.scrollLeft = bodyScrollRef.value.scrollLeft;
  }
}
const selected = ref(null);
const currentUserId = ref(null);

const sortedUtilisateurs = computed(() => {
  return [...utilisateurs.value].sort((a, b) =>
    (a.nom || "").localeCompare(b.nom || "", "fr")
  );
});

// Départements disponibles (excluant ceux qui ont déjà un point focal)
const departementsDisponibles = computed(() => {
  // Récupérer les IDs des départements qui ont déjà un point focal
  // Exclure l'utilisateur en cours d'édition pour permettre la modification
  const departementsAvecPF = utilisateurs.value
    .filter(u => {
      // Exclure l'utilisateur en cours d'édition
      if (selected.value && u.id === selected.value.id) {
        return false;
      }
      // Inclure seulement les points focaux avec un département assigné
      return u.role_nom === 'Point Focal Départemental' && u.departement_id;
    })
    .map(u => Number(u.departement_id));
  
  // Filtrer les départements
  return departements.value.filter(d => {
    // Exclure les départements qui ont déjà un point focal
    return !departementsAvecPF.includes(Number(d.id));
  });
});

async function loadData() {
  try {
    // Charger les utilisateurs
    const u = await utilisateursApi.getAll();
    utilisateurs.value = u.data || [];

    // Charger les départements pour le formulaire
    const d = await departementsApi.getAll();
    departements.value = d.data || [];

    // Récupérer l'ID de l'utilisateur actuel depuis le token
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        currentUserId.value = payload.id;
      } catch (e) {
        console.error("Erreur décodage token:", e);
      }
    }
  } catch (error) {
    console.error("Erreur lors du chargement:", error);
    if (error.response?.status === 403) {
      alert("Accès refusé. Seul un super administrateur peut gérer les utilisateurs.");
    } else {
      alert("Erreur lors du chargement des données.");
    }
  }
}

function openAdd() {
  selected.value = null;
  showModal.value = true;
}

function openEdit(u) {
  // Ne pas permettre la modification du super admin
  if (u.role_nom === "Super Administrateur") {
    alert("Le super administrateur ne peut pas être modifié depuis cette interface.");
    return;
  }
  selected.value = u;
  showModal.value = true;
}

function getRoleClass(roleNom) {
  if (roleNom === "Super Administrateur") return "super-admin";
  if (roleNom === "Administrateur") return "admin";
  return "pf";
}

async function saveUtilisateur(data) {
  try {
    if (data.id) {
      await utilisateursApi.update(data.id, data);
    } else {
      await utilisateursApi.create(data);
    }
    showModal.value = false;
    await loadData();
  } catch (error) {
    console.error("Erreur lors de l'enregistrement:", error);
    if (error.response?.status === 403) {
      alert(error.response.data.message || "Accès refusé. Vous ne pouvez créer que des points focaux.");
    } else if (error.response?.status === 400) {
      alert(error.response.data.message || "Données invalides.");
    } else {
      alert("Erreur lors de l'enregistrement de l'utilisateur.");
    }
  }
}

async function remove(id) {
  const user = utilisateurs.value.find(u => u.id === id);
  if (user && user.role_nom === "Super Administrateur") {
    alert("Le super administrateur ne peut pas être supprimé.");
    return;
  }

  if (confirm(`Supprimer l'utilisateur "${user?.nom}" ?`)) {
    try {
      await utilisateursApi.remove(id);
      await loadData();
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      alert("Erreur lors de la suppression de l'utilisateur.");
    }
  }
}

onMounted(loadData);
</script>

<style scoped>
/* PAGE */
.utilisateurs-page {
  display: flex;
  min-height: 100vh;
  background: linear-gradient(135deg, #f6f7fb 0%, #eef2f7 100%);
  font-family: 'Inter', 'Segoe UI', 'Roboto', -apple-system, BlinkMacSystemFont, sans-serif;
}

.content-wrapper {
  margin-left: 220px;
  width: calc(100% - 220px);
  padding: 40px;
}

/* HEADER BAR */
.header-bar {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;
  gap: 20px;
}

.header-content h1 {
  font-size: 32px;
  font-weight: 700;
  color: #1a202c;
  margin: 0 0 8px 0;
  letter-spacing: -0.5px;
  font-family: 'Inter', sans-serif;
}

.subtitle {
  color: #64748b;
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  font-family: 'Inter', sans-serif;
}

/* ADD BUTTON */
.add-btn {
  background: linear-gradient(135deg, #0a5bc4 0%, #09315c 100%);
  color: white;
  border: none;
  padding: 14px 24px;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  font-family: 'Inter', sans-serif;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(10, 91, 196, 0.3);
  letter-spacing: 0.3px;
  white-space: nowrap;
}

.add-btn span {
  font-size: 22px;
  font-weight: bold;
}

.add-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(10, 91, 196, 0.4);
}

.add-btn:active {
  transform: translateY(0);
}

/* TABLE CARD - Structure à 2 tables : header fixe + body scrollable */
.table-card-wrapper {
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.table-header-fixed {
  overflow-x: auto;
  overflow-y: hidden;
  flex-shrink: 0;
  border-bottom: 2px solid rgba(0, 0, 0, 0.08);
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.table-header-fixed::-webkit-scrollbar {
  display: none;
}

.table-body-scroll {
  overflow: auto;
  max-height: 60vh;
  scrollbar-gutter: stable;
  flex: 1;
  min-height: 0;
}

.data-table {
  width: 100%;
  min-width: 800px;
  border-collapse: collapse;
  font-family: 'Inter', sans-serif;
}

.data-table thead {
  background: linear-gradient(135deg, #0a5bc4 0%, #09315c 100%);
}

.data-table thead th {
  color: white;
  padding: 18px 14px;
  text-align: left;
  font-size: 12px;
  font-weight: 600;
  font-family: 'Inter', sans-serif;
  letter-spacing: 0.3px;
  text-transform: uppercase;
}

.data-table thead th.center {
  text-align: center;
}

/* BODY */
.data-table tbody td {
  padding: 16px 14px;
  border-bottom: 1px solid #f1f5f9;
  color: #475569;
  font-size: 14px;
  font-weight: 500;
  font-family: 'Inter', sans-serif;
}

.data-table tbody tr {
  transition: all 0.2s ease;
}

.data-table tbody tr:hover {
  background: #f8fafc;
  transform: scale(1.01);
}

.bold {
  font-weight: 600;
  color: #1e293b;
}

.center {
  text-align: center;
}

.badge {
  padding: 6px 14px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  font-family: 'Inter', sans-serif;
  display: inline-block;
  letter-spacing: 0.2px;
}

.badge.super-admin {
  background: #fce7f3;
  color: #9f1239;
}

.badge.admin {
  background: #fef3c7;
  color: #92400e;
}

.badge.pf {
  background: #dbeafe;
  color: #1e40af;
}

.status {
  padding: 6px 14px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  font-family: 'Inter', sans-serif;
  display: inline-block;
  letter-spacing: 0.2px;
}

.status.actif {
  background: #d1fae5;
  color: #065f46;
}

.status.inactif {
  background: #fee2e2;
  color: #991b1b;
}

/* ACTIONS */
.actions-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.action {
  border: none;
  background: none;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 8px;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.action-icon {
  width: 18px;
  height: 18px;
  display: block;
  transition: transform 0.2s ease;
}

.action.edit {
  background: rgba(37, 99, 235, 0.1);
  color: #2563eb;
}

.action.edit:hover:not(:disabled) {
  background: rgba(37, 99, 235, 0.2);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(37, 99, 235, 0.2);
}

.action.edit:hover:not(:disabled) .action-icon {
  transform: scale(1.1);
}

.action.delete {
  background: rgba(220, 38, 38, 0.1);
  color: #dc2626;
}

.action.delete:hover:not(:disabled) {
  background: rgba(220, 38, 38, 0.2);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(220, 38, 38, 0.2);
}

.action.delete:hover:not(:disabled) .action-icon {
  transform: scale(1.1);
}

.action:disabled {
  opacity: 0.3;
  cursor: not-allowed;
  background: rgba(0, 0, 0, 0.05) !important;
}

/* EMPTY */
.empty {
  text-align: center;
  padding: 40px;
  color: #94a3b8;
  font-size: 15px;
  font-weight: 500;
  font-family: 'Inter', sans-serif;
}

@media (max-width: 768px) {
  .header-bar {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }
  
  .header-content h1 {
    font-size: 22px;
  }
  
  .add-btn {
    width: 100%;
    justify-content: center;
  }
  
  .table-body-scroll {
    max-height: 50vh;
  }
  
  .data-table {
    min-width: 750px;
  }
}

@media (max-width: 480px) {
  .header-content h1 {
    font-size: 18px;
  }
  
  .data-table {
    min-width: 700px;
  }
}
</style>

