<template>
  <div class="equipements-page">
    <!-- HEADER -->
    <div class="header-bar">
      <h1>Gestion des Équipements</h1>
      <button class="add-btn" @click="openAdd">
        <span>＋</span> Ajouter un équipement
      </button>
    </div>

    <!-- FILTRES -->
    <div class="filters-card">
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

    <!-- TABLE CARD -->
    <div class="table-card">
      <table>
        <thead>
          <tr>
            <th>ID</th>
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

        <tbody>
          <tr v-for="e in equipementsFiltres" :key="e.id">
            <td>{{ e.id }}</td>
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
              <button class="action edit" @click="openEdit(e)">✏️</button>
              <button class="action delete" @click="remove(e.id)">🗑</button>
            </td>
          </tr>

          <tr v-if="equipementsFiltres.length === 0">
            <td colspan="9" class="empty">Aucun équipement trouvé</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- MODAL -->
    <EquipementModal
      v-if="showModal"
      :modelValue="selected"
      :unites="unites"
      :types="types"
      @close="showModal = false"
      @save="saveEquipement"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import equipementApi from "../api/equipement";
import departementsApi from "../api/departement";
import unitesApi from "../api/unites";
import typesApi from "../api/equipementsTypes";
import EquipementModal from "../components/EquipementModal.vue";

const equipements = ref([]);
const departements = ref([]);
const unites = ref([]);
const types = ref([]);
const showModal = ref(false);
const selected = ref(null);

const filters = ref({
  departement_id: "",
  unite_id: "",
  etat: ""
});

// Unités filtrées selon le département sélectionné
const unitesFiltrees = computed(() => {
  if (!filters.value.departement_id) {
    return unites.value;
  }
  return unites.value.filter(u => u.departement_id == filters.value.departement_id);
});

// Équipements filtrés
const equipementsFiltres = computed(() => {
  let result = equipements.value;

  if (filters.value.departement_id) {
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

async function loadData() {
  try {
    const [e, d, u, t] = await Promise.all([
      equipementApi.getAll(),
      departementsApi.getAll(),
      unitesApi.getAll(),
      typesApi.getAll()
    ]);

    equipements.value = e.data || [];
    departements.value = d.data || [];
    unites.value = u.data || [];
    types.value = t.data || [];
  } catch (error) {
    console.error("Erreur lors du chargement:", error);
    alert("Erreur lors du chargement des données.");
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
    if (data.id) {
      await equipementApi.update(data.id, data);
    } else {
      await equipementApi.create(data);
    }
    showModal.value = false;
    await loadData();
  } catch (error) {
    console.error("Erreur lors de l'enregistrement:", error);
    alert(error.response?.data?.message || "Erreur lors de l'enregistrement.");
  }
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

onMounted(loadData);
</script>

<style scoped>
.equipements-page {
  margin-left: 240px;
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

.filters-card {
  background: white;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.filters-card h3 {
  margin: 0 0 15px 0;
  font-size: 16px;
  color: #1a202c;
}

.filters-row {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  align-items: center;
}

.filters-row select {
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  min-width: 180px;
}

.reset-btn {
  padding: 8px 16px;
  background: #f7fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
}

.reset-btn:hover {
  background: #edf2f7;
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
  font-weight: 600;
}

tbody td {
  padding: 14px;
  border-bottom: 1px solid #eee;
}

.bold { font-weight: 600; }
.center { text-align: center; }
.comment { max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.date { font-size: 13px; color: #666; }

.badge {
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
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

.action {
  border: none;
  background: none;
  cursor: pointer;
  font-size: 16px;
  margin: 0 4px;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background 0.2s;
}

.action:hover {
  background: #f3f4f6;
}

.empty {
  text-align: center;
  padding: 30px;
  color: #999;
}
</style>
