<template>
  <div class="pf-layout">
    <SidebarPointFocal />

    <main class="pf-content" :class="{ 'sidebar-hidden': !sidebarOpen }">
      <div class="page-header">
        <div>
          <h1>Dashboard</h1>
          <p class="subtitle">
            <strong>{{ departementNom }}</strong>
          </p>
        </div>
      </div>

      <!-- STATISTIQUES -->
      <div class="stats-row">
        <StatCard 
          title="Total équipements" 
          :value="stats.total" 
          :clickable="true"
          @click="openStatsModal('Total équipements', null)"
        />
        <StatCard 
          title="Fonctionnels" 
          :value="stats.fonctionnels" 
          :clickable="true"
          @click="openStatsModal('Fonctionnels', 'fonctionnel')"
        />
        <StatCard 
          title="Non fonctionnels" 
          :value="stats.nonFonctionnels" 
          :clickable="true"
          @click="openStatsModal('Non fonctionnels', 'non_fonctionnel')"
        />
        <StatCard 
          title="En réparation" 
          :value="stats.enReparation" 
          :clickable="true"
          @click="openStatsModal('En réparation', 'reparation')"
        />
        <StatCard 
          title="Manquants" 
          :value="stats.manquants" 
          :clickable="true"
          @click="openStatsModal('Manquants', 'manquant')"
        />
      </div>

      <!-- MODAL STATISTIQUES PAR TYPE -->
      <StatsByTypeModal
        v-if="showStatsModal"
        :title="statsModalTitle"
        :type="statsModalType"
        :is-point-focal="true"
        @close="closeStatsModal"
      />

      <!-- CARDS UNITÉS -->
      <section class="section unites-section">
        <div class="section-header">
          <h3>Unités du département</h3>
        </div>
        <div v-if="loadingData && unites.length === 0" class="loading-unites">
          <div class="loading-spinner"></div>
          <p>Chargement des unités...</p>
        </div>
        <div v-else-if="unites.length === 0" class="empty-unites">
          <p>Aucune unité enregistrée dans ce département</p>
        </div>
        <div v-else class="unites-carousel">
          <button 
            class="carousel-chevron chevron-left" 
            @click="scrollUnites(-1)"
            :disabled="unites.length <= 1"
            aria-label="Défiler à gauche"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>

          <div class="unites-scroll" ref="unitesScrollRef">
            <div class="unites-track">
              <div 
                v-for="unite in unites" 
                :key="unite.id" 
                class="unite-card"
                @click="openUniteDetails(unite)"
              >
                <div class="unite-card-header">
                  <span class="unite-badge">{{ unite.reference || "Unité" }}</span>
                  <h4 class="unite-name">{{ unite.nom }}</h4>
                </div>
                <div class="unite-card-body">
                  <div class="stat-pills">
                    <span class="pill">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                      </svg>
                      {{ unite.total_equipements || 0 }} équipements
                    </span>
                  </div>
                  <div class="stat-rows">
                    <div class="stat-row">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="stat-icon">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                      </svg>
                      <span>Fonctionnels : <strong>{{ unite.fonctionnels || 0 }}</strong></span>
                    </div>
                    <div class="stat-row">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="stat-icon">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                      </svg>
                      <span>Non fonctionnels : <strong>{{ unite.non_fonctionnels || 0 }}</strong></span>
                    </div>
                    <div class="stat-row">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="stat-icon">
                        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
                      </svg>
                      <span>En réparation : <strong>{{ unite.en_reparation || 0 }}</strong></span>
                    </div>
                  </div>
                </div>
                <button class="unite-card-footer" @click="openUniteDetails(unite)">
                  Voir le détail →
                </button>
              </div>
              <div class="carousel-end-spacer" aria-hidden="true"></div>
            </div>
          </div>

          <button 
            class="carousel-chevron chevron-right" 
            @click="scrollUnites(1)"
            :disabled="unites.length <= 1"
            aria-label="Défiler à droite"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
        </div>
      </section>

      <!-- TABLE ÉQUIPEMENTS -->
      <section class="section">
        <div class="section-header">
          <h3>Équipements du département</h3>
          <button class="btn-export" @click="exportEquipements" :disabled="equipements.length === 0">
            📥 Télécharger CSV
          </button>
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

            <tr v-if="loadingData">
              <td colspan="5" class="loading-row">
                <div class="loading-spinner"></div>
                <span>Chargement des équipements...</span>
              </td>
            </tr>
            <tr v-else-if="equipements.length === 0">
              <td colspan="5" class="empty">Aucun équipement trouvé</td>
            </tr>
          </tbody>
        </table>
      </section>
    </main>

    <!-- Modal confirmation action rapide -->
    <div v-if="showActionModal" class="modal-backdrop" @click.self="closeActionModal">
      <div class="modal">
        <div class="modal-header">
          <h3>{{ actionModalTitle }}</h3>
        </div>
        <div class="modal-body">
          <p style="margin-bottom: 16px; color: #475569;">{{ actionModalMessage }}</p>
          
          <div class="form-group" v-if="actionModalType === 'reparation' || actionModalType === 'non-fonctionnel' || actionModalType === 'manquant'">
            <label>Commentaire (optionnel)</label>
            <textarea v-model="actionCommentaire" rows="3" placeholder="Ajouter un commentaire..."></textarea>
          </div>
        </div>

        <div class="modal-actions">
          <button class="btn-cancel" @click="closeActionModal">Annuler</button>
          <button class="btn-confirm" @click="confirmerActionRapide">Confirmer</button>
        </div>
      </div>
    </div>

    <!-- Toast notification -->
    <div v-if="showToast" :class="['toast', toastType]">
      <span class="toast-icon">{{ toastIcon }}</span>
      <span class="toast-message">{{ toastMessage }}</span>
      <button class="toast-close" @click="showToast = false">×</button>
    </div>

    <!-- Modal changement d'état -->
    <div v-if="showEtatModal" class="modal-backdrop" @click.self="showEtatModal = false">
      <div class="modal">
        <div class="modal-header">
          <h3>Modifier l'état de l'équipement</h3>
        </div>
        <div class="modal-body">
          <p style="margin-bottom: 16px; color: #475569;"><strong>{{ selectedEquipement?.type || selectedEquipement?.type_nom }}</strong></p>
          
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
        </div>

        <div class="modal-actions">
          <button class="btn-cancel" @click="showEtatModal = false">Annuler</button>
          <button class="btn-confirm" @click="confirmerChangementEtat">Confirmer</button>
        </div>
      </div>
    </div>

    <!-- Modal détails unité -->
    <div v-if="showUniteModal" class="modal-backdrop" @click.self="closeUniteModal">
      <div class="modal modal-extra-large">
        <div class="modal-header">
          <h3>
            <span class="modal-icon">🏢</span>
            {{ selectedUnite?.nom }}
          </h3>
          <button class="close-btn" @click="closeUniteModal">×</button>
        </div>
        
        <div v-if="selectedUnite" class="unite-info">
          <p class="unite-type-label">{{ selectedUnite.reference || "Unité" }}</p>
          <p v-if="selectedUnite.adresse" class="unite-address">📍 {{ selectedUnite.adresse }}</p>
          <p v-if="selectedUnite.contact" class="unite-contact">📞 {{ selectedUnite.contact }}</p>
        </div>

        <div class="unite-stats-summary">
          <div class="summary-item">
            <span class="summary-label">Total équipements</span>
            <span class="summary-value">{{ selectedUnite?.total_equipements || 0 }}</span>
          </div>
          <div class="summary-item success">
            <span class="summary-label">Fonctionnels</span>
            <span class="summary-value">{{ selectedUnite?.fonctionnels || 0 }}</span>
          </div>
          <div class="summary-item warning">
            <span class="summary-label">Non fonctionnels</span>
            <span class="summary-value">{{ selectedUnite?.non_fonctionnels || 0 }}</span>
          </div>
        </div>

        <div class="modal-body">
          <div v-if="loadingEquipements" class="loading">
            <p>Chargement des équipements...</p>
          </div>

          <div v-else-if="uniteEquipements.length === 0" class="empty-equipements">
            <p>Aucun équipement enregistré dans cette unité</p>
          </div>

          <div v-else class="unite-equipements">
            <h5 class="equipements-title">Détails par type d'équipement</h5>
            <div class="equipements-list">
              <div 
                v-for="eq in uniteEquipements" 
                :key="eq.type_id"
                class="equipement-type-card"
              >
                <div class="type-header">
                  <h6 class="type-name">{{ eq.type_nom }}</h6>
                  <span class="type-total">{{ eq.total }} au total</span>
                </div>
                <div class="type-etats">
                  <div class="type-etat-item fonctionnel">
                    <span class="type-etat-label">Fonctionnels</span>
                    <span class="type-etat-value">{{ eq.fonctionnels || 0 }}</span>
                  </div>
                  <div class="type-etat-item non-fonctionnel">
                    <span class="type-etat-label">Non fonctionnels</span>
                    <span class="type-etat-value">{{ eq.non_fonctionnels || 0 }}</span>
                  </div>
                  <div class="type-etat-item reparation">
                    <span class="type-etat-label">En réparation</span>
                    <span class="type-etat-value">{{ eq.en_reparation || 0 }}</span>
                  </div>
                  <div class="type-etat-item manquant">
                    <span class="type-etat-label">Manquants</span>
                    <span class="type-etat-value">{{ eq.manquants || 0 }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-actions">
          <button class="btn-cancel" @click="closeUniteModal">Fermer</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onActivated, inject } from "vue";
