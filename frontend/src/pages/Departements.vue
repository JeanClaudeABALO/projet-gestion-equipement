<template>
  <div class="departement-page">
    <SidebarAdmin />

    <div class="content-wrapper">
      <!-- HEADER -->
      <div class="header-bar">
        <div class="header-content">
          <h1>Gestion des Départements</h1>
          <p class="subtitle">Gérez les départements de votre organisation</p>
        </div>

        <button class="add-btn" @click="openAdd">
          <span>＋</span> Ajouter un département
        </button>
      </div>

    <!-- TABLE CARD - Structure à 2 tables : header fixe + body scrollable -->
    <div class="table-card-wrapper">
      <div class="table-header-fixed" ref="headerScrollRef">
        <table class="data-table">
          <colgroup>
            <col style="width: 50px">
            <col style="width: 35%">
            <col style="width: 15%">
            <col style="width: 25%">
            <col style="width: 100px">
          </colgroup>
          <thead>
            <tr>
              <th>N°</th>
              <th>Nom du département</th>
              <th>Code</th>
              <th>Date de création</th>
              <th class="center">Actions</th>
            </tr>
          </thead>
        </table>
      </div>
      <div class="table-body-scroll" ref="bodyScrollRef" @scroll="onTableScroll">
        <table class="data-table">
          <colgroup>
            <col style="width: 50px">
            <col style="width: 35%">
            <col style="width: 15%">
            <col style="width: 25%">
            <col style="width: 100px">
          </colgroup>
          <tbody>
          <tr v-for="(d, index) in sortedDepartements" :key="d.id">
            <td>{{ index + 1 }}</td>
            <td class="bold">{{ d.nom }}</td>
            <td>{{ d.code || "-" }}</td>
            <td>{{ formatDate(d.created_at) }}</td>
            <td class="center">
              <div class="actions-container">
                <button class="action edit" @click="openEdit(d)" title="Modifier">
                  <svg class="action-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                  </svg>
                </button>
                <button class="action delete" @click="remove(d.id)" title="Supprimer">
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

          <tr v-if="sortedDepartements.length === 0">
            <td colspan="5" class="empty">
              Aucun département enregistré
            </td>
          </tr>
          </tbody>
        </table>
      </div>
    </div>

      <!-- MODAL -->
      <DepartementModal
        v-if="showModal"
        :modelValue="selected"
        @close="showModal = false"
        @save="saveDepartement"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import api from "../api/departement";
import DepartementModal from "../components/DepartementModal.vue";
import SidebarAdmin from "../components/SidebarAdmin.vue";

const headerScrollRef = ref(null);
const bodyScrollRef = ref(null);
const departements = ref([]);

function onTableScroll() {
  if (headerScrollRef.value && bodyScrollRef.value) {
    headerScrollRef.value.scrollLeft = bodyScrollRef.value.scrollLeft;
  }
}
const showModal = ref(false);
const selected = ref(null);

const sortedDepartements = computed(() => {
  return [...departements.value].sort((a, b) =>
    (a.nom || "").localeCompare(b.nom || "", "fr")
  );
});

async function loadDepartements() {
  const res = await api.getAll();
  departements.value = res.data;
}

function openAdd() {
  selected.value = null;
  showModal.value = true;
}

function openEdit(dep) {
  selected.value = dep;
  showModal.value = true;
}

async function saveDepartement(data) {
  try {
    if (data.id) {
      await api.update(data.id, data);
    } else {
      await api.create(data);
    }
    showModal.value = false;
    await loadDepartements();
  } catch (e) {
    alert("Erreur lors de l'enregistrement");
  }
}

async function remove(id) {
  if (confirm("Supprimer ce département ?")) {
    await api.remove(id);
    await loadDepartements();
  }
}

function formatDate(d) {
  return new Date(d).toLocaleDateString();
}

onMounted(loadDepartements);
</script>

<style scoped>
/* PAGE */
.departement-page {
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
  min-width: 600px;
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
  font-family: 'Inter', sans-serif;
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

/* ACTIONS */
.center {
  text-align: center;
}

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
    min-width: 550px;
  }
}

@media (max-width: 480px) {
  .header-content h1 {
    font-size: 18px;
  }
  
  .data-table {
    min-width: 500px;
  }
}
</style>
