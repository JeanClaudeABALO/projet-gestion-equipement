<template>
  <div class="pf-layout">
    <SidebarPointFocal />

    <main class="pf-content">
      <h1>Dashboard Point Focal</h1>
      <p class="subtitle">
        Département : <strong>{{ departementNom }}</strong>
      </p>

      <!-- STATISTIQUES -->
      <div class="stats-row">
        <StatCard title="Total équipements" :value="stats.total" />
        <StatCard title="Fonctionnels" :value="stats.fonctionnels" />
        <StatCard title="Non fonctionnels" :value="stats.nonFonctionnels" />
        <StatCard title="En réparation" :value="stats.enReparation" />
        <StatCard title="Manquants" :value="stats.manquants" />
      </div>

      <!-- TABLE ÉQUIPEMENTS -->
      <section class="section">
        <div class="section-header">
          <h3>Équipements du département</h3>
          <button class="btn-export">📥 Télécharger</button>
        </div>

        <table class="table">
          <thead>
            <tr>
              <th>Unité</th>
              <th>Type</th>
              <th>Quantité</th>
              <th>État</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="e in equipements" :key="e.id">
              <td>{{ e.unite || e.unite_nom }}</td>
              <td>{{ e.type || e.type_nom }}</td>
              <td>{{ e.quantite }}</td>
              <td>
                <span :class="['badge', getEtatClass(e.etat)]">
                  {{ getEtatLabel(e.etat) }}
                </span>
              </td>
              <td class="actions">
                <button 
                  class="action-btn repair" 
                  @click="declarerReparation(e)"
                  title="Déclarer réparation"
                >
                  🔧 Réparation
                </button>
                <button 
                  class="action-btn non-func" 
                  @click="marquerNonFonctionnel(e)"
                  title="Marquer non fonctionnel"
                >
                  ⚠ Non fonctionnel
                </button>
                <button 
                  class="action-btn missing" 
                  @click="marquerManquant(e)"
                  title="Marquer manquant"
                >
                  ❌ Manquant
                </button>
                <button 
                  class="action-btn update" 
                  @click="changerEtat(e)"
                  title="Changer l'état"
                >
                  🔄 Modifier
                </button>
              </td>
            </tr>

            <tr v-if="equipements.length === 0">
              <td colspan="5" class="empty">Aucun équipement trouvé</td>
            </tr>
          </tbody>
        </table>
      </section>
    </main>

    <!-- Modal changement d'état -->
    <div v-if="showEtatModal" class="modal-backdrop" @click.self="showEtatModal = false">
      <div class="modal">
        <h3>Modifier l'état de l'équipement</h3>
        <p><strong>{{ selectedEquipement?.type || selectedEquipement?.type_nom }}</strong></p>
        
        <div class="form-group">
          <label>Nouvel état *</label>
          <select v-model="newEtat" required>
            <option value="fonctionnel">Fonctionnel</option>
            <option value="non_fonctionnel">Non fonctionnel</option>
            <option value="reparation">En réparation</option>
            <option value="manquant">Manquant</option>
            <option value="vetuste">Vétuste</option>
          </select>
        </div>

        <div class="form-group">
          <label>Commentaire</label>
          <textarea v-model="commentaire" rows="3" placeholder="Commentaire..."></textarea>
        </div>

        <div class="modal-actions">
          <button class="btn-cancel" @click="showEtatModal = false">Annuler</button>
          <button class="btn-confirm" @click="confirmerChangementEtat">Confirmer</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import StatCard from "../components/StatCard.vue";
import SidebarPointFocal from "../components/SidebarPointFocal.vue";
import api from "../api/axios";
import equipementApi from "../api/equipement";

const departementNom = ref("");

const stats = ref({
  total: 0,
  fonctionnels: 0,
  nonFonctionnels: 0,
  enReparation: 0,
  manquants: 0
});

const equipements = ref([]);
const showEtatModal = ref(false);
const selectedEquipement = ref(null);
const newEtat = ref("");
const commentaire = ref("");

