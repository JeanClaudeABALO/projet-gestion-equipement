<template>
  <div class="reparations-page">
    <SidebarAdmin />

    <div class="content-wrapper" :class="{ 'sidebar-hidden': !sidebarOpen }">
      <!-- HEADER -->
      <div class="header-bar">
        <div class="header-content">
          <h1>Réparations des équipements</h1>
          <p class="subtitle">Suivi des pannes et interventions sur l'ensemble du CDSP</p>
        </div>
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
            <td>
              <span class="equipement-info">
                {{ r.type_nom || 'Équipement' }}
                <small v-if="r.quantite > 1">×{{ r.quantite }}</small>
                <small class="equip-id">#{{ r.equipement_id }}</small>
              </span>
            </td>
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
  </div>
</template>

<script setup>
import { ref, onMounted, computed, inject } from "vue";
import reparationsApi from "../api/reparations";
import departementsApi from "../api/departement";
import SidebarAdmin from "../components/SidebarAdmin.vue";

const reparations = ref([]);
const sidebarOpen = inject("sidebarOpen", ref(false));
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
/* PAGE */
.reparations-page {
  display: flex;
  min-height: 100vh;
  background: linear-gradient(135deg, #f6f7fb 0%, #eef2f7 100%);
  font-family: 'Inter', 'Segoe UI', 'Roboto', -apple-system, BlinkMacSystemFont, sans-serif;
}

.content-wrapper {
  margin-left: 220px;
  width: calc(100% - 220px);
  padding: 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-sizing: border-box;
  transition: margin-left 0.3s ease, width 0.3s ease;
}

.content-wrapper.sidebar-hidden {
  margin-left: 0;
  width: 100%;
}

.content-wrapper > * {
  width: 100%;
  max-width: 1400px;
}

/* HEADER BAR */
.header-bar {
  margin-bottom: 32px;
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

/* FILTERS CARD */
.filters-card {
  background: white;
  padding: 24px;
  border-radius: 16px;
  margin-bottom: 24px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.filters-row {
  display: flex;
  flex-wrap: wrap;
  gap: 18px;
  align-items: flex-end;
}

.filter-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.filter-item label {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  font-family: 'Inter', sans-serif;
}

.filter-item select,
.filter-item input[type="date"] {
  padding: 12px 14px;
  border-radius: 10px;
  border: 2px solid #e2e8f0;
  font-size: 14px;
  font-family: 'Inter', sans-serif;
  min-width: 180px;
  transition: all 0.3s ease;
  background: white;
  cursor: pointer;
}

.filter-item select:focus,
.filter-item input[type="date"]:focus {
  outline: none;
  border-color: #1a6fd4;
  box-shadow: 0 0 0 3px rgba(26, 111, 212, 0.1);
}

.dates-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.dates-row span {
  color: #64748b;
  font-size: 14px;
  font-weight: 500;
}

.reset-btn {
  padding: 12px 20px;
  border-radius: 10px;
  border: 2px solid #e2e8f0;
  background: #f7fafc;
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

/* TABLE CARD */
.table-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

/* TABLE */
table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  font-family: 'Inter', sans-serif;
}

/* TABLE HEADER */
thead {
  background: linear-gradient(135deg, #1a6fd4 0%, #0f4a7a 100%);
}

thead th {
  color: white;
  padding: 18px 14px;
  font-size: 12px;
  font-weight: 600;
  font-family: 'Inter', sans-serif;
  letter-spacing: 0.3px;
  text-transform: uppercase;
  text-align: left;
}

thead th.center {
  text-align: center;
}

/* BODY */
tbody td {
  padding: 16px 14px;
  border-bottom: 1px solid #f1f5f9;
  font-size: 14px;
  font-weight: 500;
  font-family: 'Inter', sans-serif;
  color: #475569;
}

tbody tr {
  transition: all 0.2s ease;
}

tbody tr:hover {
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

.desc {
  max-width: 260px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.equipement-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.equipement-info .equip-id {
  font-size: 12px;
  color: #64748b;
  font-weight: 500;
}

.date {
  font-size: 13px;
  color: #64748b;
  font-weight: 500;
}

.actions {
  display: flex;
  justify-content: center;
}

.action-btn {
  padding: 10px 18px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  font-family: 'Inter', sans-serif;
  background: linear-gradient(135deg, #1a6fd4 0%, #0f4a7a 100%);
  color: white;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(26, 111, 212, 0.2);
  letter-spacing: 0.3px;
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(26, 111, 212, 0.3);
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
  padding: 40px;
  color: #94a3b8;
  font-size: 15px;
  font-weight: 500;
  font-family: 'Inter', sans-serif;
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
  padding: 32px;
  border-radius: 16px;
  width: 90%;
  max-width: 560px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  font-family: 'Inter', 'Segoe UI', 'Roboto', -apple-system, BlinkMacSystemFont, sans-serif;
}

.modal h3 {
  margin: 0 0 12px 0;
  font-size: 24px;
  font-weight: 700;
  color: #1a202c;
  font-family: 'Inter', sans-serif;
  letter-spacing: -0.3px;
}

.modal-subtitle {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: #64748b;
  font-weight: 500;
  font-family: 'Inter', sans-serif;
}

.modal-desc {
  font-size: 14px;
  margin-bottom: 20px;
  color: #475569;
  font-family: 'Inter', sans-serif;
  padding: 12px;
  background: #f8fafc;
  border-radius: 10px;
  border-left: 4px solid #1a6fd4;
}

.form-group {
  margin-bottom: 18px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #2d3748;
  font-family: 'Inter', sans-serif;
}

.form-group select,
.form-group textarea {
  width: 100%;
  padding: 12px 14px;
  border-radius: 10px;
  border: 2px solid #e2e8f0;
  font-size: 14px;
  font-family: 'Inter', sans-serif;
  box-sizing: border-box;
  transition: all 0.3s ease;
}

.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #1a6fd4;
  box-shadow: 0 0 0 3px rgba(26, 111, 212, 0.1);
}

.form-group textarea {
  resize: vertical;
  min-height: 80px;
}

.form-group textarea::placeholder {
  color: #94a3b8;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

.btn-cancel {
  padding: 12px 24px;
  border-radius: 10px;
  border: 2px solid #e2e8f0;
  background: #f7fafc;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  font-family: 'Inter', sans-serif;
  color: #475569;
  transition: all 0.3s ease;
}

.btn-cancel:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
}

.btn-confirm {
  padding: 12px 24px;
  border-radius: 10px;
  border: none;
  background: linear-gradient(135deg, #1a6fd4 0%, #0f4a7a 100%);
  color: white;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  font-family: 'Inter', sans-serif;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(26, 111, 212, 0.2);
}

.btn-confirm:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(26, 111, 212, 0.3);
}

@media (max-width: 768px) {
  .header-bar {
    flex-direction: column;
    align-items: stretch;
  }
  
  .header-content h1 {
    font-size: 22px;
  }
  
  .filters-card {
    padding: 16px;
  }
  
  .filters-row {
    flex-direction: column;
    gap: 16px;
  }
  
  .filter-item {
    width: 100%;
  }
  
  .filter-item select,
  .dates-row {
    width: 100%;
  }
  
  .table-card {
    overflow-x: auto;
  }
  
  .table-card table {
    min-width: 800px;
  }
  
  .modal {
    width: 95%;
    max-width: none;
    margin: 16px;
    padding: 24px;
  }
}

@media (max-width: 480px) {
  .header-content h1 {
    font-size: 18px;
  }
  
  .modal {
    padding: 20px;
  }
}
</style>
