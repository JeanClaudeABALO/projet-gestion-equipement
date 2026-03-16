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
import { useHome } from "../scripts/pages/Home.js";

const {
  AdminRegisterModal,
  isAnimated,
  stats,
  loadingStats,
  adminExists,
  loadingAdminCheck,
  showAdminModal,
  goToPlatform,
  formatNumber,
  handleAdminRegistered
} = useHome();
</script>
<style scoped src="../styles/pages/Home.css"></style>
