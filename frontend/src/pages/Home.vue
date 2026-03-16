<template>
  <div class="home-container">
    <!-- SECTION 1: HERO - IDENTITÉ & MESSAGE CLÉ -->
    <section class="hero-section">
      <div class="hero-bg">
        <img src="/cdsp.jpg" alt="" class="hero-bg-img" />
      </div>
      <div class="hero-overlay"></div>
      <div class="hero-content">
        <h1 class="hero-title" :class="{ 'animate-in': isAnimated }">
          <span class="title-line">Plateforme nationale de gestion des équipements</span><br />
          <span class="hero-subtitle-main">du Centre de Documentation de Sécurité Publique (CDSP)</span>
        </h1>
        <p class="hero-description">
          Suivi, traçabilité et optimisation des équipements institutionnels
        </p>
        <div class="hero-actions">
          <button class="btn btn-primary" @click="goToPlatform">
            Accéder à la plateforme
          </button>
          <button class="btn btn-secondary" @click="$router.push('/statistiques')">
            Consulter les statistiques
          </button>
          <button 
            v-if="!adminExists && !loadingAdminCheck" 
            class="btn btn-admin" 
            @click="showAdminModal = true"
          >
            Inscription Super Administrateur
          </button>
        </div>
      </div>
    </section>

    <!-- SECTION 2: À QUOI SERT LA PLATEFORME ? -->
    <section class="content-section features-section section-with-bg">
      <div class="section-bg section-bg-apropos"></div>
      <div class="section-bg-overlay"></div>
      <div class="section-container">
        <p class="section-label">À PROPOS</p>
        <h2 class="section-title">À quoi sert la plateforme ?</h2>
        <p class="section-subtitle">
          Un outil centralisé pour mieux gérer, suivre et optimiser les équipements institutionnels du CDSP
        </p>
        <div class="cards-grid">
          <div class="content-card">
            <div class="card-icon icon-blue">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                <line x1="12" y1="22.08" x2="12" y2="12"></line>
              </svg>
            </div>
            <h3>Suivi des équipements</h3>
            <p>
              Localisation, état, affectation en temps réel de tous les équipements
              sur l'ensemble du territoire.
            </p>
          </div>
          <div class="content-card">
            <div class="card-icon icon-green">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
            </div>
            <h3>Gestion par département et unité</h3>
            <p>
              Organisation hiérarchique claire permettant une gestion structurée
              par département et unité administrative.
            </p>
          </div>
          <div class="content-card">
            <div class="card-icon icon-purple">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
              </svg>
            </div>
            <h3>Traçabilité des mouvements</h3>
            <p>
              Historique complet des affectations, transferts et modifications
              pour une traçabilité totale.
            </p>
          </div>
          <div class="content-card">
            <div class="card-icon icon-orange">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
              </svg>
            </div>
            <h3>Gestion des pannes et réparations</h3>
            <p>
              Déclaration rapide des pannes, suivi des réparations et réduction
              des temps d'indisponibilité.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- SECTION 3: COMMENT ÇA FONCTIONNE ? -->
    <section class="content-section process-section section-with-bg">
      <div class="section-bg section-bg-processus"></div>
      <div class="section-bg-overlay"></div>
      <div class="section-container">
        <p class="section-label">PROCESSUS</p>
        <h2 class="section-title">Comment ça fonctionne ?</h2>
        <p class="section-subtitle">
          Un processus structuré et rigoureux pour une gestion optimale des équipements
        </p>
        <div class="cards-grid process-cards">
          <div class="content-card step-card">
            <div class="card-icon icon-blue">
              <span>1</span>
            </div>
            <h3>Enregistrement des équipements</h3>
            <p>Inventaire et catalogage de tous les équipements par type et caractéristiques</p>
          </div>
          <div class="content-card step-card">
            <div class="card-icon icon-green">
              <span>2</span>
            </div>
            <h3>Affectation aux unités</h3>
            <p>Assignation des équipements aux différentes unités administratives</p>
          </div>
          <div class="content-card step-card">
            <div class="card-icon icon-purple">
              <span>3</span>
            </div>
            <h3>Suivi de l'état</h3>
            <p>Mise à jour régulière de l'état des équipements (fonctionnel, panne, réparation)</p>
          </div>
          <div class="content-card step-card">
            <div class="card-icon icon-orange">
              <span>4</span>
            </div>
            <h3>Déclaration des pannes</h3>
            <p>Signalement rapide des dysfonctionnements par les points focaux</p>
          </div>
          <div class="content-card step-card">
            <div class="card-icon icon-teal">
              <span>5</span>
            </div>
            <h3>Réparations & rapports</h3>
            <p>Suivi des interventions et génération de rapports pour la prise de décision</p>
          </div>
        </div>
      </div>
    </section>

    <!-- SECTION 4: INDICATEURS CLÉS -->
    <section class="content-section stats-section">
      <div class="section-container">
        <p class="section-label">CHIFFRES CLÉS</p>
        <h2 class="section-title">Indicateurs clés</h2>
        <p class="section-subtitle">
          Vue d'ensemble de la situation des équipements au sein du CDSP
        </p>
        <div class="stats-grid" v-if="!loadingStats">
          <div class="stat-card">
            <div class="stat-value">{{ formatNumber(stats.totalEquipements) }}</div>
            <div class="stat-label">Total équipements</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ formatNumber(stats.fonctionnels) }}</div>
            <div class="stat-label">Équipements fonctionnels</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ formatNumber(stats.enReparation) }}</div>
            <div class="stat-label">En réparation</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ formatNumber(stats.totalDepartements) }}</div>
            <div class="stat-label">Départements couverts</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ formatNumber(stats.totalUnites) }}</div>
            <div class="stat-label">Unités enregistrées</div>
          </div>
        </div>
        <div v-else class="loading-stats">Chargement des statistiques...</div>
      </div>
    </section>

    <!-- SECTION 5: ACCÈS SÉCURISÉ & GOUVERNANCE -->
    <section class="content-section security-section section-with-bg">
      <div class="section-bg section-bg-securite"></div>
      <div class="section-bg-overlay"></div>
      <div class="section-container">
        <p class="section-label">SÉCURITÉ</p>
        <h2 class="section-title">Accès sécurisé & Gouvernance</h2>
        <p class="section-subtitle">
          Une plateforme sécurisée respectant les procédures administratives du CDSP
        </p>
        <div class="cards-grid">
          <div class="content-card">
            <div class="card-icon icon-blue">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
            </div>
            <h3>Accès sécurisé</h3>
            <p>Authentification par rôle avec contrôle d'accès strict</p>
          </div>
          <div class="content-card">
            <div class="card-icon icon-green">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
            <h3>Gestion des rôles</h3>
            <p>Administrateur central et Points focaux départementaux</p>
          </div>
          <div class="content-card">
            <div class="card-icon icon-purple">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 20h9"></path>
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
              </svg>
            </div>
            <h3>Traçabilité des actions</h3>
            <p>Historique complet de toutes les modifications et actions</p>
          </div>
          <div class="content-card">
            <div class="card-icon icon-teal">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
            <h3>Conformité institutionnelle</h3>
            <p>Respect des procédures administratives et de la gouvernance</p>
          </div>
        </div>
        <div class="section-cta">
          <button class="btn btn-primary-large" @click="goToPlatform">
            Se connecter à la plateforme
          </button>
        </div>
      </div>
    </section>
  </div>

  <!-- Modal Inscription Admin -->
  <AdminRegisterModal
    v-if="showAdminModal"
    @close="showAdminModal = false"
    @success="handleAdminRegistered"
  />
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import api from "../api/axios";
import AdminRegisterModal from "../components/AdminRegisterModal.vue";
import authApi from "../api/auth";

