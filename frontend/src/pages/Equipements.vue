<template>
  <div class="equipements-page">
    <SidebarAdmin v-if="role === 'admin' || role === 'super_admin'" />
    <SidebarPointFocal v-else />

    <div class="content-wrapper">
      <!-- HEADER -->
      <div class="header-bar">
        <div class="header-content">
          <h1>Gestion des Équipements</h1>
          <p class="subtitle">Gérez les équipements de votre organisation</p>
        </div>
        <button class="add-btn" @click="openAdd">
          <span>＋</span> Ajouter un équipement
        </button>
      </div>

    <!-- FILTRES -->
    <div v-if="role === 'admin' || role === 'super_admin'" class="filters-card">
      <h3>Filtres</h3>
      <div class="filters-row">
        <select v-model="filters.departement_id" @change="loadData">
          <option value="">Tous les départements</option>
          <option
            v-for="d in departements"
            :key="d.id"
            :value="d.id"
          >
            {{ d.nom }}
          </option>
        </select>

        <select v-model="filters.unite_id" @change="loadData">
          <option value="">Toutes les unités</option>
          <option
            v-for="u in unitesFiltrees"
            :key="u.id"
            :value="u.id"
          >
            {{ u.nom }}
          </option>
        </select>

        <select v-model="filters.etat" @change="loadData">
          <option value="">Tous les états</option>
          <option value="fonctionnel">Fonctionnel</option>
          <option value="non_fonctionnel">Non fonctionnel</option>
          <option value="reparation">En réparation</option>
          <option value="manquant">Manquant</option>
          <option value="vetuste">Vétuste</option>
        </select>

        <button class="reset-btn" @click="resetFilters">Réinitialiser</button>
      </div>
    </div>

    <!-- FILTRES POINT FOCAL (sans département) -->
    <div v-else class="filters-card">
      <h3>Filtres</h3>
      <div class="filters-row">
        <select v-model="filters.unite_id" @change="loadData">
          <option value="">Toutes les unités</option>
          <option
            v-for="u in unitesFiltrees"
            :key="u.id"
            :value="u.id"
          >
            {{ u.nom }}
          </option>
        </select>

        <select v-model="filters.etat" @change="loadData">
          <option value="">Tous les états</option>
          <option value="fonctionnel">Fonctionnel</option>
          <option value="non_fonctionnel">Non fonctionnel</option>
          <option value="reparation">En réparation</option>
          <option value="manquant">Manquant</option>
          <option value="vetuste">Vétuste</option>
        </select>

        <button class="reset-btn" @click="resetFilters">Réinitialiser</button>
      </div>
    </div>

    <!-- TABLE CARD - Structure à 2 tables : header fixe + body scrollable -->
    <div class="table-card-wrapper">
      <div class="table-header-fixed" ref="headerScrollRef">
        <table class="data-table">
          <colgroup>
            <col style="width: 50px">
            <col style="width: 12%">
            <col style="width: 12%">
            <col style="width: 10%">
            <col style="width: 70px">
            <col style="width: 10%">
            <col style="width: 15%">
            <col style="width: 12%">
            <col style="width: 100px">
          </colgroup>
          <thead>
            <tr>
              <th>N°</th>
              <th>Département</th>
              <th>Unité</th>
              <th>Type</th>
              <th>Quantité</th>
              <th>État</th>
              <th>Commentaire</th>
              <th>Dernière MAJ</th>
              <th class="center">Actions</th>
            </tr>
          </thead>
        </table>
      </div>
      <div class="table-body-scroll" ref="tableCardRef" @scroll="onTableScroll" @scrollend="updateScrollPosition">
        <table class="data-table">
          <colgroup>
            <col style="width: 50px">
            <col style="width: 12%">
            <col style="width: 12%">
            <col style="width: 10%">
            <col style="width: 70px">
            <col style="width: 10%">
            <col style="width: 15%">
            <col style="width: 12%">
            <col style="width: 100px">
          </colgroup>
          <tbody>
          <tr v-for="(e, index) in sortedEquipements" :key="e.id">
            <td>{{ index + 1 }}</td>
            <td class="bold">{{ e.departement_nom }}</td>
            <td>{{ e.unite_nom }}</td>
            <td>{{ e.type_nom }}</td>
            <td>{{ e.quantite }}</td>
            <td>
              <span :class="['badge', getEtatClass(e.etat)]">
                {{ getEtatLabel(e.etat) }}
              </span>
            </td>
            <td class="comment">{{ e.commentaire || "-" }}</td>
            <td class="date">{{ formatDate(e.date_maj) }}</td>
            <td class="center">
              <div class="actions-container">
                <button class="action edit" @click="openEdit(e)" title="Modifier">
                  <svg class="action-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                  </svg>
                </button>
                <button class="action delete" @click="remove(e.id)" title="Supprimer">
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

          <tr v-if="sortedEquipements.length === 0">
            <td colspan="9" class="empty">Aucun équipement trouvé</td>
          </tr>
          </tbody>
        </table>
      </div>
    </div>

      <!-- FLÈCHE BAS / HAUT -->
      <button
        v-if="sortedEquipements.length > 5"
        class="scroll-to-bottom-btn"
        @click="isAtBottom ? scrollToTop() : scrollToBottom()"
        :title="isAtBottom ? 'Remonter en haut' : 'Aller en bas de la liste'"
      >
        <svg v-if="!isAtBottom" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <polyline points="19 12 12 19 5 12"></polyline>
        </svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="12" y1="19" x2="12" y2="5"></line>
          <polyline points="5 12 12 5 19 12"></polyline>
        </svg>
      </button>

      <!-- MODAL -->
      <EquipementModal
        v-if="showModal"
        :modelValue="selected"
        :unites="unitesFiltreesPourModal"
        :types="types"
        :isPointFocal="role === 'pf'"
        @close="showModal = false"
        @save="saveEquipement"
        @type-added="handleTypeAdded"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, nextTick, watch } from "vue";
