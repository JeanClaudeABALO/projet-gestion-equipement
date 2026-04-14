<script setup>
import { onMounted, ref, computed, inject } from "vue";
import SidebarAdmin from "../components/SidebarAdmin.vue";
import StatCard from "../components/StatCard.vue";
import StatsByTypeModal from "../components/StatsByTypeModal.vue";
import RecentEquipments from "../components/dashboard/RecentEquipments.vue";
import RecentLogs from "../components/dashboard/RecentLogs.vue";
import api from "../api/axios";

// Injecter l'état de la sidebar
const sidebarOpen = inject('sidebarOpen', ref(true));

/* ====== STATE ====== */
const stats = ref({
  totalEquipements: 0,
  fonctionnels: 0,
  nonFonctionnels: 0,
  enReparation: 0,
  manquants: 0,
});

const recents = ref([]);
const logs = ref([]);
const departements = ref([]);
const loadingDepartements = ref(false);

// Modals pour les statistiques par département
const showEquipementsModal = ref(false);
const showUnitesModal = ref(false);
const selectedDepartement = ref(null);
const departementEquipements = ref([]);
const departementUnites = ref([]);
const loadingEquipements = ref(false);
const loadingUnites = ref(false);
const selectedEquipementType = ref(null);
const departementsScrollRef = ref(null);

function scrollDepartements(direction) {
  const el = departementsScrollRef.value;
  if (!el) return;
  const scrollAmount = 320;
  el.scrollBy({ left: direction * scrollAmount, behavior: "smooth" });
}

/* ====== HELPERS ====== */
function formatDate(d) {
  if (!d) return "";
  return new Date(d).toLocaleString();
}

/* ====== DATA LOADING ====== */
async function loadData() {
  try {
    const res = await api.get("/dashboard/admin").catch(() => null);

    if (res?.data) {
      stats.value.totalEquipements = res.data.totalEquipements ?? 0;
      stats.value.fonctionnels = res.data.fonctionnels ?? 0;
      stats.value.nonFonctionnels = res.data.nonFonctionnels ?? 0;
      stats.value.enReparation = res.data.enReparation ?? 0;
      stats.value.manquants = res.data.manquants ?? 0;

      recents.value = res.data.recents ?? [];
      logs.value = res.data.logs ?? [];
    }
  } catch (err) {
    console.error("Erreur dashboard admin :", err);
  }
}


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

async function loadDepartements() {
  loadingDepartements.value = true;
  try {
    const res = await api.get("/dashboard/departements");
    departements.value = res.data || [];
  } catch (err) {
    console.error("Erreur chargement départements :", err);
    departements.value = [];
  } finally {
    loadingDepartements.value = false;
  }
}

async function openEquipementsModal(dept) {
  selectedDepartement.value = dept;
  loadingEquipements.value = true;
  showEquipementsModal.value = true;
  selectedEquipementType.value = null;
  
  try {
    const res = await api.get(`/dashboard/departements/${dept.id}/equipements`);
    departementEquipements.value = res.data || [];
  } catch (err) {
    console.error("Erreur chargement équipements :", err);
    departementEquipements.value = [];
  } finally {
    loadingEquipements.value = false;
  }
}

function closeEquipementsModal() {
  showEquipementsModal.value = false;
  selectedDepartement.value = null;
  departementEquipements.value = [];
  selectedEquipementType.value = null;
}

function toggleEquipementDetails(equipement) {
  if (selectedEquipementType.value === equipement.type_id) {
    selectedEquipementType.value = null;
  } else {
    selectedEquipementType.value = equipement.type_id;
  }
}

async function openUnitesModal(dept) {
  selectedDepartement.value = dept;
  loadingUnites.value = true;
  showUnitesModal.value = true;
  
  try {
    const res = await api.get(`/dashboard/departements/${dept.id}/unites`);
    departementUnites.value = res.data || [];
    
    // Charger les équipements groupés pour chaque unité
    for (const unite of departementUnites.value) {
      try {
        const equipRes = await api.get(`/dashboard/unites/${unite.id}/equipements-grouped`);
        unite.equipements = equipRes.data || [];
      } catch (err) {
        console.error(`Erreur chargement équipements unité ${unite.id}:`, err);
        unite.equipements = [];
      }
    }
  } catch (err) {
    console.error("Erreur chargement unités :", err);
    departementUnites.value = [];
  } finally {
    loadingUnites.value = false;
  }
}

