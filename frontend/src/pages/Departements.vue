<template>
  <div class="page">
    <h1>Gestion des Départements</h1>

    <button class="btn primary" @click="openAdd">
      + Ajouter
    </button>

    <table class="table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Nom</th>
          <th>Code</th>
          <th>Créé le</th>
          <th>Actions</th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="d in departements" :key="d.id">
          <td>{{ d.id }}</td>
          <td>{{ d.nom }}</td>
          <td>{{ d.code || "-" }}</td>
          <td>{{ formatDate(d.created_at) }}</td>
          <td>
            <button @click="openEdit(d)">✏️</button>
            <button @click="remove(d.id)">🗑</button>
          </td>
        </tr>

        <tr v-if="departements.length === 0">
          <td colspan="5">Aucun département</td>
        </tr>
      </tbody>
    </table>

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

/* Charger la liste */
async function loadDepartements() {
  const res = await api.getAll();
  departements.value = res.data;
}

/* Ouvrir modal ajout */
function openAdd() {
  selected.value = null;
  showModal.value = true;
}

/* Ouvrir modal édition */
function openEdit(dep) {
  selected.value = dep;
  showModal.value = true;
}

/* Sauvegarde (AJOUT ou MODIF) */
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
    console.error(e);
    alert("Erreur lors de l'enregistrement");
  }
}

/* Suppression */
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
.page { padding: 20px; }
.table { width: 100%; border-collapse: collapse; margin-top: 15px; }
th, td { border: 1px solid #ddd; padding: 8px; }
th { background: #f4f6fa; }
.btn.primary { margin-bottom: 10px; }
</style>