const router = useRouter();
const route = useRoute();
const isAnimated = ref(false);

const stats = ref({
  totalEquipements: 0,
  fonctionnels: 0,
  enReparation: 0,
  totalDepartements: 0,
  totalUnites: 0
});

const loadingStats = ref(true);
const adminExists = ref(true);
const loadingAdminCheck = ref(true);
const showAdminModal = ref(false);

// Vérifier si un admin existe
async function checkAdminExists() {
  loadingAdminCheck.value = true;
  try {
    const res = await authApi.checkAdminExists();
    adminExists.value = res.data.exists;
  } catch (error) {
    console.error("Erreur vérification admin:", error);
    // En cas d'erreur, on assume qu'un admin existe pour la sécurité
    adminExists.value = true;
  } finally {
    loadingAdminCheck.value = false;
  }
}

// Gérer la création réussie de l'admin
function handleAdminRegistered() {
  adminExists.value = true;
  showAdminModal.value = false;
}

// Fonction pour accéder à la plateforme
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

// Formater les nombres
function formatNumber(num) {
  return new Intl.NumberFormat('fr-FR').format(num);
}

// Charger les statistiques publiques
async function loadPublicStats() {
  loadingStats.value = true;
  try {
    // Appel à une route publique (à créer dans le backend)
    const res = await api.get("/dashboard/public-stats").catch(() => null);
    
    if (res?.data) {
      stats.value = {
        totalEquipements: res.data.totalEquipements || 0,
        fonctionnels: res.data.fonctionnels || 0,
        enReparation: res.data.enReparation || 0,
        totalDepartements: res.data.totalDepartements || 0,
        totalUnites: res.data.totalUnites || 0
      };
    }
  } catch (error) {
    console.error("Erreur chargement stats publiques:", error);
  } finally {
    loadingStats.value = false;
  }
}

