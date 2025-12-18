<template>
  <div class="reparations-page">
    <!-- HEADER -->
    <div class="header-bar">
      <h1>Réparations des équipements</h1>
      <p class="subtitle">Suivi des pannes et interventions sur l'ensemble du ministère</p>
    </div>

    <!-- FILTRES -->
    <div class="filters-card">
      <div class="filters-row">
        <div class="filter-item">
          <label>Statut</label>
          <select v-model="filters.statut">
            <option value="">Tous</option>
            <option value="ouvert">Déclarée</option>
            <option value="en_cours">En cours</option>
            <option value="termine">Terminée</option>
            <option value="annule">Annulée</option>
          </select>
        </div>

        <div class="filter-item">
          <label>Département</label>
          <select v-model="filters.departement_id">
            <option value="">Tous</option>
            <option
              v-for="d in departements"
              :key="d.id"
              :value="d.id"
            >
              {{ d.nom }}
            </option>
          </select>
        </div>

        <div class="filter-item">
          <label>Date de déclaration</label>
          <div class="dates-row">
            <input type="date" v-model="filters.date_debut" />
            <span>à</span>
            <input type="date" v-model="filters.date_fin" />
          </div>
        </div>

        <button class="reset-btn" @click="resetFilters">Réinitialiser</button>
      </div>
    </div>

    <!-- TABLEAU -->
    <div class="table-card">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Département</th>
            <th>Unité</th>
            <th>Équipement</th>
            <th>Description</th>
            <th>Statut</th>
            <th>Déclarée le</th>
            <th>Résolue le</th>
            <th class="center">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in reparationsFiltrees" :key="r.id">
            <td>{{ r.id }}</td>
            <td class="bold">{{ r.departement_nom }}</td>
            <td>{{ r.unite_nom }}</td>
            <td>#{{ r.equipement_id }}</td>
            <td class="desc">{{ r.description || '-' }}</td>
            <td>
              <span :class="['badge', getStatutClass(r.statut)]">
                {{ getStatutLabel(r.statut) }}
              </span>
            </td>
            <td class="date">{{ formatDate(r.date_demande) }}</td>
            <td class="date">{{ formatDate(r.date_resolution) }}</td>
            <td class="center actions">
              <button
                class="action-btn primary"
                @click="openTraiter(r)"
              >
                Traiter
              </button>
            </td>
          </tr>

          <tr v-if="reparationsFiltrees.length === 0">
            <td colspan="9" class="empty">Aucune réparation trouvée</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- MODAL TRAITEMENT -->
    <div v-if="showModal" class="modal-backdrop" @click.self="showModal = false">
      <div class="modal">
        <h3>Traitement de la réparation #{{ selected?.id }}</h3>
        <p class="modal-subtitle">
          Département : <strong>{{ selected?.departement_nom }}</strong> –
          Unité : <strong>{{ selected?.unite_nom }}</strong>
        </p>
        <p class="modal-desc">
          <strong>Panne :</strong> {{ selected?.description || '-' }}
        </p>

        <div class="form-group">
          <label>Nouveau statut *</label>
          <select v-model="form.statut" required>
            <option value="en_cours">En cours</option>
            <option value="termine">Terminée</option>
            <option value="annule">Annulée</option>
          </select>
        </div>

        <div class="form-group" v-if="form.statut === 'termine'">
          <label>Nouvel état de l'équipement *</label>
          <select v-model="form.nouvel_etat" required>
            <option value="fonctionnel">Fonctionnel</option>
            <option value="non_fonctionnel">Non fonctionnel</option>
            <option value="vetuste">Réformé / vétuste</option>
          </select>
        </div>

        <div class="form-group">
          <label>Commentaire administratif</label>
          <textarea
            v-model="form.commentaire_admin"
            rows="3"
            placeholder="Détail de l'intervention, pièces changées, prestataire, etc."
          ></textarea>
        </div>

        <div class="modal-actions">
          <button class="btn-cancel" @click="showModal = false">Annuler</button>
          <button class="btn-confirm" @click="validerTraitement">
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import reparationsApi from "../api/reparations";
import departementsApi from "../api/departement";

const reparations = ref([]);
const departements = ref([]);

const filters = ref({
  statut: "",
  departement_id: "",
  date_debut: "",
  date_fin: "",
});

const showModal = ref(false);
const selected = ref(null);
const form = ref({
  statut: "en_cours",
  commentaire_admin: "",
  nouvel_etat: "",
});

async function loadData() {
  try {
    const [r, d] = await Promise.all([
      reparationsApi.getAll(),
      departementsApi.getAll(),
    ]);

    reparations.value = r.data || [];
    departements.value = d.data || [];
  } catch (error) {
    console.error("Erreur chargement réparations:", error);
    alert("Erreur lors du chargement des réparations.");
  }
}

