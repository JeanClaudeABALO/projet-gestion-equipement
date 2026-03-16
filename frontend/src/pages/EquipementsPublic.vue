<template>
  <div class="equipements-public-page">
    <div class="page-container">
      <!-- En-tête principal -->
      <div class="page-header">
        <p class="section-label">ÉQUIPEMENTS</p>
        <h1 class="section-title">Vision globale de la gestion et du suivi des équipements</h1>
        <p class="section-subtitle">
          Découvrez les types d'équipements gérés, leurs états et les fonctionnalités de traçabilité
        </p>
      </div>

      <!-- Types d'équipements -->
      <section class="content-section">
        <p class="section-label">CATÉGORIES</p>
        <h2 class="section-title">Types d'équipements gérés</h2>
        <p class="section-subtitle">
          La plateforme permet de gérer et suivre différents types d'équipements informatiques et techniques utilisés au sein du CDSP.
        </p>
        <div class="cards-grid types-grid">
          <div class="content-card" v-for="type in typesEquipements" :key="type">
            <div class="card-icon" :class="getIconClass(type)">
              <span class="type-emoji">{{ getIcon(type) }}</span>
            </div>
            <h3>{{ type }}</h3>
          </div>
        </div>
      </section>

      <!-- États des équipements -->
      <section class="content-section">
        <p class="section-label">ÉTATS</p>
        <h2 class="section-title">États des équipements</h2>
        <p class="section-subtitle">
          Chaque équipement peut se trouver dans l'un des états suivants
        </p>
        <div class="cards-grid">
          <div class="content-card">
            <div class="card-icon icon-green">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            <h3>Fonctionnel</h3>
            <p>Équipement opérationnel et utilisable</p>
          </div>
          <div class="content-card">
            <div class="card-icon icon-red">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </div>
            <h3>Non fonctionnel</h3>
            <p>Équipement en panne ou inutilisable</p>
          </div>
          <div class="content-card">
            <div class="card-icon icon-orange">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
              </svg>
            </div>
            <h3>En réparation</h3>
            <p>Équipement en cours de réparation</p>
          </div>
          <div class="content-card">
            <div class="card-icon icon-slate">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                <line x1="12" y1="22.08" x2="12" y2="12"></line>
              </svg>
            </div>
            <h3>Manquant</h3>
            <p>Équipement non localisé ou absent</p>
          </div>
          <div class="content-card">
            <div class="card-icon icon-purple">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            </div>
            <h3>Vétuste</h3>
            <p>Équipement obsolète ou à remplacer</p>
          </div>
        </div>
      </section>

      <!-- Gestion et traçabilité -->
      <section class="content-section">
        <p class="section-label">TRAÇABILITÉ</p>
        <h2 class="section-title">Gestion et traçabilité</h2>
        <p class="section-subtitle">
          Un suivi complet pour une gestion optimale des équipements
        </p>
        <div class="cards-grid">
          <div class="content-card">
            <div class="card-icon icon-blue">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
            </div>
            <h3>Inventaire</h3>
            <p>Enregistrement complet de tous les équipements avec leurs caractéristiques</p>
          </div>
          <div class="content-card">
            <div class="card-icon icon-green">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
            </div>
            <h3>Localisation</h3>
            <p>Suivi de l'affectation par département et unité</p>
          </div>
          <div class="content-card">
            <div class="card-icon icon-purple">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="23 4 23 10 17 10"></polyline>
                <polyline points="1 20 1 14 7 14"></polyline>
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
              </svg>
            </div>
            <h3>Mouvements</h3>
            <p>Traçabilité des transferts et réaffectations</p>
          </div>
          <div class="content-card">
            <div class="card-icon icon-orange">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 20h9"></path>
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
              </svg>
            </div>
            <h3>Historique</h3>
            <p>Journal complet de toutes les modifications et interventions</p>
          </div>
        </div>
        <div class="section-cta">
          <p class="cta-text">Pour accéder aux fonctionnalités complètes de gestion, connectez-vous à la plateforme.</p>
          <button class="btn-primary-large" @click="goToPlatform">
            Accéder à la plateforme
          </button>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";

const router = useRouter();

const typesEquipements = [
  "Clavier",
  "Souris",
  "Écran",
  "Unité Centrale",
  "Modem",
  "Onduleur",
  "Régulateur",
  "Rallonge",
  "Scanner"
];

function getIcon(type) {
  const icons = {
    "Clavier": "⌨️",
    "Souris": "🖱️",
    "Écran": "🖥️",
    "Unité Centrale": "💻",
    "Modem": "📡",
    "Onduleur": "🔌",
    "Régulateur": "⚡",
    "Rallonge": "🔌",
    "Scanner": "📄"
  };
  return icons[type] || "📦";
}

function getIconClass(type) {
  const classes = ["icon-blue", "icon-green", "icon-purple", "icon-orange", "icon-teal"];
  const index = typesEquipements.indexOf(type) % classes.length;
  return classes[index];
}

function goToPlatform() {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  
  if (token && role) {
    if (role === "admin" || role === "super_admin") {
      router.push("/dashboard/admin");
    } else if (role === "pf") {
      router.push("/dashboard-point-focal");
    }
  } else {
    router.push("/login");
  }
}
</script>

<style scoped>
.equipements-public-page {
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
  color: #1a6fd4;
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

/* Sections */
.content-section {
  padding: 80px 0;
}

.content-section:first-of-type {
  padding-top: 0;
}

/* Cartes blanches style WabaJob */
.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 28px;
}

.types-grid {
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
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

.card-icon {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
}

.card-icon svg {
  width: 28px;
  height: 28px;
  color: white;
}

.type-emoji {
  font-size: 28px;
}

.icon-blue {
  background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%);
}

.icon-green {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.icon-purple {
  background: linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%);
}

.icon-orange {
  background: linear-gradient(135deg, #f59e0b 0%, #ea580c 100%);
}

.icon-teal {
  background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%);
}

.icon-red {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
}

.icon-slate {
  background: linear-gradient(135deg, #64748b 0%, #475569 100%);
}

.content-card h3 {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 12px;
  color: #1e293b;
  font-family: 'Inter', sans-serif;
}

.content-card p {
  font-size: 14px;
  color: #64748b;
  line-height: 1.65;
}

/* Types sans description */
.types-grid .content-card h3 {
  margin-bottom: 0;
}

.section-cta {
  text-align: center;
  margin-top: 48px;
}

.cta-text {
  font-size: 16px;
  color: #64748b;
  margin-bottom: 24px;
  line-height: 1.6;
}

.btn-primary-large {
  padding: 16px 40px;
  font-size: 18px;
  background: #1a6fd4;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-primary-large:hover {
  background: #084a9e;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

@media (max-width: 768px) {
  .page-header .section-title {
    font-size: 30px;
  }
  
  .section-title {
    font-size: 28px;
  }
  
  .cards-grid {
    grid-template-columns: 1fr;
  }
  
  .types-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