function triggerAnimation() {
  isAnimated.value = false;
  // Réinitialiser l'animation en forçant un reflow
  setTimeout(() => {
    isAnimated.value = true;
  }, 50);
}

onMounted(() => {
  loadPublicStats();
  checkAdminExists();
  // Démarrer l'animation après un court délai pour s'assurer que le DOM est prêt
  setTimeout(() => {
    triggerAnimation();
  }, 150);
});

// Réanimer quand on revient sur la page d'accueil
watch(() => route.path, (newPath) => {
  if (newPath === '/') {
    setTimeout(() => {
      triggerAnimation();
    }, 150);
  }
}, { immediate: false });
</script>

<style scoped>
.home-container {
  width: 100%;
  font-family: 'Inter', 'Segoe UI', 'Roboto', sans-serif;
}

/* SECTION HERO */
.hero-section {
  position: relative;
  min-height: 500px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 100px 20px 80px;
  overflow: hidden;
}

.hero-bg {
  position: absolute;
  inset: 0;
  overflow: hidden;
  z-index: 0;
}

.hero-bg-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  animation: heroImageKenBurns 12s ease-in-out infinite alternate;
}

@keyframes heroImageKenBurns {
  0% {
    transform: scale(1) translate(0, 0);
  }
  100% {
    transform: scale(1.2) translate(3%, 3%);
  }
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(7, 59, 117, 0.4) 0%, rgba(10, 91, 196, 0.3) 100%);
  z-index: 1;
}

.hero-content {
  position: relative;
  z-index: 2;
  text-align: center;
  max-width: 1000px;
  color: white;
}

.hero-title {
  font-size: 42px;
  font-weight: 700;
  line-height: 1.3;
  margin-bottom: 20px;
  color: white;
  overflow: hidden;
}

.title-line {
  display: inline-block;
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1), transform 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  /* Fallback : rendre visible après 1.5 secondes si l'animation ne se déclenche pas */
  animation: fadeInFallback 0.1s ease-in 1.5s forwards;
}

.hero-subtitle-main {
  font-size: 36px;
  font-weight: 500;
  color: #f1c40f;
  display: inline-block;
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.3s, transform 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.3s;
  /* Fallback : rendre visible après 1.8 secondes si l'animation ne se déclenche pas */
  animation: fadeInFallback 0.1s ease-in 1.8s forwards;
}