function getEtatClass(etat) {
  const classes = {
    fonctionnel: "fonctionnel",
    non_fonctionnel: "non-fonctionnel",
    reparation: "en-reparation",
    manquant: "manquant",
    vetuste: "vetuste"
  };
  return classes[etat] || "";
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

async function declarerReparation(e) {
  if (confirm(`Déclarer une réparation pour ${e.type || e.type_nom} ?`)) {
    try {
      const commentaire = prompt("Commentaire (optionnel):") || "";
      await equipementApi.declarerReparation(e.id, { commentaire });
      alert("Réparation déclarée avec succès !");
      await loadData();
    } catch (error) {
      console.error("Erreur:", error);
      alert(error.response?.data?.message || "Erreur lors de la déclaration de réparation.");
    }
  }
}

async function marquerNonFonctionnel(e) {
  if (confirm(`Marquer ${e.type || e.type_nom} comme non fonctionnel ?`)) {
    try {
      const commentaire = prompt("Commentaire (optionnel):") || "";
      await equipementApi.updateEtat(e.id, {
        etat: "non_fonctionnel",
        commentaire
      });
      alert("État mis à jour avec succès !");
      await loadData();
    } catch (error) {
      console.error("Erreur:", error);
      alert(error.response?.data?.message || "Erreur lors de la mise à jour.");
    }
  }
}

async function marquerManquant(e) {
  if (confirm(`Marquer ${e.type || e.type_nom} comme manquant ?`)) {
    try {
      const commentaire = prompt("Commentaire (optionnel):") || "";
      await equipementApi.marquerManquant(e.id, { commentaire });
      alert("Équipement marqué comme manquant !");
      await loadData();
    } catch (error) {
      console.error("Erreur:", error);
      alert(error.response?.data?.message || "Erreur lors de la mise à jour.");
    }
  }
}

function changerEtat(e) {
  selectedEquipement.value = e;
  newEtat.value = e.etat;
  commentaire.value = "";
  showEtatModal.value = true;
}

async function confirmerChangementEtat() {
  if (!selectedEquipement.value || !newEtat.value) return;

  try {
    await equipementApi.updateEtat(selectedEquipement.value.id, {
      etat: newEtat.value,
      commentaire: commentaire.value || null
    });
    alert("État mis à jour avec succès !");
    showEtatModal.value = false;
    await loadData();
  } catch (error) {
    console.error("Erreur:", error);
    alert(error.response?.data?.message || "Erreur lors de la mise à jour.");
  }
}

async function loadData() {
  try {
    const res = await api.get("/dashboard/point-focal");
    
    if (res?.data) {
      stats.value = {
        total: res.data.stats?.total || 0,
        fonctionnels: res.data.stats?.fonctionnels || 0,
        nonFonctionnels: res.data.stats?.nonFonctionnels || 0,
        enReparation: res.data.stats?.enReparation || 0,
        manquants: res.data.stats?.manquants || 0
      };
      
      equipements.value = res.data.equipements || [];
      departementNom.value = res.data.departement || "Non défini";
    }
  } catch (error) {
    console.error("Erreur lors du chargement du dashboard:", error);
    if (error.response?.status === 403) {
      alert("Accès refusé. Vous n'avez pas les droits pour accéder à cette page.");
    }
  }
}

onMounted(loadData);
</script>

<style scoped>
.pf-layout {
  display: flex;
}

.pf-content {
  margin-left: 240px;
  padding: 30px;
  width: 100%;
  background: #f6f7fb;
  min-height: 100vh;
}

.subtitle {
  color: #555;
  margin-bottom: 20px;
}

.stats-row {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 30px;
}

.section {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.btn-export {
  background: #0a5bc4;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 5px;
  cursor: pointer;
}

.table {
  width: 100%;
  border-collapse: collapse;
}

.table th,
.table td {
  border: 1px solid #eee;
  padding: 8px;
}

.actions {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.action-btn {
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
  transition: all 0.2s;
  white-space: nowrap;
}

.action-btn.repair {
  background: #fef3c7;
  color: #92400e;
}

.action-btn.repair:hover {
  background: #fde68a;
}

.action-btn.non-func {
  background: #fee2e2;
  color: #991b1b;
}

.action-btn.non-func:hover {
  background: #fecaca;
}

.action-btn.missing {
  background: #e5e7eb;
  color: #374151;
}

.action-btn.missing:hover {
  background: #d1d5db;
}

.action-btn.update {
  background: #dbeafe;
  color: #1e40af;
}

.action-btn.update:hover {
  background: #bfdbfe;
}

.badge {
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
}

.badge.fonctionnel {
  background: #d1fae5;
  color: #065f46;
}

.badge.non-fonctionnel {
  background: #fee2e2;
  color: #991b1b;
}

.badge.en-reparation {
  background: #fef3c7;
  color: #92400e;
}

.badge.manquant {
  background: #e5e7eb;
  color: #374151;
}

.badge.vetuste {
  background: #dbeafe;
  color: #1e40af;
}

.empty {
  text-align: center;
  padding: 30px;
  color: #999;
}

/* Modal */
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
  max-width: 500px;
  box-shadow: 0 20px 40px rgba(0,0,0,.15);
}

.modal h3 {
  margin: 0 0 12px 0;
  color: #1a202c;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-weight: 600;
  color: #2d3748;
}

.form-group select,
.form-group textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  box-sizing: border-box;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 20px;
}

.btn-cancel {
  padding: 8px 16px;
  background: #f7fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
}

.btn-confirm {
  padding: 8px 16px;
  background: #0a5bc4;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}
</style>
