<template>
  <div class="unites-page">
    <SidebarPointFocal />

    <div class="content-wrapper">
      <!-- HEADER -->
      <div class="header-bar">
        <div class="header-content">
          <h1>Gestion des Unités</h1>
          <p class="subtitle">Gérez les unités de votre département</p>
        </div>

        <button class="add-btn" @click="openAdd">
          <span>＋</span> Ajouter une unité
        </button>
      </div>

      <!-- FILTRES -->
      <div class="filters-card">
        <h3>Filtres</h3>
        <div class="filters-row">
          <select v-model="filters.type_unite">
            <option value="">Tous les types</option>
            <option
              v-for="t in typesUnites"
              :key="t"
              :value="t"
            >
              {{ t }}
            </option>
          </select>

          <button class="reset-btn" @click="resetFilters">Réinitialiser</button>
        </div>
      </div>

      <!-- BARRE DE RECHERCHE -->
      <div class="search-bar">
        <div class="search-input-wrapper">
          <svg class="search-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            v-model="searchQuery"
            type="text"
            class="search-input"
            placeholder="Rechercher une unité par son nom..."
          />
        </div>
      </div>

      <!-- TABLE CARD - Structure à 2 tables : header fixe + body scrollable -->
      <div class="table-card-wrapper">
        <div class="table-header-fixed" ref="headerScrollRef">
          <table class="data-table">
            <colgroup>
              <col style="width: 50px">
              <col style="width: 20%">
              <col style="width: 18%">
              <col style="width: 20%">
              <col style="width: 15%">
              <col style="width: 100px">
            </colgroup>
            <thead>
              <tr>
                <th>N°</th>
                <th>Nom</th>
                <th>Type d'unité</th>
                <th>Adresse</th>
                <th>Contact</th>
                <th class="center">Actions</th>
              </tr>
            </thead>
          </table>
        </div>
        <div class="table-body-scroll" ref="tableCardRef" @scroll="onTableScroll" @scrollend="updateScrollPosition">
          <table class="data-table">
            <colgroup>
              <col style="width: 50px">
              <col style="width: 20%">
              <col style="width: 18%">
              <col style="width: 20%">
              <col style="width: 15%">
              <col style="width: 100px">
            </colgroup>
            <tbody>
            <tr v-for="(u, index) in sortedUnites" :key="u.id">
              <td>{{ index + 1 }}</td>
              <td class="bold">{{ u.nom }}</td>
              <td>{{ u.reference || "-" }}</td>
              <td>{{ u.adresse || "-" }}</td>
              <td>{{ u.contact || "-" }}</td>
              <td class="center">
                <div class="actions-container">
                  <button class="action edit" @click="openEdit(u)" title="Modifier">
                    <svg class="action-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                  </button>
                  <button class="action delete" @click="remove(u.id)" title="Supprimer">
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

            <tr v-if="sortedUnites.length === 0">
              <td colspan="6" class="empty">
                {{ hasActiveFilters ? "Aucune unité ne correspond aux filtres" : "Aucune unité enregistrée" }}
              </td>
            </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- FLÈCHE BAS / HAUT -->
      <button
        v-if="sortedUnites.length > 5"
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
      <UniteModal
        v-if="showModal"
        :modelValue="selected"
        :departements="[]"
        :isPointFocal="true"
        :departementId="departementId"
        @close="showModal = false"
        @save="saveUnite"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from "vue";
import unitesApi from "../api/unites";
import UniteModal from "../components/UniteModal.vue";
import SidebarPointFocal from "../components/SidebarPointFocal.vue";
import api from "../api/axios";

const unites = ref([]);
const showModal = ref(false);
const searchQuery = ref("");
const filters = ref({ type_unite: "" });

const typesUnites = computed(() => {
  const types = new Set();
  unites.value.forEach((u) => {
    if (u.reference && u.reference.trim()) types.add(u.reference.trim());
  });
  return [...types].sort((a, b) => a.localeCompare(b, "fr"));
});

const filteredUnites = computed(() => {
  let list = unites.value;

  if (filters.value.type_unite) {
    list = list.filter((u) => (u.reference || "").trim() === filters.value.type_unite);
  }

  const q = searchQuery.value.trim().toLowerCase();
  if (q) {
    list = list.filter((u) => (u.nom || "").toLowerCase().includes(q));
  }
  return list;
});

const hasActiveFilters = computed(() => !!filters.value.type_unite || !!searchQuery.value.trim());

function resetFilters() {
  filters.value = { type_unite: "" };
  searchQuery.value = "";
}

const sortedUnites = computed(() => {
  return [...filteredUnites.value].sort((a, b) =>
    (a.nom || "").localeCompare(b.nom || "", "fr")
  );
});
const selected = ref(null);
const departementId = ref(null);

async function loadData() {
  try {
    // Charger les unités du département du point focal (déjà filtrées par le backend)
    const u = await unitesApi.getAll();
    unites.value = u.data || [];
    
    // Récupérer l'ID du département pour le modal
    const userData = await getUserDepartement();
    if (userData.departement_id) {
      departementId.value = userData.departement_id;
    }
  } catch (error) {
    console.error("Erreur lors du chargement des unités :", error);
    unites.value = [];
  }
}

async function getUserDepartement() {
  try {
    const res = await api.get("/dashboard/point-focal");
    return {
      departement_id: res.data.departement_id,
      departement_nom: res.data.departement
    };
  } catch (error) {
    console.error("Erreur lors de la récupération du département :", error);
    return { departement_id: null, departement_nom: null };
  }
}

function openAdd() {
  selected.value = null;
  showModal.value = true;
}

function openEdit(u) {
  selected.value = u;
  showModal.value = true;
}

async function saveUnite(data) {
  try {
    if (data.id) {
      await unitesApi.update(data.id, data);
    } else {
      await unitesApi.create(data);
    }
    showModal.value = false;
    await loadData();
  } catch (error) {
    console.error("Erreur lors de l'enregistrement:", error);
    alert(error.response?.data?.message || "Erreur lors de l'enregistrement.");
  }
}

async function remove(id) {
  if (confirm("Supprimer cette unité ?")) {
    try {
      await unitesApi.remove(id);
      await loadData();
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      alert("Erreur lors de la suppression.");
    }
  }
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

watch(sortedUnites, () => {
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
.unites-page {
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

/* FILTRES */
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

.data-table {
  width: 100%;
  min-width: 700px;
  border-collapse: collapse;
  font-family: 'Inter', sans-serif;
}

.data-table thead {
  background: linear-gradient(135deg, #0a5bc4 0%, #09315c 100%);
}

.data-table thead th {
  color: white;
  padding: 18px 16px;
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
  padding: 18px 16px;
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

/* SEARCH BAR */
.search-bar {
  margin-bottom: 24px;
}

.search-input-wrapper {
  position: relative;
  max-width: 400px;
}

.search-icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  color: #94a3b8;
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 14px 16px 14px 48px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 15px;
  font-family: 'Inter', sans-serif;
  transition: all 0.2s ease;
  background: white;
}

.search-input:focus {
  outline: none;
  border-color: #0a5bc4;
  box-shadow: 0 0 0 3px rgba(10, 91, 196, 0.1);
}

.search-input::placeholder {
  color: #94a3b8;
}

/* FLÈCHE VERS LE BAS */
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
</style>