function closeUnitesModal() {
  showUnitesModal.value = false;
  selectedDepartement.value = null;
  departementUnites.value = [];
}

onMounted(() => {
  loadData();
  loadDepartements();
});
</script>

<template>
  <div class="admin-layout">
    <!-- SIDEBAR -->
    <SidebarAdmin />

    <!-- CONTENU PRINCIPAL -->
    <main class="admin-content" :class="{ 'sidebar-hidden': !sidebarOpen }">
      <h1 class="page-title">Tableau de bord Administrateur</h1>

      <!-- ZONE 1 : CARTES STATISTIQUES -->
      <section class="stats-section">
        <div class="stats-row">
          <StatCard 
            title="Total équipements" 
            :value="stats.totalEquipements" 
            type="default"
            :clickable="true"
            @click="openStatsModal('Total équipements', null)"
          />
          <StatCard 
            title="Fonctionnels" 
            :value="stats.fonctionnels" 
            type="fonctionnel"
            :clickable="true"
            @click="openStatsModal('Fonctionnels', 'fonctionnel')"
          />
          <StatCard 
            title="Non fonctionnels" 
            :value="stats.nonFonctionnels" 
            type="non_fonctionnel"
            :clickable="true"
            @click="openStatsModal('Non fonctionnels', 'non_fonctionnel')"
          />
          <StatCard 
            title="En réparation" 
            :value="stats.enReparation" 
            type="reparation"
            :clickable="true"
            @click="openStatsModal('En réparation', 'reparation')"
          />
          <StatCard 
            title="Manquants" 
            :value="stats.manquants" 
            type="manquant"
            :clickable="true"
            @click="openStatsModal('Manquants', 'manquant')"
          />
        </div>
      </section>

      <!-- MODAL STATISTIQUES PAR TYPE -->
      <StatsByTypeModal
        v-if="showStatsModal"
        :title="statsModalTitle"
        :type="statsModalType"
        :is-point-focal="false"
        @close="closeStatsModal"
      />

      <!-- ZONE 2 : STATISTIQUES PAR DÉPARTEMENT -->
      <section class="departements-section">
        <h2 class="section-title">Statistiques par Département</h2>
        
        <div v-if="loadingDepartements" class="loading">
          <p>Chargement des départements...</p>
        </div>

        <div v-else-if="departements.length === 0" class="empty">
          <p>Aucun département trouvé</p>
        </div>

        <div v-else class="departements-carousel">
          <button 
            class="carousel-chevron chevron-left" 
            @click="scrollDepartements(-1)"
            :disabled="departements.length <= 1"
            aria-label="Défiler à gauche"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>

          <div class="departements-scroll" ref="departementsScrollRef">
            <div class="departements-track">
              <div
                v-for="dept in departements"
                :key="dept.id"
                class="departement-card"
              >
                <div class="departement-card-header">
                  <span v-if="dept.code" class="departement-badge">{{ dept.code }}</span>
                  <h3 class="departement-name">{{ dept.nom }}</h3>
                </div>
                
                <div class="departement-card-body">
                  <div class="stat-pills">
                    <span class="pill">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                        <path d="M3 21h18"></path>
                        <path d="M5 21V7l8-4v18"></path>
                        <path d="M19 21V11l-6-4"></path>
                      </svg>
                      {{ dept.total_unites || 0 }} unités
                    </span>
                    <span class="pill">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                      </svg>
                      {{ dept.total_equipements || 0 }} équipements
                    </span>
                  </div>

                  <div class="stat-rows">
                    <div class="stat-row">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="stat-icon">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                      </svg>
                      <span>Fonctionnels : <strong>{{ dept.fonctionnels || 0 }}</strong></span>
                    </div>
                    <div class="stat-row">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="stat-icon">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                      </svg>
                      <span>Non fonctionnels : <strong>{{ dept.non_fonctionnels || 0 }}</strong></span>
                    </div>
                    <div class="stat-row">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="stat-icon">
                        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
                      </svg>
                      <span>En réparation : <strong>{{ dept.en_reparation || 0 }}</strong></span>
                    </div>
                  </div>
                </div>

                <div class="departement-card-footer">
                  <button class="footer-btn primary" @click="openEquipementsModal(dept)">
                    Équipements →
                  </button>
                  <button class="footer-btn secondary" @click="openUnitesModal(dept)">
                    Unités →
                  </button>
                </div>
              </div>
              <div class="carousel-end-spacer" aria-hidden="true"></div>
            </div>
          </div>

          <button 
            class="carousel-chevron chevron-right" 
            @click="scrollDepartements(1)"
            :disabled="departements.length <= 1"
            aria-label="Défiler à droite"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
        </div>
      </section>

      <!-- Modal Equipements du Département -->
      <div v-if="showEquipementsModal" class="modal-backdrop" @click.self="closeEquipementsModal">
        <div class="modal modal-large">
          <div class="modal-header">
            <h3>
              <span class="modal-icon">📊</span>
              Équipements - {{ selectedDepartement?.nom }}
            </h3>
            <button class="close-btn" @click="closeEquipementsModal">×</button>
          </div>
          
          <div class="modal-body">
            <div v-if="loadingEquipements" class="loading">
              <p>Chargement des équipements...</p>
            </div>

            <div v-else-if="departementEquipements.length === 0" class="empty-equipements">
              <p>Aucun équipement dans ce département</p>
            </div>

            <div v-else class="equipements-content">
            <div 
              v-for="equipement in departementEquipements" 
              :key="equipement.type_id"
              class="equipement-item"
            >
              <div 
                class="equipement-header"
                @click="toggleEquipementDetails(equipement)"
              >
                <div class="equipement-info">
                  <h4 class="equipement-name">{{ equipement.type_nom }}</h4>
                  <span class="equipement-total">{{ equipement.total }} au total</span>
                </div>
                <span class="expand-icon" :class="{ 'rotated': selectedEquipementType === equipement.type_id }">▼</span>
              </div>
              
              <div 
                v-if="selectedEquipementType === equipement.type_id" 
                class="equipement-details"
              >
                <div class="etats-grid">
                  <div class="etat-item fonctionnel">
                    <span class="etat-label">Fonctionnels</span>
                    <span class="etat-value">{{ equipement.fonctionnels || 0 }}</span>
                  </div>
                  <div class="etat-item non-fonctionnel">
                    <span class="etat-label">Non fonctionnels</span>
                    <span class="etat-value">{{ equipement.non_fonctionnels || 0 }}</span>
                  </div>
                  <div class="etat-item reparation">
                    <span class="etat-label">En réparation</span>
                    <span class="etat-value">{{ equipement.en_reparation || 0 }}</span>
                  </div>
                  <div class="etat-item manquant">
                    <span class="etat-label">Manquants</span>
                    <span class="etat-value">{{ equipement.manquants || 0 }}</span>
                  </div>
                </div>
              </div>
            </div>
            </div>
          </div>

          <div class="modal-actions">
            <button class="btn-cancel" @click="closeEquipementsModal">Fermer</button>
          </div>
        </div>
      </div>

      <!-- Modal Unités du Département -->
      <div v-if="showUnitesModal" class="modal-backdrop" @click.self="closeUnitesModal">
        <div class="modal modal-extra-large">
          <div class="modal-header">
            <h3>
              <span class="modal-icon">🏢</span>
              Unités - {{ selectedDepartement?.nom }}
            </h3>
            <button class="close-btn" @click="closeUnitesModal">×</button>
          </div>
          
          <div class="modal-body">
            <div v-if="loadingUnites" class="loading">
              <p>Chargement des unités...</p>
            </div>

            <div v-else-if="departementUnites.length === 0" class="empty-equipements">
              <p>Aucune unité dans ce département</p>
            </div>

            <div v-else class="unites-content">
            <div 
              v-for="unite in departementUnites" 
              :key="unite.id"
              class="unite-card"
            >
              <div class="unite-card-header">
                <h4 class="unite-name">
                  {{ unite.nom }}
                </h4>
                <span v-if="unite.reference" class="unite-reference">{{ unite.reference }}</span>
              </div>
              
              <div v-if="unite.adresse || unite.contact" class="unite-info">
                <p v-if="unite.adresse" class="unite-address">📍 {{ unite.adresse }}</p>
                <p v-if="unite.contact" class="unite-contact">📞 {{ unite.contact }}</p>
              </div>

              <div class="unite-stats-summary">
                <div class="summary-item">
                  <span class="summary-label">Total équipements</span>
                  <span class="summary-value">{{ unite.total_equipements || 0 }}</span>
                </div>
                <div class="summary-item success">
                  <span class="summary-label">Fonctionnels</span>
                  <span class="summary-value">{{ unite.fonctionnels || 0 }}</span>
                </div>
                <div class="summary-item warning">
                  <span class="summary-label">Non fonctionnels</span>
                  <span class="summary-value">{{ unite.non_fonctionnels || 0 }}</span>
                </div>
              </div>

              <div v-if="unite.equipements && unite.equipements.length > 0" class="unite-equipements">
                <h5 class="equipements-title">Détails par type d'équipement</h5>
                <div class="equipements-list">
                  <div 
                    v-for="eq in unite.equipements" 
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
              <div v-else class="no-equipements">
                <p>Aucun équipement dans cette unité</p>
              </div>
            </div>
            </div>
          </div>

          <div class="modal-actions">
            <button class="btn-cancel" @click="closeUnitesModal">Fermer</button>
          </div>
        </div>
      </div>

      <!-- ZONE 3 : ACTIVITÉ RÉCENTE (2 COLONNES) -->
      <section class="activity-section">
        <div class="activity-grid">
          <div class="activity-col">
            <RecentEquipments :equipments="recents" />
          </div>
          <div class="activity-col">
            <RecentLogs :logs="logs" />
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
/* ===== LAYOUT ===== */
.admin-layout {
  display: flex;
}

