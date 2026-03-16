<template>
  <div class="reparations-pf-page">
    <SidebarPointFocal />

    <div class="content-wrapper">
      <!-- HEADER -->
      <div class="header-bar">
        <div class="header-content">
          <h1>Réparations</h1>
          <p class="subtitle">Gérez les réparations des équipements de votre département</p>
        </div>
        <button class="add-btn" @click="showModal = true">
          <span>＋</span> Déclarer une panne
        </button>
      </div>

    <!-- TABLEAU -->
    <div class="table-card">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Unité</th>
            <th>Équipement</th>
            <th>Description</th>
            <th>Statut</th>
            <th>Déclarée le</th>
            <th>Résolue le</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in reparations" :key="r.id">
            <td>{{ r.id }}</td>
            <td>{{ r.unite_nom }}</td>
            <td>#{{ r.equipement_id }}</td>
            <td class="desc">{{ r.description || "-" }}</td>
            <td>
              <span :class="['badge', getStatutClass(r.statut)]">
                {{ getStatutLabel(r.statut) }}
              </span>
            </td>
            <td class="date">{{ formatDate(r.date_demande) }}</td>
            <td class="date">{{ formatDate(r.date_resolution) }}</td>
          </tr>

          <tr v-if="reparations.length === 0">
            <td colspan="7" class="empty">Aucune réparation trouvée</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal déclaration de panne -->
    <div v-if="showModal" class="modal-backdrop" @click.self="closeModal">
      <div class="modal">
        <h3>Déclarer une panne</h3>

        <div class="form-group">
          <label>Équipement *</label>
          <select v-model="form.equipement_id" required>
            <option value="">-- Sélectionner un équipement --</option>
            <option
              v-for="e in equipements"
              :key="e.id"
              :value="e.id"
            >
              #{{ e.id }} - {{ e.unite_nom }} / {{ e.type_nom }} ({{ getEtatLabel(e.etat) }})
            </option>
          </select>
        </div>

        <div class="form-group">
          <label>Description de la panne *</label>
          <textarea
            v-model="form.description"
            rows="3"
            placeholder="Décrire le problème rencontré..."
          ></textarea>
        </div>

        <div class="modal-actions">
          <button class="btn-cancel" @click="closeModal">Annuler</button>
          <button class="btn-confirm" @click="submit">Enregistrer</button>
        </div>
      </div>
    </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import reparationsApi from "../api/reparations";
import equipementApi from "../api/equipement";
import SidebarPointFocal from "../components/SidebarPointFocal.vue";

const reparations = ref([]);
const equipements = ref([]);
const showModal = ref(false);
const form = ref({
  equipement_id: "",
  description: "",
});

async function loadData() {
  try {
    const [r, e] = await Promise.all([
      reparationsApi.getByDepartement(),
      equipementApi.getByDepartement(),
    ]);

    reparations.value = r.data || [];
    equipements.value = e.data || [];
  } catch (error) {
    console.error("Erreur chargement réparations PF:", error);
    const errorMsg = error.response?.data?.message || "Erreur lors du chargement des réparations.";
    alert(errorMsg);
  }
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

function getEtatLabel(etat) {
  const map = {
    fonctionnel: "Fonctionnel",
    non_fonctionnel: "Non fonctionnel",
    reparation: "En réparation",
    manquant: "Manquant",
    vetuste: "Vétuste",
  };
  return map[etat] || etat;
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

function closeModal() {
  showModal.value = false;
  form.value = { equipement_id: "", description: "" };
}

async function submit() {
  if (!form.value.equipement_id || !form.value.description) {
    alert("Veuillez sélectionner un équipement et décrire la panne.");
    return;
  }

  try {
    await reparationsApi.create({
      equipement_id: form.value.equipement_id,
      description: form.value.description,
    });
    alert("Panne déclarée avec succès !");
    closeModal();
    await loadData();
  } catch (error) {
    console.error("Erreur création réparation:", error);
    const errorMsg = error.response?.data?.message || "Erreur lors de la déclaration de la panne.";
    alert(errorMsg);
  }
}

onMounted(loadData);
</script>

<style scoped>
.reparations-pf-page {
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

.table-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  font-family: 'Inter', sans-serif;
}

thead {
  background: linear-gradient(135deg, #0a5bc4 0%, #09315c 100%);
}

thead th {
  color: white;
  padding: 18px 16px;
  font-size: 12px;
  font-weight: 600;
  text-align: left;
  font-family: 'Inter', sans-serif;
  letter-spacing: 0.3px;
  text-transform: uppercase;
}

tbody td {
  padding: 18px 16px;
  border-bottom: 1px solid #f1f5f9;
  font-size: 14px;
  font-weight: 500;
  color: #475569;
  font-family: 'Inter', sans-serif;
}

tbody tr {
  transition: all 0.2s ease;
}

tbody tr:hover {
  background: #f8fafc;
  transform: scale(1.01);
}

.desc {
  max-width: 300px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #475569;
}

.date {
  font-size: 13px;
  color: #64748b;
  font-weight: 500;
}

.empty {
  text-align: center;
  padding: 40px;
  color: #94a3b8;
  font-size: 15px;
  font-weight: 500;
  font-family: 'Inter', sans-serif;
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
  color: #1e40af;
}

.status-done {
  background: #d1fae5;
  color: #065f46;
}

.status-cancel {
  background: #fee2e2;
  color: #991b1b;
}

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
  max-width: 520px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  font-family: 'Inter', 'Segoe UI', 'Roboto', -apple-system, BlinkMacSystemFont, sans-serif;
}

.modal h3 {
  margin: 0 0 24px 0;
  color: #1a202c;
  font-size: 24px;
  font-weight: 700;
  font-family: 'Inter', sans-serif;
  letter-spacing: -0.3px;
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
  border-color: #0a5bc4;
  box-shadow: 0 0 0 3px rgba(10, 91, 196, 0.1);
}

.form-group textarea {
  resize: vertical;
  min-height: 80px;
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
  background: linear-gradient(135deg, #0a5bc4 0%, #09315c 100%);
  color: white;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  font-family: 'Inter', sans-serif;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(10, 91, 196, 0.2);
}

.btn-confirm:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(10, 91, 196, 0.3);
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
  
  .table-card {
    overflow-x: auto;
  }
  
  .table-card table {
    min-width: 700px;
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
}
</style>