import { useRoute } from "vue-router";
import StatCard from "../components/StatCard.vue";
import StatsByTypeModal from "../components/StatsByTypeModal.vue";
import SidebarPointFocal from "../components/SidebarPointFocal.vue";
import api from "../api/axios";
import equipementApi from "../api/equipement";

// Injecter l'état de la sidebar
const sidebarOpen = inject('sidebarOpen', ref(true));

const departementNom = ref("");

const stats = ref({
  total: 0,
  fonctionnels: 0,
  nonFonctionnels: 0,
  enReparation: 0,
  manquants: 0
});

const equipements = ref([]);
const unites = ref([]);
const loadingData = ref(false);
const showEtatModal = ref(false);
const selectedEquipement = ref(null);
const newEtat = ref("");
const commentaire = ref("");
const showUniteModal = ref(false);
const selectedUnite = ref(null);
const uniteEquipements = ref([]);
const loadingEquipements = ref(false);
const unitesScrollRef = ref(null);

function scrollUnites(direction) {
  const el = unitesScrollRef.value;
  if (!el) return;
  el.scrollBy({ left: direction * 320, behavior: "smooth" });
}

// Modal action rapide
const showActionModal = ref(false);
const actionModalType = ref("");
const actionModalTitle = ref("");
const actionModalMessage = ref("");
const actionCommentaire = ref("");
const pendingEquipement = ref(null);