@keyframes fadeInFallback {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* État animé : visible et en position (annule l'animation fallback) */
.hero-title.animate-in .title-line {
  opacity: 1;
  transform: translateY(0);
  animation: none;
}

.hero-title.animate-in .hero-subtitle-main {
  opacity: 1;
  transform: translateY(0);
  animation: none;
}

.hero-description {
  font-size: 20px;
  color: rgba(255, 255, 255, 0.95);
  margin-bottom: 40px;
  line-height: 1.6;
}

.hero-actions {
  display: flex;
  justify-content: center;
  gap: 20px;
  flex-wrap: wrap;
}

/* BOUTONS */
.btn {
  padding: 14px 32px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
}

.btn-primary {
  background: #1ca492;
  color: white;
}

.btn-primary:hover {
  background: #1ca492;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.btn-secondary {
  background: transparent;
  color: white;
  border: 2px solid white;
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
}

.btn-admin {
  background: linear-gradient(135deg, #0d7a3d 0%, #0a5f2f 100%);
  color: white;
  border: 2px solid #0d7a3d;
  box-shadow: 0 4px 12px rgba(13, 122, 61, 0.3);
}

.btn-admin:hover {
  background: linear-gradient(135deg, #0a5f2f 0%, #084a24 100%);
  border-color: #0a5f2f;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(13, 122, 61, 0.4);
}

.btn-primary-large {
  padding: 16px 40px;
  font-size: 18px;
  background: #0a5bc4;
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

/* SECTIONS CONTENU - Format WabaJob */
.content-section {
  padding: 80px 20px;
}

.section-container {
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
  z-index: 2;
}

/* Images de fond pour sections À PROPOS, PROCESSUS, SÉCURITÉ */
.section-with-bg {
  position: relative;
  overflow: hidden;
}

.section-bg {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  z-index: 0;
}


.section-bg-apropos {
  background-image: url('/apropos.jpg');
  background-position: center 20%, center;
}

.section-bg-processus {
  background-image: url('/processus.png');
  background-position: center 50%, center;
}

.section-bg-securite {
  background-image: url('/securite.jpg');
  background-position: center 80%, center;
}

.section-bg-overlay {
  position: absolute;
  inset: 0;
  z-index: 1;
}

.features-section .section-bg-overlay {
  background: linear-gradient(135deg, rgba(248, 250, 252, 0.72) 0%, rgba(241, 245, 249, 0.68) 100%);
}

.process-section .section-bg-overlay {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.82) 0%, rgba(248, 250, 252, 0.78) 100%);
}

.security-section .section-bg-overlay {
  background: linear-gradient(135deg, rgba(241, 245, 249, 0.72) 0%, rgba(226, 232, 240, 0.68) 100%);
}

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

.section-subtitle {
  font-size: 16px;
  text-align: center;
  color: #64748b;
  max-width: 680px;
  margin: 0 auto 48px;
  line-height: 1.6;
}

.cards-grid {
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

.card-icon span {
  font-size: 22px;
  font-weight: 700;
  color: white;
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

/* SECTION FEATURES */
.features-section {
  background: #f8fafc;
}

/* SECTION PROCESS */
.process-section {
  background: #ffffff;
}

.process-cards {
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}

/* SECTION STATS - ancien format (fond bleu, cartes translucides) */
.stats-section {
  background: linear-gradient(135deg, #073b75 0%, #0a5bc4 100%);
  color: white;
}

.stats-section .section-label {
  color: #93c5fd;
}

.stats-section .section-label::before,
.stats-section .section-label::after {
  background: linear-gradient(90deg, transparent, rgba(147, 197, 253, 0.8));
}

.stats-section .section-label::after {
  background: linear-gradient(90deg, rgba(147, 197, 253, 0.8), transparent);
}

.stats-section .section-title {
  color: white;
  font-weight: 800;
  font-size: 42px;
}

.stats-section .section-subtitle {
  color: rgba(255, 255, 255, 0.9);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 28px;
  margin-top: 0;
}

.stat-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 32px 24px;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
}

.stat-card:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-5px);
}

.stat-value {
  font-size: 36px;
  font-weight: 700;
  margin-bottom: 10px;
  color: #f1c40f;
}

.stat-label {
  font-size: 14px;
  opacity: 0.95;
}

.loading-stats {
  text-align: center;
  padding: 48px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 16px;
}

/* SECTION SECURITY */
.security-section {
  background: linear-gradient(180deg, #f1f5f9 0%, #e2e8f0 100%);
}

.section-cta {
  text-align: center;
  margin-top: 48px;
}

/* RESPONSIVE */
@media (max-width: 992px) {
  .content-section {
    padding: 60px 16px;
  }
  
  .section-container {
    padding: 0 8px;
  }
}

@media (max-width: 768px) {
  .hero-section {
    min-height: 400px;
    padding: 60px 16px 60px;
  }
  
  .hero-title {
    font-size: 28px;
  }
  
  .hero-subtitle-main {
    font-size: 24px;
  }
  
  .hero-description {
    font-size: 16px;
  }
  
  .hero-actions {
    flex-direction: column;
    width: 100%;
    max-width: 300px;
    margin: 0 auto;
  }
  
  .hero-actions .btn {
    width: 100%;
  }
  
  .section-title {
    font-size: 28px;
  }
  
  .stats-section .section-title {
    font-size: 28px;
  }
  
  .content-section {
    padding: 48px 12px;
  }
  
  .section-subtitle {
    margin-bottom: 32px;
  }
  
  .cards-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .process-cards {
    grid-template-columns: 1fr;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
  
  .stat-card {
    padding: 24px 16px;
  }
  
  .stat-value {
    font-size: 28px;
  }
}

@media (max-width: 480px) {
  .hero-section {
    min-height: 350px;
    padding: 48px 12px 48px;
  }
  
  .hero-title {
    font-size: 22px;
  }
  
  .hero-subtitle-main {
    font-size: 18px;
  }
  
  .hero-description {
    font-size: 14px;
  }
  
  .section-title {
    font-size: 22px;
  }
  
  .stats-section .section-title {
    font-size: 22px;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .section-label {
    font-size: 12px;
  }
}
</style>