import equipementApi from "../api/equipement";
import departementsApi from "../api/departement";
import unitesApi from "../api/unites";
import typesApi from "../api/equipementsTypes";
import EquipementModal from "../components/EquipementModal.vue";
import SidebarAdmin from "../components/SidebarAdmin.vue";
import SidebarPointFocal from "../components/SidebarPointFocal.vue";
import api from "../api/axios";

const role = ref(localStorage.getItem("role") || "admin");

const equipements = ref([]);
const departements = ref([]);
const unites = ref([]);
const types = ref([]);
const showModal = ref(false);
const selected = ref(null);
const userDepartementId = ref(null);

const filters = ref({
  departement_id: "",
  unite_id: "",
  etat: ""
});

// Unités filtrées selon le département sélectionné (pour les filtres)
const unitesFiltrees = computed(() => {
  if (role.value === "pf") {
    // Pour le point focal, le backend filtre déjà par département
    // On retourne directement toutes les unités (déjà filtrées par le backend)
    return unites.value;
  }
  // Pour l'admin, filtrer par le département sélectionné dans les filtres
  if (!filters.value.departement_id) {
    return unites.value;
  }
  return unites.value.filter(u => u.departement_id == filters.value.departement_id);
});

// Unités filtrées pour le modal (uniquement celles du département du point focal)
const unitesFiltreesPourModal = computed(() => {
  // Le backend filtre déjà les unités par département pour les points focaux
  // On retourne directement toutes les unités (déjà filtrées)
  return unites.value;
});

// Équipements filtrés
const equipementsFiltres = computed(() => {
  let result = equipements.value;

  // Pour l'admin ou super_admin, filtrer par département si sélectionné
  if ((role.value === "admin" || role.value === "super_admin") && filters.value.departement_id) {
    result = result.filter(e => e.departement_id == filters.value.departement_id);
  }

  if (filters.value.unite_id) {
    result = result.filter(e => e.unite_id == filters.value.unite_id);
  }

  if (filters.value.etat) {
    result = result.filter(e => e.etat === filters.value.etat);
  }

  return result;
});

// Équipements triés par ordre alphabétique (département > unité > type)
const sortedEquipements = computed(() => {
  return [...equipementsFiltres.value].sort((a, b) => {
    const cmpDep = (a.departement_nom || "").localeCompare(b.departement_nom || "", "fr");
    if (cmpDep !== 0) return cmpDep;
    const cmpUnit = (a.unite_nom || "").localeCompare(b.unite_nom || "", "fr");
    if (cmpUnit !== 0) return cmpUnit;
    return (a.type_nom || "").localeCompare(b.type_nom || "", "fr");
  });
});