// Toast notification
const showToast = ref(false);
const toastMessage = ref("");
const toastType = ref("success");
const toastIcon = ref("✓");

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

function declarerReparation(e) {
  pendingEquipement.value = e;
  actionModalType.value = "reparation";
  actionModalTitle.value = "Déclarer une réparation";
  actionModalMessage.value = `Voulez-vous déclarer une réparation pour l'équipement "${e.type || e.type_nom}" ?`;
  actionCommentaire.value = "";
  showActionModal.value = true;
}

function marquerNonFonctionnel(e) {
  pendingEquipement.value = e;
  actionModalType.value = "non-fonctionnel";
  actionModalTitle.value = "Marquer comme non fonctionnel";
  actionModalMessage.value = `Voulez-vous marquer l'équipement "${e.type || e.type_nom}" comme non fonctionnel ?`;
  actionCommentaire.value = "";
  showActionModal.value = true;
}

function marquerManquant(e) {
  pendingEquipement.value = e;
  actionModalType.value = "manquant";
  actionModalTitle.value = "Marquer comme manquant";
  actionModalMessage.value = `Voulez-vous marquer l'équipement "${e.type || e.type_nom}" comme manquant ?`;
  actionCommentaire.value = "";
  showActionModal.value = true;
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
    showToastMessage("État mis à jour avec succès !", "success");
    showEtatModal.value = false;
    await loadData();
  } catch (error) {
    console.error("Erreur:", error);
    const errorMsg = error.response?.data?.message || "Erreur lors de la mise à jour de l'état.";
    showToastMessage(errorMsg, "error");
  }
}

async function confirmerActionRapide() {
  if (!pendingEquipement.value) return;

  try {
    if (actionModalType.value === "reparation") {
      await equipementApi.declarerReparation(pendingEquipement.value.id, {
        commentaire: actionCommentaire.value || ""
      });
      showToastMessage("Réparation déclarée avec succès !", "success");
    } else if (actionModalType.value === "non-fonctionnel") {
      await equipementApi.updateEtat(pendingEquipement.value.id, {
        etat: "non_fonctionnel",
        commentaire: actionCommentaire.value || ""
      });
      showToastMessage("Équipement marqué comme non fonctionnel !", "success");
    } else if (actionModalType.value === "manquant") {
      await equipementApi.marquerManquant(pendingEquipement.value.id, {
        commentaire: actionCommentaire.value || ""
      });
      showToastMessage("Équipement marqué comme manquant !", "success");
    }
    
    closeActionModal();
    await loadData();
  } catch (error) {
    console.error("Erreur:", error);
    const errorMsg = error.response?.data?.message || "Erreur lors de l'opération.";
    showToastMessage(errorMsg, "error");
  }
}

