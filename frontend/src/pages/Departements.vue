<template>
  <div class="departement-page">

    <!-- HEADER -->
    <div class="header-bar">
      <h1>Gestion des Départements</h1>

      <button class="add-btn" @click="openAdd">
        <span>＋</span> Ajouter un département
      </button>
    </div>

    <!-- TABLE CARD -->
    <div class="table-card">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nom du département</th>
            <th>Code</th>
            <th>Date de création</th>
            <th class="center">Actions</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="d in departements" :key="d.id">
            <td>{{ d.id }}</td>
            <td class="bold">{{ d.nom }}</td>
            <td>{{ d.code || "-" }}</td>
            <td>{{ formatDate(d.created_at) }}</td>
            <td class="center">
              <button class="action edit" @click="openEdit(d)">✏️</button>
              <button class="action delete" @click="remove(d.id)">🗑</button>
            </td>
          </tr>

          <tr v-if="departements.length === 0">
            <td colspan="5" class="empty">
              Aucun département enregistré
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- MODAL -->
    <DepartementModal
      v-if="showModal"
      :modelValue="selected"
      @close="showModal = false"
      @save="saveDepartement"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import api from "../api/departement";
import DepartementModal from "../components/DepartementModal.vue";

const departements = ref([]);
const showModal = ref(false);
const selected = ref(null);

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
  padding: 30px;
  background: #eef2f7;
  min-height: 100vh;
}

/* HEADER BAR */
.header-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
}

.header-bar h1 {
  font-size: 24px;
  color: #1f2d3d;
}

/* ADD BUTTON */
.add-btn {
  background: #16a34a;
  color: white;
  border: none;
  padding: 12px 22px;
  border-radius: 10px;
  font-size: 15px;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
}

.add-btn span {
  font-size: 22px;
}

.add-btn:hover {
  background: #15803d;
}

/* TABLE CARD */
.table-card {
  background: white;
  border-radius: 14px;
  box-shadow: 0 12px 25px rgba(0,0,0,0.08);
  overflow: hidden;
}

/* TABLE */
table {
  width: 100%;
  border-collapse: collapse;
}

/* TABLE HEADER */
thead {
  background: linear-gradient(90deg, #0a5bc4, #09315c);
}

thead th {
  color: white;
  padding: 16px;
  text-align: left;
  font-size: 14px;
}

/* BODY */
tbody td {
  padding: 14px;
  border-bottom: 1px solid #eee;
}

tbody tr:hover {
  background: #f8fafc;
}

.bold {
  font-weight: 600;
}

/* ACTIONS */
.center {
  text-align: center;
}

.action {
  border: none;
  background: none;
  cursor: pointer;
  font-size: 16px;
  margin: 0 5px;
}

.action.edit:hover {
  color: #2563eb;
}

.action.delete:hover {
  color: #dc2626;
}

/* EMPTY */
.empty {
  text-align: center;
  padding: 30px;
  color: #999;
}
</style>
