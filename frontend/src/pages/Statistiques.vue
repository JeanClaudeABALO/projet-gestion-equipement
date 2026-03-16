<template>
  <div class="statistiques-page">
    <div class="page-container">
      <!-- En-tête principal -->
      <div class="page-header">
        <p class="section-label">STATISTIQUES</p>
        <h1 class="section-title">Vue d'ensemble des équipements</h1>
        <p class="section-subtitle">
          Découvrez les chiffres clés et la répartition des équipements au sein du CDSP
        </p>
      </div>

      <div v-if="loading" class="loading-container">
        <p>Chargement des statistiques...</p>
      </div>

      <div v-else>
        <!-- Statistiques globales - Cartes blanches -->
        <section class="content-section">
          <p class="section-label">CHIFFRES CLÉS</p>
          <h2 class="section-title">Indicateurs globaux</h2>
          <p class="section-subtitle">
            Vue synthétique de la situation des équipements
          </p>
          <div class="stats-cards-grid">
            <div class="stat-card-white">
              <div class="card-icon icon-blue">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                  <line x1="12" y1="22.08" x2="12" y2="12"></line>
                </svg>
              </div>
              <div class="stat-value-large">{{ formatNumber(stats.totalEquipements) }}</div>
              <div class="stat-label-large">Total équipements</div>
            </div>
            <div class="stat-card-white">
              <div class="card-icon icon-green">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
              <div class="stat-value-large">{{ formatNumber(stats.fonctionnels) }}</div>
              <div class="stat-label-large">Fonctionnels</div>
              <div class="stat-percentage">{{ getPercentage(stats.fonctionnels, stats.totalEquipements) }}%</div>
            </div>
            <div class="stat-card-white">
              <div class="card-icon icon-orange">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                  <line x1="12" y1="9" x2="12" y2="13"></line>
                  <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
              </div>
              <div class="stat-value-large">{{ formatNumber(stats.enReparation) }}</div>
              <div class="stat-label-large">En réparation</div>
              <div class="stat-percentage">{{ getPercentage(stats.enReparation, stats.totalEquipements) }}%</div>
            </div>
          </div>
        </section>

        <!-- Répartition par état -->
        <section class="content-section">
          <p class="section-label">RÉPARTITION</p>
          <h2 class="section-title">Répartition par état</h2>
          <p class="section-subtitle">
            Distribution des équipements selon leur état actuel
          </p>
          <div class="stats-card-white">
            <div class="stats-grid">
              <div class="stat-item">
                <div class="stat-label">Fonctionnels</div>
                <div class="stat-bar">
                  <div 
                    class="stat-bar-fill fonctionnel" 
                    :style="{ width: getPercentage(stats.fonctionnels, stats.totalEquipements) + '%' }"
                  ></div>
                </div>
                <div class="stat-value">{{ formatNumber(stats.fonctionnels) }}</div>
              </div>
              <div class="stat-item">
                <div class="stat-label">Non fonctionnels</div>
                <div class="stat-bar">
                  <div 
                    class="stat-bar-fill non-fonctionnel" 
                    :style="{ width: getPercentage(stats.nonFonctionnels, stats.totalEquipements) + '%' }"
                  ></div>
                </div>
                <div class="stat-value">{{ formatNumber(stats.nonFonctionnels) }}</div>
              </div>
              <div class="stat-item">
                <div class="stat-label">En réparation</div>
                <div class="stat-bar">
                  <div 
                    class="stat-bar-fill reparation" 
                    :style="{ width: getPercentage(stats.enReparation, stats.totalEquipements) + '%' }"
                  ></div>
                </div>
                <div class="stat-value">{{ formatNumber(stats.enReparation) }}</div>
              </div>
              <div class="stat-item">
                <div class="stat-label">Manquants</div>
                <div class="stat-bar">
                  <div 
                    class="stat-bar-fill manquant" 
                    :style="{ width: getPercentage(stats.manquants, stats.totalEquipements) + '%' }"
                  ></div>
                </div>
                <div class="stat-value">{{ formatNumber(stats.manquants) }}</div>
              </div>
            </div>
          </div>
        </section>

        <!-- Répartition géographique -->
        <section class="content-section">
          <p class="section-label">GÉOGRAPHIE</p>
          <h2 class="section-title">Répartition géographique</h2>
          <p class="section-subtitle">
          Couverture territoriale et organisation des unités
          </p>
          <div class="geo-cards-grid">
            <div class="content-card">
              <div class="card-icon icon-blue">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                  <polyline points="9 22 9 12 15 12 15 22"></polyline>
                </svg>
              </div>
              <div class="geo-value">{{ formatNumber(stats.totalDepartements) }}</div>
              <h3>Départements couverts</h3>
            </div>
            <div class="content-card">
              <div class="card-icon icon-green">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M3 21h18"></path>
                  <path d="M5 21V7l8-4v18"></path>
                  <path d="M19 21V11l-6-4"></path>
                </svg>
              </div>
              <div class="geo-value">{{ formatNumber(stats.totalUnites) }}</div>
              <h3>Unités enregistrées</h3>
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import api from "../api/axios";

const loading = ref(true);
const stats = ref({
  totalEquipements: 0,
  fonctionnels: 0,
  nonFonctionnels: 0,
  enReparation: 0,
  manquants: 0,
  totalDepartements: 0,
  totalUnites: 0
});