async function loadData() {
  // 1) Charger la liste des équipements selon le rôle
  try {
    let e;
    if (role.value === "admin" || role.value === "super_admin") {
      e = await equipementApi.getAll();
    } else if (role.value === "pf") {
      // PF : uniquement les équipements de son département
      e = await equipementApi.getByDepartement();
      // Récupérer l'ID du département pour référence (si nécessaire)
      if (e?.data && e.data.length > 0) {
        userDepartementId.value = e.data[0].departement_id;
      } else {
        // Si pas d'équipements, récupérer depuis le dashboard
        try {
          const dashboardRes = await api.get("/dashboard/point-focal");
          userDepartementId.value = dashboardRes.data.departement_id;
        } catch (err) {
          console.error("Erreur récupération département:", err);
        }
      }
    }

    equipements.value = e?.data || [];
  } catch (error) {
    console.error(
      "Erreur lors du chargement des équipements:",
      error
    );
    equipements.value = [];
  }

  // 2) Charger toujours les listes nécessaires au modal (accessibles PF + ADMIN)
  // Le backend filtre automatiquement les unités par département pour les points focaux
  try {
    const promises = [typesApi.getAll()];
    
    if (role.value === "admin" || role.value === "super_admin") {
      promises.push(departementsApi.getAll());
    }
    
    promises.push(unitesApi.getAll());
    
    const results = await Promise.all(promises);
    
    if (role.value === "admin" || role.value === "super_admin") {
      // Ordre des promesses : types (0), departements (1), unites (2)
      types.value = results[0].data || [];
      departements.value = results[1].data || [];
      unites.value = results[2].data || [];
    } else {
      // Pour le point focal, les unités sont déjà filtrées par le backend
      // Ordre des promesses : types (0), unites (1)
      types.value = results[0].data || [];
      unites.value = results[1].data || [];
    }
  } catch (error) {
    console.error(
      "Erreur lors du chargement des listes (départements / unités / types):",
      error
    );
    alert(
      "Erreur lors du chargement des listes pour le formulaire. Vérifiez la console."
    );
  }
}

function openAdd() {
  selected.value = null;
  showModal.value = true;
}

function openEdit(e) {
  selected.value = e;
  showModal.value = true;
}

async function saveEquipement(data) {
  try {
    let response;
    if (data.id) {
      response = await equipementApi.update(data.id, data);
    } else {
      response = await equipementApi.create(data);
    }
    
    // Fermer le modal
    showModal.value = false;
    
    // Réinitialiser les filtres uniquement lors de la création d'un nouvel équipement
    // pour s'assurer qu'il apparaisse dans la liste
    if (!data.id) {
      filters.value = {
        departement_id: "",
        unite_id: "",
        etat: ""
      };
    }
    
    // Recharger les données
    await loadData();
  } catch (error) {
    console.error("Erreur lors de l'enregistrement:", error);
    alert(error.response?.data?.message || "Erreur lors de l'enregistrement.");
  }
}

function handleTypeAdded(newType) {
  // Ajouter le nouveau type à la liste
  types.value.push(newType);
  // Trier la liste par nom
  types.value.sort((a, b) => a.nom.localeCompare(b.nom));
}

async function remove(id) {
  if (confirm("Supprimer cet équipement ?")) {
    try {
      await equipementApi.remove(id);
      await loadData();
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      alert("Erreur lors de la suppression.");
    }
  }
}

function resetFilters() {
  filters.value = {
    departement_id: "",
    unite_id: "",
    etat: ""
  };
}

function getEtatClass(etat) {
  const classes = {
    fonctionnel: "success",
    non_fonctionnel: "danger",
    reparation: "warning",
    manquant: "secondary",
    vetuste: "info"
  };
  return classes[etat] || "secondary";
}

function getEtatLabel(etat) {
  const labels = {
    fonctionnel: "Fonctionnel",
    non_fonctionnel: "Non fonctionnel",
    reparation: "En réparation",
    manquant: "Manquant",
    vetuste: "Vétuste"
  };
  return labels[etat] || etat;
}