function closeActionModal() {
  showActionModal.value = false;
  pendingEquipement.value = null;
  actionCommentaire.value = "";
  actionModalType.value = "";
}

const showStatsModal = ref(false);
const statsModalTitle = ref("");
const statsModalType = ref(null);

function openStatsModal(title, type) {
  statsModalTitle.value = title;
  statsModalType.value = type;
  showStatsModal.value = true;
}

function closeStatsModal() {
  showStatsModal.value = false;
  statsModalTitle.value = "";
  statsModalType.value = null;
}

function showToastMessage(message, type = "success") {
  toastMessage.value = message;
  toastType.value = type;
  toastIcon.value = type === "success" ? "✓" : "✕";
  showToast.value = true;
  
  // Auto-hide après 3 secondes
  setTimeout(() => {
    showToast.value = false;
  }, 3000);
}

async function loadData() {
  loadingData.value = true;
  try {
    // Charger les données principales du dashboard
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
    } else {
      console.warn("Réponse API vide ou invalide:", res);
      showToastMessage("Réponse du serveur invalide. Veuillez réessayer.", "error");
    }

    const showStatsModal = ref(false);
  const statsModalTitle = ref("");
  const statsModalType = ref(null);

  function openStatsModal(title, type) {
    statsModalTitle.value = title;
    statsModalType.value = type;
    showStatsModal.value = true;
  }

  function closeStatsModal() {
    showStatsModal.value = false;
    statsModalTitle.value = "";
    statsModalType.value = null;
  }

  // Charger les unités avec leurs statistiques (séparément pour ne pas bloquer)
    try {
      await loadUnites();
    } catch (uniteError) {
      console.error("Erreur lors du chargement des unités (non bloquant):", uniteError);
      // On continue même si le chargement des unités échoue
      unites.value = [];
    }
  } catch (error) {
    console.error("Erreur détaillée lors du chargement du dashboard:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      statusText: error.response?.statusText,
      config: error.config
    });
    
    if (error.response?.status === 403) {
      showToastMessage("Accès refusé. Vous n'avez pas les droits pour accéder à cette page.", "error");
    } else if (error.response?.status === 401) {
      showToastMessage("Session expirée. Veuillez vous reconnecter.", "error");
    } else if (error.response?.status === 404) {
      showToastMessage("Endpoint non trouvé. Vérifiez la configuration du serveur.", "error");
    } else if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      showToastMessage("Timeout de connexion. Vérifiez votre connexion internet.", "error");
    } else if (error.response?.status === 500) {
      // Erreur serveur - afficher le message d'erreur du serveur si disponible
      const serverError = error.response?.data?.error || error.response?.data?.message || "Erreur serveur";
      showToastMessage(`Erreur serveur: ${serverError}`, "error");
    } else if (error.response?.data?.message) {
      showToastMessage(error.response.data.message, "error");
    } else if (error.message) {
      showToastMessage(`Erreur: ${error.message}`, "error");
    } else {
      showToastMessage("Erreur lors du chargement des données. Veuillez réessayer.", "error");
    }
  } finally {
    loadingData.value = false;
  }
}

async function loadUnites() {
  try {
    const res = await api.get("/dashboard/point-focal/unites");
    unites.value = res.data || [];
  } catch (error) {
    console.error("Erreur lors du chargement des unités:", error);
    unites.value = [];
  }
}

async function openUniteDetails(unite) {
  selectedUnite.value = unite;
  showUniteModal.value = true;
  loadingEquipements.value = true;
  uniteEquipements.value = [];

  try {
    const res = await api.get(`/dashboard/point-focal/unites/${unite.id}/equipements-grouped`);
    uniteEquipements.value = res.data || [];
  } catch (error) {
    console.error("Erreur lors du chargement des équipements de l'unité:", error);
    showToastMessage("Erreur lors du chargement des équipements.", "error");
    uniteEquipements.value = [];
  } finally {
    loadingEquipements.value = false;
  }
}