.admin-content {
  margin-left: 220px;
  padding: 30px;
  width: 100%;
  min-height: 100vh;
  background: #f6f7fb;
  box-sizing: border-box;
  transition: margin-left 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.admin-content.sidebar-hidden {
  margin-left: 0;
}

.admin-content > * {
  width: 100%;
  max-width: 1400px;
}

/* ===== TITRE ===== */
.page-title {
  margin-bottom: 30px;
  font-size: 28px;
  font-weight: 700;
  color: #1a202c;
}

/* ===== ZONE 1 : STATS ===== */
.stats-section {
  margin-bottom: 30px;
}

.stats-row {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
  justify-content: center;
}


/* ===== ZONE 3 : ACTIVITÉ RÉCENTE ===== */
.activity-section {
  margin-bottom: 30px;  
}

.activity-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

@media (max-width: 1200px) {
  .activity-grid {
    grid-template-columns: 1fr;
  }
}

/* ===== ZONE 2 : STATISTIQUES PAR DÉPARTEMENT ===== */
.departements-section {
  margin-bottom: 30px;
  overflow: visible;
}

.section-title {
  font-size: 22px;
  font-weight: 700;
  color: #1a202c;
  margin-bottom: 24px;
  font-family: 'Inter', sans-serif;
}

.loading, .empty {
  text-align: center;
  padding: 40px;
  color: #a0aec0;
  font-style: italic;
  font-family: 'Inter', sans-serif;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  box-sizing: border-box;
}

/* ===== CARROUSEL DÉPARTEMENTS (style large cards + chevrons) ===== */
.departements-carousel {
  display: flex;
  align-items: stretch;
  gap: 12px;
  width: 100%;
  min-height: 440px;
}

.carousel-chevron {
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

.chevron-left {
  order: 1;
}

.chevron-right {
  order: 3;
}

.carousel-chevron:hover:not(:disabled) {
  background: #1a6fd4;
  color: white;
  border-color: #1a6fd4;
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(26, 111, 212, 0.3);
}

.carousel-chevron:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.carousel-chevron svg {
  width: 22px;
  height: 22px;
}

.departements-scroll {
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

.departements-scroll::-webkit-scrollbar {
  height: 8px;
}

.departements-scroll::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 4px;
}

.departements-scroll::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}

.departements-track {
  display: flex;
  gap: 20px;
  padding: 0 8px;
  min-width: min-content;
  align-items: stretch;
}

.carousel-end-spacer {
  flex: 0 0 24px;
  min-width: 24px;
  height: 1px;
  pointer-events: none;
}

.departement-card {
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
}

.departement-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15);
}