function formatDate(date) {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

const tableCardRef = ref(null);
const headerScrollRef = ref(null);
const isAtBottom = ref(false);
const SCROLL_THRESHOLD = 80;

function onTableScroll() {
  if (headerScrollRef.value && tableCardRef.value) {
    headerScrollRef.value.scrollLeft = tableCardRef.value.scrollLeft;
  }
  updateScrollPosition();
}

function updateScrollPosition() {
  const el = tableCardRef.value;
  if (!el) return;
  const { scrollTop, scrollHeight, clientHeight } = el;
  const maxScroll = scrollHeight - clientHeight;
  isAtBottom.value = maxScroll > 50 && scrollTop >= maxScroll - SCROLL_THRESHOLD;
}

function scrollToBottom() {
  const el = tableCardRef.value;
  if (!el) return;
  el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  setTimeout(updateScrollPosition, 450);
}

function scrollToTop() {
  const el = tableCardRef.value;
  if (!el) return;
  el.scrollTo({ top: 0, behavior: "smooth" });
  setTimeout(updateScrollPosition, 450);
}

watch(sortedEquipements, () => {
  nextTick(updateScrollPosition);
});

onMounted(async () => {
  await loadData();
  await nextTick();
  updateScrollPosition();
});
</script>

<style scoped>
/* PAGE */
.equipements-page {
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

/* FILTERS CARD */
.filters-card {
  background: white;
  padding: 24px;
  border-radius: 16px;
  margin-bottom: 24px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.filters-card h3 {
  margin: 0 0 18px 0;
  font-size: 18px;
  font-weight: 700;
  color: #1a202c;
  font-family: 'Inter', sans-serif;
  letter-spacing: -0.3px;
}

.filters-row {
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
  align-items: center;
}

.filters-row select {
  padding: 12px 14px;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  font-size: 14px;
  font-family: 'Inter', sans-serif;
  min-width: 200px;
  transition: all 0.3s ease;
  background: white;
  cursor: pointer;
}

.filters-row select:focus {
  outline: none;
  border-color: #0a5bc4;
  box-shadow: 0 0 0 3px rgba(10, 91, 196, 0.1);
}

.reset-btn {
  padding: 12px 20px;
  background: #f7fafc;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  font-family: 'Inter', sans-serif;
  color: #475569;
  transition: all 0.3s ease;
}

.reset-btn:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
  transform: translateY(-1px);
}

/* TABLE CARD - 2 tables : header fixe en haut, body scrollable */
.table-card-wrapper {
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(0, 0, 0, 0.05);
  overflow: hidden;
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

/* TABLE */
.data-table {
  width: 100%;
  min-width: 900px;
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

.comment {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.date {
  font-size: 13px;
  color: #64748b;
  font-weight: 500;
}

.badge {
  padding: 6px 14px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  font-family: 'Inter', sans-serif;
  display: inline-block;
  letter-spacing: 0.2px;
  text-transform: capitalize;
}

.badge.success {
  background: #d1fae5;
  color: #065f46;
}

.badge.danger {
  background: #fee2e2;
  color: #991b1b;
}

.badge.warning {
  background: #fef3c7;
  color: #92400e;
}

.badge.secondary {
  background: #e5e7eb;
  color: #374151;
}

.badge.info {
  background: #dbeafe;
  color: #1e40af;
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

.action.edit:hover {
  background: rgba(37, 99, 235, 0.2);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(37, 99, 235, 0.2);
}

.action.edit:hover .action-icon {
  transform: scale(1.1);
}

.action.delete {
  background: rgba(220, 38, 38, 0.1);
  color: #dc2626;
}

.action.delete:hover {
  background: rgba(220, 38, 38, 0.2);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(220, 38, 38, 0.2);
}

.action.delete:hover .action-icon {
  transform: scale(1.1);
}

/* FLÈCHE BAS / HAUT */
.scroll-to-bottom-btn {
  position: fixed;
  bottom: 32px;
  right: 32px;
  width: 52px;
  height: 52px;
  border-radius: 50%;
  border: none;
  background: linear-gradient(135deg, #0a5bc4 0%, #09315c 100%);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 16px rgba(10, 91, 196, 0.4);
  transition: all 0.3s ease;
  z-index: 100;
}

.scroll-to-bottom-btn:hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 24px rgba(10, 91, 196, 0.5);
}

.scroll-to-bottom-btn svg {
  width: 24px;
  height: 24px;
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

/* RESPONSIVE */
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
  
  .filters-card {
    padding: 16px;
  }
  
  .filters-row {
    flex-direction: column;
  }
  
  .filters-row select {
    min-width: 100%;
  }
  
  .table-body-scroll {
    max-height: 50vh;
  }
  
  .data-table {
    min-width: 800px;
  }
  
  .scroll-to-bottom-btn {
    bottom: 20px;
    right: 16px;
    width: 44px;
    height: 44px;
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