const reparationsFiltrees = computed(() => {
  let result = reparations.value;

  if (filters.value.statut) {
    result = result.filter((r) => r.statut === filters.value.statut);
  }

  if (filters.value.departement_id) {
    result = result.filter(
      (r) => r.departement_id == filters.value.departement_id
    );
  }

  if (filters.value.date_debut) {
    const d1 = new Date(filters.value.date_debut);
    result = result.filter((r) => r.date_demande && new Date(r.date_demande) >= d1);
  }

  if (filters.value.date_fin) {
    const d2 = new Date(filters.value.date_fin);
    d2.setHours(23, 59, 59, 999);
    result = result.filter((r) => r.date_demande && new Date(r.date_demande) <= d2);
  }

  return result;
});

function resetFilters() {
  filters.value = {
    statut: "",
    departement_id: "",
    date_debut: "",
    date_fin: "",
  };
}

function getStatutClass(statut) {
  const map = {
    ouvert: "status-open",
    en_cours: "status-progress",
    termine: "status-done",
    annule: "status-cancel",
  };
  return map[statut] || "status-open";
}

function getStatutLabel(statut) {
  const map = {
    ouvert: "Déclarée",
    en_cours: "En cours",
    termine: "Terminée",
    annule: "Annulée",
  };
  return map[statut] || statut;
}

function formatDate(d) {
  if (!d) return "-";
  return new Date(d).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function openTraiter(r) {
  selected.value = r;
  form.value = {
    statut: r.statut === "ouvert" ? "en_cours" : r.statut,
    commentaire_admin: "",
    nouvel_etat: "",
  };
  showModal.value = true;
}

async function validerTraitement() {
  if (!selected.value) return;

  if (form.value.statut === "termine" && !form.value.nouvel_etat) {
    alert("Veuillez choisir le nouvel état de l'équipement.");
    return;
  }

  try {
    await reparationsApi.updateStatut(selected.value.id, {
      statut: form.value.statut,
      commentaire_admin: form.value.commentaire_admin || null,
      nouvel_etat:
        form.value.statut === "termine" ? form.value.nouvel_etat : null,
    });

    alert("Réparation mise à jour avec succès.");
    showModal.value = false;
    await loadData();
  } catch (error) {
    console.error("Erreur traitement réparation:", error);
    alert(error.response?.data?.message || "Erreur lors du traitement.");
  }
}

onMounted(loadData);
</script>

<style scoped>
.reparations-page {
  margin-left: 240px;
  padding: 30px;
  background: #eef2f7;
  min-height: 100vh;
}

.header-bar {
  margin-bottom: 18px;
}

.subtitle {
  color: #4b5563;
  margin-top: 4px;
}

.filters-card {
  background: white;
  padding: 16px 20px;
  border-radius: 12px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.filters-row {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: flex-end;
}

.filter-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.filter-item label {
  font-size: 13px;
  color: #4b5563;
}

.filter-item select,
.filter-item input[type="date"] {
  padding: 8px 10px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  font-size: 14px;
  min-width: 160px;
}

.dates-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.reset-btn {
  padding: 8px 14px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  background: #f9fafb;
  cursor: pointer;
  font-size: 14px;
}

.reset-btn:hover {
  background: #edf2f7;
}

.table-card {
  background: white;
  border-radius: 14px;
  box-shadow: 0 12px 25px rgba(0, 0, 0, 0.06);
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
  padding: 12px;
  font-size: 13px;
  text-align: left;
}

tbody td {
  padding: 12px;
  border-bottom: 1px solid #e5e7eb;
  font-size: 14px;
}

.bold {
  font-weight: 600;
}

.center {
  text-align: center;
}

.desc {
  max-width: 260px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.date {
  font-size: 12px;
  color: #6b7280;
}

.actions {
  display: flex;
  justify-content: center;
}

.action-btn {
  padding: 6px 12px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  background: #0a5bc4;
  color: white;
}

.action-btn:hover {
  background: #09315c;
}

.badge {
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
}

.status-open {
  background: #fef3c7;
  color: #92400e;
}

.status-progress {
  background: #dbeafe;
  color: #1d4ed8;
}

.status-done {
  background: #d1fae5;
  color: #065f46;
}

.status-cancel {
  background: #fee2e2;
  color: #b91c1c;
}

.empty {
  text-align: center;
  padding: 30px;
  color: #9ca3af;
}

/* Modal traitement */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

.modal {
  background: white;
  padding: 24px;
  border-radius: 12px;
  width: 90%;
  max-width: 520px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
}

.modal h3 {
  margin: 0 0 8px 0;
  font-size: 18px;
}

.modal-subtitle {
  margin: 0 0 8px 0;
  font-size: 13px;
  color: #4b5563;
}

.modal-desc {
  font-size: 14px;
  margin-bottom: 16px;
}

.form-group {
  margin-bottom: 14px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-size: 13px;
  font-weight: 600;
  color: #374151;
}

.form-group select,
.form-group textarea {
  width: 100%;
  padding: 8px 10px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  font-size: 14px;
  box-sizing: border-box;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 12px;
}

.btn-cancel {
  padding: 8px 14px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  background: #f9fafb;
  cursor: pointer;
}

.btn-confirm {
  padding: 8px 16px;
  border-radius: 8px;
  border: none;
  background: #0a5bc4;
  color: white;
  cursor: pointer;
}
</style>