.departement-card-header {
  background: linear-gradient(135deg, #1a6fd4 0%, #0f4a7a 100%);
  color: white;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex-shrink: 0;
}

.departement-badge {
  align-self: flex-start;
  background: rgba(255, 255, 255, 0.25);
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  font-family: 'Inter', sans-serif;
}

.departement-name {
  font-size: 18px;
  font-weight: 700;
  margin: 0;
  font-family: 'Inter', sans-serif;
  line-height: 1.35;
  letter-spacing: -0.3px;
}

.departement-card-body {
  padding: 20px;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 18px;
  min-height: 0;
}

.stat-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.pill {
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

.pill svg {
  flex-shrink: 0;
  opacity: 0.9;
}

.stat-rows {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.stat-row {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  color: #475569;
  font-family: 'Inter', sans-serif;
}

.stat-row .stat-icon {
  flex-shrink: 0;
  width: 18px;
  height: 18px;
  color: #1a6fd4;
}

.stat-row strong {
  color: #1a202c;
  font-weight: 600;
}

.departement-card-footer {
  display: flex;
  gap: 10px;
  padding: 14px 16px;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
  flex-shrink: 0;
}

.footer-btn {
  flex: 1;
  padding: 12px 14px;
  border: none;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  font-family: 'Inter', sans-serif;
  cursor: pointer;
  transition: all 0.3s ease;
}

.footer-btn.primary {
  background: linear-gradient(135deg, #1a6fd4 0%, #0f4a7a 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(26, 111, 212, 0.3);
}

.footer-btn.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(26, 111, 212, 0.4);
}

.footer-btn.secondary {
  background: white;
  color: #1a6fd4;
  border: 2px solid #1a6fd4;
}

.footer-btn.secondary:hover {
  background: #f0f9ff;
  transform: translateY(-2px);
}

/* ===== MODALS ===== */
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
  border-radius: 16px;
  width: 100%;
  max-width: 700px;
  max-height: calc(90vh - 40px);
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  font-family: 'Inter', sans-serif;
  overflow: hidden;
}

.modal-large {
  max-width: 850px;
}

.modal-extra-large {
  max-width: 950px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e2e8f0;
  background: white;
  flex-shrink: 0;
  box-sizing: border-box;
}

.modal-header h3 {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: #1a202c;
  font-family: 'Inter', sans-serif;
  flex: 1;
  min-width: 0;
  word-wrap: break-word;
}

.modal-icon {
  font-size: 24px;
}

.close-btn {
  background: none;
  border: none;
  font-size: 32px;
  color: #64748b;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: #f1f5f9;
  color: #1a202c;
}

.empty-equipements {
  padding: 40px;
  text-align: center;
  color: #94a3b8;
  font-size: 15px;
  font-weight: 500;
  font-family: 'Inter', sans-serif;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  box-sizing: border-box;
}

.modal-actions {
  padding: 16px 20px;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: flex-end;
  background: white;
  flex-shrink: 0;
  box-sizing: border-box;
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

/* ===== MODAL BODY ===== */
.modal-body {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
  box-sizing: border-box;
}

/* ===== MODAL ÉQUIPEMENTS ===== */
.equipements-content {
  padding: 20px;
  box-sizing: border-box;
}

.equipement-item {
  background: #f8fafc;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  margin-bottom: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.equipement-item:hover {
  border-color: #1a6fd4;
  box-shadow: 0 2px 8px rgba(26, 111, 212, 0.1);
}

.equipement-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  cursor: pointer;
  background: white;
  gap: 12px;
  box-sizing: border-box;
}

.equipement-info {
  flex: 1;
  min-width: 0;
}

.equipement-name {
  font-size: 16px;
  font-weight: 700;
  color: #1a202c;
  margin: 0 0 4px 0;
  font-family: 'Inter', sans-serif;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

.equipement-total {
  font-size: 13px;
  color: #64748b;
  font-weight: 600;
  font-family: 'Inter', sans-serif;
  white-space: nowrap;
}

.expand-icon {
  font-size: 12px;
  color: #718096;
  transition: transform 0.3s ease;
  flex-shrink: 0;
  width: 20px;
  text-align: center;
}

.expand-icon.rotated {
  transform: rotate(180deg);
}

.equipement-details {
  padding: 20px;
  background: white;
  border-top: 2px solid #e2e8f0;
  animation: slideDown 0.3s ease-out;
  box-sizing: border-box;
}

.etats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.etat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  border-radius: 10px;
  border-left: 3px solid #cbd5e1;
}

.etat-item.fonctionnel {
  border-left-color: #10b981;
  background: #f0fdf4;
}

.etat-item.non-fonctionnel {
  border-left-color: #ef4444;
  background: #fef2f2;
}

.etat-item.reparation {
  border-left-color: #f59e0b;
  background: #fffbeb;
}

.etat-item.manquant {
  border-left-color: #6b7280;
  background: #f9fafb;
}

.etat-label {
  font-size: 13px;
  color: #475569;
  font-weight: 600;
  font-family: 'Inter', sans-serif;
}

.etat-value {
  font-size: 20px;
  font-weight: 700;
  color: #1a202c;
  font-family: 'Inter', sans-serif;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ===== MODAL UNITÉS ===== */
.unites-content {
  padding: 20px;
  box-sizing: border-box;
}

.unite-card {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  padding: 18px;
  margin-bottom: 16px;
  transition: all 0.3s ease;
  box-sizing: border-box;
  width: 100%;
  overflow: hidden;
}

.unite-card:last-child {
  margin-bottom: 0;
}

.unite-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-color: #1a6fd4;
}

.unite-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
  padding-bottom: 14px;
  border-bottom: 2px solid #e2e8f0;
  gap: 12px;
  flex-wrap: wrap;
  box-sizing: border-box;
}

.unite-name {
  font-size: 18px;
  font-weight: 700;
  color: #1a202c;
  margin: 0;
  font-family: 'Inter', sans-serif;
  flex: 1;
  min-width: 0;
  word-wrap: break-word;
  line-height: 1.5;
}

.unite-reference {
  background: #dbeafe;
  color: #1e40af;
  padding: 6px 14px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  font-family: 'Inter', sans-serif;
  white-space: nowrap;
  flex-shrink: 0;
}

.unite-info {
  margin-bottom: 16px;
}

.unite-address,
.unite-contact {
  font-size: 14px;
  color: #475569;
  margin: 8px 0;
  font-family: 'Inter', sans-serif;
}

.unite-stats-summary {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-bottom: 16px;
  padding: 12px;
  background: #f8fafc;
  border-radius: 10px;
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

.equipements-title {
  font-size: 15px;
  font-weight: 600;
  color: #1a202c;
  margin: 0 0 12px 0;
  font-family: 'Inter', sans-serif;
}

.equipements-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
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

.no-equipements {
  text-align: center;
  padding: 20px;
  color: #94a3b8;
  font-size: 14px;
  font-style: italic;
  font-family: 'Inter', sans-serif;
}

@media (max-width: 768px) {
  .departements-grid {
    grid-template-columns: 1fr;
  }
  
  .departement-actions {
    flex-direction: column;
  }
  
  .etats-grid,
  .type-etats {
    grid-template-columns: 1fr;
  }
  
  .unite-stats-summary {
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
  
  .equipements-content,
  .unites-content {
    padding: 16px;
  }
  
  .unite-card {
    padding: 16px;
  }
  
  .type-header {
    flex-direction: column;
    align-items: flex-start;
  }
}

</style>