function formatNumber(num) {
  return new Intl.NumberFormat('fr-FR').format(num);
}

function getPercentage(value, total) {
  if (!total || total === 0) return 0;
  return Math.round((value / total) * 100);
}

async function loadStats() {
  loading.value = true;
  try {
    const res = await api.get("/dashboard/public-stats").catch(() => null);
    
    if (res?.data) {
      stats.value = {
        totalEquipements: res.data.totalEquipements || 0,
        fonctionnels: res.data.fonctionnels || 0,
        nonFonctionnels: res.data.nonFonctionnels || 0,
        enReparation: res.data.enReparation || 0,
        manquants: res.data.manquants || 0,
        totalDepartements: res.data.totalDepartements || 0,
        totalUnites: res.data.totalUnites || 0
      };
    }
  } catch (error) {
    console.error("Erreur chargement stats:", error);
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  loadStats();
});
</script>

<style scoped>
.statistiques-page {
  min-height: calc(100vh - 80px);
  padding-top: 80px;
  background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%);
}

.page-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 60px 20px 80px;
}

.page-header {
  text-align: center;
  margin-bottom: 60px;
}

/* Format WabaJob - En-tête */
.section-label {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.2em;
  color: #0a5bc4;
  text-transform: uppercase;
  margin-bottom: 14px;
}

.section-label::before,
.section-label::after {
  content: '';
  width: 50px;
  height: 2px;
  background: linear-gradient(90deg, transparent, #3b82f6);
}

.section-label::after {
  background: linear-gradient(90deg, #3b82f6, transparent);
}

.section-title {
  font-size: 42px;
  font-weight: 800;
  text-align: center;
  margin-bottom: 16px;
  color: #1e293b;
  font-family: 'Inter', sans-serif;
}

.page-header .section-title {
  font-size: 44px;
}

.section-subtitle {
  font-size: 16px;
  text-align: center;
  color: #64748b;
  max-width: 680px;
  margin: 0 auto 48px;
  line-height: 1.6;
}

.page-header .section-subtitle {
  margin-bottom: 0;
}

.loading-container {
  text-align: center;
  padding: 60px;
  font-size: 18px;
  color: #64748b;
}

/* Sections */
.content-section {
  padding: 80px 0;
}

.content-section:first-of-type {
  padding-top: 0;
}

/* Cartes statistiques blanches */
.stats-cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 28px;
}

.stat-card-white {
  background: #ffffff;
  border-radius: 20px;
  padding: 32px 28px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
  border: 1px solid rgba(0, 0, 0, 0.04);
  text-align: center;
}

.stat-card-white:hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.1);
}

.stat-card-white .card-icon {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
}

.stat-card-white .card-icon svg {
  width: 28px;
  height: 28px;
  color: white;
}

.icon-blue {
  background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%);
}

.icon-green {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.icon-orange {
  background: linear-gradient(135deg, #f59e0b 0%, #ea580c 100%);
}

.stat-value-large {
  font-size: 42px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 8px;
}

.stat-label-large {
  font-size: 16px;
  color: #64748b;
  font-weight: 500;
}

.stat-percentage {
  font-size: 16px;
  color: #0a5bc4;
  margin-top: 8px;
  font-weight: 600;
}

/* Carte répartition par état */
.stats-card-white {
  background: #ffffff;
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(0, 0, 0, 0.04);
}

.stats-grid {
  display: grid;
  gap: 25px;
}

.stat-item {
  display: grid;
  grid-template-columns: 150px 1fr 100px;
  align-items: center;
  gap: 20px;
}

.stat-label {
  font-size: 16px;
  font-weight: 500;
  color: #475569;
}

.stat-bar {
  height: 30px;
  background: #e2e8f0;
  border-radius: 15px;
  overflow: hidden;
  position: relative;
}

.stat-bar-fill {
  height: 100%;
  border-radius: 15px;
  transition: width 0.5s ease;
}

.stat-bar-fill.fonctionnel {
  background: linear-gradient(90deg, #10b981 0%, #059669 100%);
}

.stat-bar-fill.non-fonctionnel {
  background: linear-gradient(90deg, #ef4444 0%, #dc2626 100%);
}

.stat-bar-fill.reparation {
  background: linear-gradient(90deg, #f59e0b 0%, #ea580c 100%);
}

.stat-bar-fill.manquant {
  background: linear-gradient(90deg, #94a3b8 0%, #64748b 100%);
}

.stat-value {
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  text-align: right;
}

/* Cartes géographiques */
.geo-cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 28px;
}

.content-card {
  background: #ffffff;
  border-radius: 20px;
  padding: 32px 28px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
  border: 1px solid rgba(0, 0, 0, 0.04);
}

.content-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.1);
}

.content-card .card-icon {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
}

.content-card .card-icon svg {
  width: 28px;
  height: 28px;
  color: white;
}

.geo-value {
  font-size: 42px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 12px;
}

.content-card h3 {
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

@media (max-width: 768px) {
  .page-header .section-title {
    font-size: 30px;
  }
  
  .section-title {
    font-size: 28px;
  }
  
  .stats-cards-grid {
    grid-template-columns: 1fr;
  }
  
  .stat-item {
    grid-template-columns: 1fr;
    gap: 10px;
  }
  
  .stat-value {
    text-align: left;
  }
}
</style>
