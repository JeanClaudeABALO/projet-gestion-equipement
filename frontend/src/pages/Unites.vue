<template>
  <div class="unites-page">

    <!-- HEADER -->
    <div class="header-bar">
      <h1>Gestion des Unités</h1>

      <button class="add-btn" @click="openAdd">
        <span>＋</span> Ajouter une unité
      </button>
    </div>

    <!-- TABLE CARD -->
    <div class="table-card">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nom</th>
            <th>Référence</th>
            <th>Département</th>
            <th>Contact</th>
            <th class="center">Actions</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="u in unites" :key="u.id">
            <td>{{ u.id }}</td>
            <td class="bold">{{ u.nom }}</td>
            <td>{{ u.reference || "-" }}</td>
            <td>{{ u.departement_nom }}</td>
            <td>{{ u.contact || "-" }}</td>
            <td class="center">
              <button class="action edit" @click="openEdit(u)">✏️</button>
              <button class="action delete" @click="remove(u.id)">🗑</button>
            </td>
          </tr>

          <tr v-if="unites.length === 0">
            <td colspan="6" class="empty">Aucune unité enregistrée</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- MODAL -->
    <UniteModal
      v-if="showModal"
      :modelValue="selected"
      :departements="departements"
      @close="showModal = false"
      @save="saveUnite"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import unitesApi from "../api/unites";
import departementsApi from "../api/departement";
import UniteModal from "../components/UniteModal.vue";

const unites = ref([]);
const departements = ref([]);
const showModal = ref(false);
const selected = ref(null);

async function loadData() {
  // On charge les unités et les départements séparément pour que
  // l'échec de /unites (401, etc.) n'empêche PAS l'affichage des départements.

  // Charger les unités (protégé par JWT)
  try {
    const u = await unitesApi.getAll();
    unites.value = u.data || [];
  } catch (error) {
    console.error("Erreur lors du chargement des unités :", error);
    // On ne bloque pas l'écran, on laisse la table éventuellement vide
  }

  // Charger les départements (endpoint public)
  try {
    const d = await departementsApi.getAll();
    departements.value = d.data || [];
    console.log("Départements chargés :", departements.value);
  } catch (error) {
    console.error("Erreur lors du chargement des départements :", error);
    alert("Impossible de charger la liste des départements.");
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
  if (data.id) {
    await unitesApi.update(data.id, data);
  } else {
    await unitesApi.create(data);
  }
  showModal.value = false;
  await loadData();
}

async function remove(id) {
  if (confirm("Supprimer cette unité ?")) {
    await unitesApi.remove(id);
    await loadData();
  }
}

onMounted(loadData);
</script>

<style scoped>
.unites-page {
  padding: 30px;
  background: #eef2f7;
  min-height: 100vh;
}

.header-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
}

.add-btn {
  background: #16a34a;
  color: white;
  border: none;
  padding: 12px 22px;
  border-radius: 10px;
  font-weight: bold;
  display: flex;
  gap: 10px;
  cursor: pointer;
}

.table-card {
  background: white;
  border-radius: 14px;
  box-shadow: 0 12px 25px rgba(0,0,0,0.08);
  overflow: hidden;
}

table {
  width: 100%;
  border-collapse: collapse;
}

thead {
  background: linear-gradient(90deg, #0a5bc4, #09315c);
}

thead th {
  color: white;
  padding: 14px;
  text-align: left;
}

tbody td {
  padding: 14px;
  border-bottom: 1px solid #eee;
}

.bold { font-weight: 600; }
.center { text-align: center; }

.action {
  border: none;
  background: none;
  cursor: pointer;
  font-size: 16px;
}

.empty {
  text-align: center;
  padding: 30px;
  color: #999;
}
</style>