function closeUniteModal() {
  showUniteModal.value = false;
  selectedUnite.value = null;
  uniteEquipements.value = [];
}

function exportEquipements() {
  if (equipements.value.length === 0) {
    showToastMessage("Aucun équipement à exporter.", "error");
    return;
  }

  try {
    // Créer le contenu CSV
    const headers = ["ID", "Unité", "Type", "Quantité", "État", "Commentaire", "Date MAJ"];
    const rows = equipements.value.map(e => [
      e.id || "",
      e.unite || e.unite_nom || "",
      e.type || e.type_nom || "",
      e.quantite || "",
      getEtatLabel(e.etat) || "",
      (e.commentaire || "").replace(/"/g, '""'), // Échapper les guillemets
      e.date_maj || ""
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");

    // Créer le blob et télécharger
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" }); // BOM pour Excel
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    
    link.setAttribute("href", url);
    link.setAttribute("download", `equipements_${departementNom.value}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showToastMessage("Export réussi ! Le fichier CSV a été téléchargé.", "success");
  } catch (error) {
    console.error("Erreur lors de l'export:", error);
    showToastMessage("Erreur lors de l'export des données.", "error");
  }
}

const route = useRoute();

onMounted(loadData);

// Recharger les données quand on revient sur cette page
onActivated(() => {
  loadData();
});
</script>

<style scoped>
.pf-layout {
  display: flex;
}

.pf-content {
  margin-left: 220px;
  padding: 40px;
  width: calc(100% - 220px);
  background: linear-gradient(135deg, #f6f7fb 0%, #eef2f7 100%);
  min-height: 100vh;
  font-family: 'Inter', 'Segoe UI', 'Roboto', -apple-system, BlinkMacSystemFont, sans-serif;
  transition: margin-left 0.3s ease, width 0.3s ease;
}

.pf-content.sidebar-hidden {
  margin-left: 0;
  width: 100%;
}

.page-header {
  margin-bottom: 32px;
}

.page-header h1 {
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

.subtitle strong {
  color: #1a6fd4;
  font-weight: 600;
}

.stats-row {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 30px;
}

.section {
  background: #fff;
  padding: 28px;
  border-radius: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-header h3 {
  font-size: 22px;
  font-weight: 700;
  color: #1a202c;
  margin: 0;
  font-family: 'Inter', sans-serif;
  letter-spacing: -0.3px;
}

.btn-export {
  background: linear-gradient(135deg, #1a6fd4 0%, #0f4a7a 100%);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  font-family: 'Inter', sans-serif;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(26, 111, 212, 0.2);
}

.btn-export:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(26, 111, 212, 0.3);
}

.table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  font-family: 'Inter', sans-serif;
}

.table th {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  color: #334155;
  font-weight: 600;
  font-size: 14px;
  padding: 16px 14px;
  text-align: left;
  border-bottom: 2px solid #e2e8f0;
  letter-spacing: 0.3px;
  font-family: 'Inter', sans-serif;
}

.table td {
  padding: 16px 14px;
  border-bottom: 1px solid #f1f5f9;
  color: #475569;
  font-size: 14px;
  font-weight: 500;
}

.table tbody tr {
  transition: all 0.2s ease;
}

.table tbody tr:hover {
  background: #f8fafc;
  transform: scale(1.01);
}

.actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-start;
}

.action-btn {
  padding: 10px 18px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  font-family: 'Inter', sans-serif;
  transition: all 0.3s ease;
  white-space: nowrap;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  letter-spacing: 0.3px;
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.action-btn:active {
  transform: translateY(0);
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
  padding: 6px 14px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  font-family: 'Inter', sans-serif;
  display: inline-block;
  letter-spacing: 0.2px;
  text-transform: capitalize;
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
  padding: 40px;
  color: #94a3b8;
  font-size: 15px;
  font-weight: 500;
  font-family: 'Inter', sans-serif;
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
  padding: 20px;
  box-sizing: border-box;
  overflow-y: auto;
}

.modal {
  background: white;
  padding: 0;
  border-radius: 16px;
  width: 100%;
  max-width: 500px;
  max-height: calc(100vh - 40px);
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 40px rgba(0,0,0,.15);
  font-family: 'Inter', sans-serif;
  overflow: hidden;
}

.modal h3 {
  margin: 0;
  color: #1a202c;
  font-size: 22px;
  font-weight: 700;
  font-family: 'Inter', sans-serif;
  letter-spacing: -0.3px;
  flex: 1;
  min-width: 0;
  word-wrap: break-word;
}

.modal-body {
  padding: 20px;
  overflow-y: auto;
  flex: 1;
  min-height: 0;
  box-sizing: border-box;
}

.modal-body p {
  margin: 0 0 16px 0;
}

.form-group {
  margin-bottom: 16px;
  box-sizing: border-box;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #2d3748;
  font-size: 14px;
  font-family: 'Inter', sans-serif;
}

.form-group select,
.form-group textarea {
  width: 100%;
  padding: 12px 14px;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
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

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 20px;
  padding: 20px 32px;
  border-top: 1px solid #e2e8f0;
  background: white;
  flex-shrink: 0;
  box-sizing: border-box;
}

.modal > .modal-actions {
  margin-top: 0;
}

.btn-cancel {
  padding: 12px 24px;
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

.btn-cancel:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
}

.btn-confirm {
  padding: 12px 24px;
  background: linear-gradient(135deg, #1a6fd4 0%, #0f4a7a 100%);
  color: white;
  border: none;
  border-radius: 10px;
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

/* Section Unités - Carrousel style large cards + chevrons */
.unites-section {
  margin-bottom: 30px;
  overflow: visible;
}

.unites-carousel {
  display: flex;
  align-items: stretch;
  gap: 12px;
  width: 100%;
  min-height: 440px;
}

.unites-carousel .carousel-chevron {
  flex-shrink: 0;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 2px solid #e2e8f0;
  background: white;
  color: #64748b;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  align-self: center;
}

.unites-carousel .chevron-left {
  order: 1;
}

.unites-carousel .chevron-right {
  order: 3;
}

.unites-carousel .carousel-chevron:hover:not(:disabled) {
  background: #1a6fd4;
  color: white;
  border-color: #1a6fd4;
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(26, 111, 212, 0.3);
}

.unites-carousel .carousel-chevron:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.unites-carousel .carousel-chevron svg {
  width: 22px;
  height: 22px;
}

.unites-scroll {
  order: 2;
  flex: 1;
  min-width: 0;
  overflow-x: auto;
  overflow-y: hidden;
  scroll-behavior: smooth;
  scrollbar-width: thin;
  padding: 16px 0;
  align-self: stretch;
}

.unites-scroll::-webkit-scrollbar {
  height: 8px;
}

.unites-scroll::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 4px;
}

.unites-scroll::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}

.unites-track {
  display: flex;
  gap: 20px;
  padding: 0 8px;
  min-width: min-content;
  align-items: stretch;
}

.unites-carousel .carousel-end-spacer {
  flex: 0 0 24px;
  min-width: 24px;
  height: 1px;
  pointer-events: none;
}

.unites-carousel .unite-card {
  flex: 0 0 300px;
  min-width: 300px;
  min-height: 420px;
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  border: 1px solid rgba(0, 0, 0, 0.06);
  cursor: pointer;
}

.unites-carousel .unite-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15);
}

.unites-carousel .unite-card-header {
  background: linear-gradient(135deg, #1a6fd4 0%, #0f4a7a 100%);
  color: white;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex-shrink: 0;
}

.unites-carousel .unite-badge {
  align-self: flex-start;
  background: rgba(255, 255, 255, 0.25);
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  font-family: 'Inter', sans-serif;
}

.unites-carousel .unite-name {
  font-size: 18px;
  font-weight: 700;
  margin: 0;
  font-family: 'Inter', sans-serif;
  line-height: 1.35;
  letter-spacing: -0.3px;
}

.unites-carousel .unite-card-body {
  padding: 20px;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 18px;
  min-height: 0;
}

.unites-carousel .stat-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.unites-carousel .pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #e0f2fe;
  color: #0369a1;
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 600;
  font-family: 'Inter', sans-serif;
}

.unites-carousel .pill svg {
  flex-shrink: 0;
  opacity: 0.9;
}

.unites-carousel .stat-rows {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.unites-carousel .stat-row {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  color: #475569;
  font-family: 'Inter', sans-serif;
}

.unites-carousel .stat-row .stat-icon {
  flex-shrink: 0;
  width: 18px;
  height: 18px;
  color: #1a6fd4;
}

.unites-carousel .stat-row strong {
  color: #1a202c;
  font-weight: 600;
}

.unites-carousel .unite-card-footer {
  padding: 14px 16px;
  background: linear-gradient(135deg, #1a6fd4 0%, #0f4a7a 100%);
  color: white;
  border: none;
  font-size: 14px;
  font-weight: 600;
  font-family: 'Inter', sans-serif;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
  flex-shrink: 0;
}

.unites-carousel .unite-card-footer:hover {
  background: linear-gradient(135deg, #0f4a7a 0%, #062a4a 100%);
  transform: translateY(-1px);
}

.empty-unites {
  text-align: center;
  padding: 40px;
  color: #94a3b8;
  font-size: 15px;
  font-weight: 500;
  font-family: 'Inter', sans-serif;
}

.loading-unites {
  text-align: center;
  padding: 60px 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.loading-unites .loading-spinner {
  margin: 0;
}

.loading-unites p {
  color: #64748b;
  font-size: 15px;
  font-weight: 500;
  font-family: 'Inter', sans-serif;
  margin: 0;
}

/* Modal détails unité */
.modal-large {
  max-width: 850px;
  max-height: calc(90vh - 40px);
}

.modal-extra-large {
  max-width: 950px;
  max-height: calc(90vh - 40px);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0;
  padding: 20px;
  border-bottom: 2px solid #e2e8f0;
  background: white;
  flex-shrink: 0;
  box-sizing: border-box;
  gap: 12px;
}

.modal-header h3 {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: #1a202c;
  font-family: 'Inter', sans-serif;
  flex: 1;
  min-width: 0;
  word-wrap: break-word;
}

.modal-icon {
  font-size: 20px;
  flex-shrink: 0;
}

.close-btn {
  background: none;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  font-size: 32px;
  cursor: pointer;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  font-family: 'Inter', sans-serif;
  flex-shrink: 0;
  padding: 0;
  box-sizing: border-box;
}

.close-btn:hover {
  background: #f1f5f9;
  color: #1a202c;
}

.unite-info {
  margin: 0;
  padding: 16px 20px;
  background: #f8fafc;
  border-radius: 0;
  box-sizing: border-box;
}

.unite-stats-summary {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin: 0;
  padding: 12px 20px;
  background: #f8fafc;
  border-radius: 0;
  box-sizing: border-box;
}

.summary-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px;
  background: white;
  border-radius: 8px;
  border-left: 3px solid #cbd5e1;
  box-sizing: border-box;
}

.summary-item.success {
  border-left-color: #10b981;
}

.summary-item.warning {
  border-left-color: #f59e0b;
}

.summary-label {
  font-size: 11px;
  color: #64748b;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
  font-family: 'Inter', sans-serif;
}

.summary-value {
  font-size: 20px;
  font-weight: 700;
  color: #1a202c;
  font-family: 'Inter', sans-serif;
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
  box-sizing: border-box;
}

.equipements-title {
  font-size: 15px;
  font-weight: 600;
  color: #1a202c;
  margin: 0 0 12px 0;
  padding: 0 20px;
  font-family: 'Inter', sans-serif;
  box-sizing: border-box;
}

.equipements-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 0 20px 20px 20px;
  box-sizing: border-box;
}

.equipement-type-card {
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  padding: 14px;
  transition: all 0.3s ease;
  box-sizing: border-box;
  width: 100%;
  overflow: hidden;
}

.equipement-type-card:hover {
  border-color: #1a6fd4;
  box-shadow: 0 2px 8px rgba(26, 111, 212, 0.1);
}

.type-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  padding-bottom: 10px;
  border-bottom: 1px solid #e2e8f0;
  gap: 10px;
  flex-wrap: wrap;
  box-sizing: border-box;
}

.type-name {
  font-size: 15px;
  font-weight: 700;
  color: #1a202c;
  margin: 0;
  font-family: 'Inter', sans-serif;
  flex: 1;
  min-width: 0;
  word-wrap: break-word;
}

.type-total {
  font-size: 13px;
  color: #64748b;
  font-weight: 600;
  font-family: 'Inter', sans-serif;
  white-space: nowrap;
  flex-shrink: 0;
}

.type-etats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 6px;
}

.type-etat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 10px;
  border-radius: 6px;
  border-left: 3px solid #cbd5e1;
  box-sizing: border-box;
}

.type-etat-item.fonctionnel {
  border-left-color: #10b981;
  background: #f0fdf4;
}

.type-etat-item.non-fonctionnel {
  border-left-color: #ef4444;
  background: #fef2f2;
}

.type-etat-item.reparation {
  border-left-color: #f59e0b;
  background: #fffbeb;
}

.type-etat-item.manquant {
  border-left-color: #6b7280;
  background: #f9fafb;
}

.type-etat-label {
  font-size: 12px;
  color: #475569;
  font-weight: 600;
  font-family: 'Inter', sans-serif;
}

.type-etat-value {
  font-size: 14px;
  font-weight: 700;
  color: #1a202c;
  font-family: 'Inter', sans-serif;
}

.unite-type-label {
  font-size: 14px;
  color: #64748b;
  margin: 0 0 8px 0;
  font-weight: 600;
  font-family: 'Inter', sans-serif;
}

.unite-address,
.unite-contact {
  font-size: 14px;
  color: #475569;
  margin: 4px 0;
  font-family: 'Inter', sans-serif;
}

.loading,
.empty-equipements {
  text-align: center;
  padding: 40px 24px;
  color: #94a3b8;
  font-size: 15px;
  font-weight: 500;
  font-family: 'Inter', sans-serif;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
}

.equipements-details h4 {
  font-size: 18px;
  font-weight: 700;
  color: #1a202c;
  margin: 0 0 16px 0;
  font-family: 'Inter', sans-serif;
}

.equipements-table-wrapper {
  overflow-x: auto;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
}

.equipements-table {
  width: 100%;
  border-collapse: collapse;
  font-family: 'Inter', sans-serif;
}

.equipements-table th {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  color: #334155;
  font-weight: 600;
  font-size: 13px;
  padding: 14px 16px;
  text-align: left;
  border-bottom: 2px solid #e2e8f0;
  font-family: 'Inter', sans-serif;
}

.equipements-table td {
  padding: 14px 16px;
  border-bottom: 1px solid #f1f5f9;
  color: #475569;
  font-size: 14px;
  font-weight: 500;
  font-family: 'Inter', sans-serif;
}

.equipements-table tbody tr:hover {
  background: #f8fafc;
}

.type-cell {
  font-weight: 600;
  color: #1a202c;
}

.quantite-cell {
  font-weight: 700;
  color: #1a6fd4;
  font-size: 16px;
}

.comment-cell {
  color: #64748b;
  font-size: 13px;
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Loading spinner */
.loading-row {
  text-align: center;
  padding: 40px;
}

.loading-spinner {
  display: inline-block;
  width: 24px;
  height: 24px;
  border: 3px solid #e2e8f0;
  border-top-color: #1a6fd4;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-right: 12px;
  vertical-align: middle;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-row span {
  color: #64748b;
  font-size: 14px;
  font-weight: 500;
  font-family: 'Inter', sans-serif;
}

/* Toast notification */
.toast {
  position: fixed;
  bottom: 24px;
  right: 24px;
  background: white;
  padding: 16px 20px;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 300px;
  max-width: 500px;
  z-index: 10000;
  animation: slideInRight 0.3s ease-out;
  font-family: 'Inter', sans-serif;
  border-left: 4px solid;
}

.toast.success {
  border-left-color: #10b981;
}

.toast.error {
  border-left-color: #ef4444;
}

.toast-icon {
  font-size: 20px;
  font-weight: bold;
  flex-shrink: 0;
}

.toast.success .toast-icon {
  color: #10b981;
}

.toast.error .toast-icon {
  color: #ef4444;
}

.toast-message {
  flex: 1;
  font-size: 14px;
  font-weight: 500;
  color: #1a202c;
  line-height: 1.5;
}

.toast-close {
  background: none;
  border: none;
  font-size: 20px;
  color: #94a3b8;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.toast-close:hover {
  background: #f1f5f9;
  color: #64748b;
}

@keyframes slideInRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* Bouton export désactivé */
.btn-export:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
}

.btn-export:disabled:hover {
  box-shadow: 0 2px 4px rgba(26, 111, 212, 0.2) !important;
}

@media (max-width: 768px) {
  .unite-stats-summary {
    grid-template-columns: 1fr;
  }
  
  .type-etats {
    grid-template-columns: 1fr;
  }
  
  .modal {
    width: 95%;
    max-height: calc(100vh - 20px);
  }
  
  .modal-header {
    padding: 16px;
  }
  
  .modal-header h3 {
    font-size: 18px;
  }
  
  .unite-info,
  .unite-stats-summary {
    padding: 16px;
  }
  
  .equipements-title,
  .equipements-list {
    padding-left: 16px;
    padding-right: 16px;
  }
  
  .type-header {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
