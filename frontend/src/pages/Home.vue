<template>
  <div class="home-container">

    <AppHeader />

    

    <!-- HERO SECTION -->
<section class="hero">
  <div class="hero-overlay"></div>

  <div class="hero-content">
    <h1 class="hero-title">
      {{ animatedTitle }}
      <span class="cursor">|</span>
    </h1>

    <p class="hero-subtitle">
      Suivi, traçabilité et optimisation des équipements du Ministère de la Santé
    </p>

    <div class="hero-actions">
      <button class="btn primary" @click="$router.push('/login')">
        Se connecter
      </button>
      <button 
        v-if="!adminExists" 
        class="btn secondary" 
        @click="showAdminModal = true"
      >
        Inscription Admin
      </button>
    </div>
  </div>
</section>
   <!-- Bande image d'introduction -->
    <section class="intro-banner">
      <div class="overlay"></div>
    </section>
   

    <!-- SECTION UTILITÉ -->
<section class="features">
  <h2 class="section-title">
    À quoi sert la plateforme ?
  </h2>

  <p class="section-subtitle">
    Un outil centralisé pour mieux gérer, suivre et optimiser les équipements sanitaires
  </p>

  <div class="features-grid">
    <div class="feature-card">
      <div class="icon">📊</div>
      <h3>Suivi des équipements</h3>
      <p>
        Visualisez en temps réel l’état et la disponibilité des équipements
        sur l’ensemble du territoire.
      </p>
    </div>

    <div class="feature-card">
      <div class="icon">🏥</div>
      <h3>Gestion par département et unité</h3>
      <p>
        Organisation claire des équipements par département, hôpital
        et unité sanitaire.
      </p>
    </div>

    <div class="feature-card">
      <div class="icon">🔁</div>
      <h3>Traçabilité des mouvements</h3>
      <p>
        Historique complet des transferts, affectations et mises à jour
        des équipements.
      </p>
    </div>

    <div class="feature-card">
      <div class="icon">🛠️</div>
      <h3>Pannes et réparations</h3>
      <p>
        Déclaration rapide des pannes, suivi des réparations et réduction
        des temps d’indisponibilité.
      </p>
    </div>
  </div>
</section>

<!-- SECTION ROLES -->
<section class="roles">
  <h2 class="section-title">
    Les rôles utilisateurs
  </h2>

  <p class="section-subtitle">
    Une plateforme structurée autour de responsabilités claires et bien définies
  </p>

  <div class="roles-grid">
    <!-- ADMIN -->
    <div class="role-card admin">
      <div class="role-header">
        <span class="role-icon">🛡️</span>
        <h3>Administrateur</h3>
      </div>

      <p class="role-desc">
        Responsable de la gestion nationale et de la supervision globale
        des équipements sanitaires.
      </p>

      <ul class="role-list">
        <li>Gestion des départements et unités</li>
        <li>Supervision des équipements</li>
        <li>Consultation des statistiques nationales</li>
        <li>Suivi des mouvements et réparations</li>
      </ul>
    </div>

    <!-- POINT FOCAL -->
    <div class="role-card pf">
      <div class="role-header">
        <span class="role-icon">👨‍⚕️</span>
        <h3>Point Focal</h3>
      </div>

      <p class="role-desc">
        Acteur clé au niveau départemental pour le suivi opérationnel
        des équipements.
      </p>

      <ul class="role-list">
        <li>Suivi des équipements du département</li>
        <li>Déclaration des pannes</li>
        <li>Mise à jour de l’état des équipements</li>
        <li>Transmission des informations terrain</li>
      </ul>
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

<script>
import AppHeader from "../components/AppHeader.vue";
import AppFooter from "../components/AppFooter.vue";
import AdminRegisterModal from "../components/AdminRegisterModal.vue";
import authApi from "../api/auth";

export default {
  name: "Home",
  components: { AppHeader, AppFooter, AdminRegisterModal },

  data() {
    return {
      fullTitle: "Plateforme nationale de gestion des équipements.",
      animatedTitle: "",
      index: 0,
      adminExists: false,
      showAdminModal: false
    };
  },

  async mounted() {
    this.typeWriter();
    await this.checkAdminExists();
  },

  methods: {
    typeWriter() {
      if (this.index < this.fullTitle.length) {
        this.animatedTitle += this.fullTitle[this.index];
        this.index++;
        setTimeout(this.typeWriter, 60);
      }
    },

    async checkAdminExists() {
      try {
        const res = await authApi.checkAdminExists();
        this.adminExists = res.data.exists;
      } catch (error) {
        console.error("Erreur vérification admin:", error);
        // En cas d'erreur, on assume qu'un admin existe pour la sécurité
        this.adminExists = true;
      }
    },

    handleAdminRegistered() {
      this.adminExists = true;
      this.showAdminModal = false;
      alert("Administrateur créé avec succès ! Vous pouvez maintenant vous connecter.");
    },

    goToLogin(role) {
      this.$router.push({
        name: "login",
        query: { role }
      });
    }
  }
};
</script>

<style scoped>
.home-container {
  width: 100%;
  font-family: Arial, sans-serif;
}

/* ===== Texte accueil ===== */
.intro {
  margin: 40px auto 20px;
  max-width: 600px;
  font-size: 16px;
  color: #555;
  text-align: center;
}

.intro h2 {
  font-size: 26px;
  margin-bottom: 10px;
  color: #2c3e50;
}

/* ===== Boutons rôles ===== */
.role-buttons {
  margin: 40px 0 60px;
  display: flex;
  justify-content: center;
  gap: 20px;
}

.role-btn {
  padding: 15px 25px;
  font-size: 18px;
  border: none;
  cursor: pointer;
  border-radius: 8px;
  font-weight: bold;
  transition: 0.3s;
}

.role-btn.admin {
  background-color: #2c3e50;
  color: white;
}

.role-btn.pf {
  background-color: #3498db;
  color: white;
}

.role-btn:hover {
  transform: scale(1.05);
}

/* ===== HERO ===== */
.hero {
  position: relative;
  height: 320px;
  background-image: url("cdsp.jpg");
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background: rgba(7, 59, 117, 0.65);
}

.hero-content {
  position: relative;
  z-index: 2;
  text-align: center;
  max-width: 900px;
  padding: 0 20px;
}

.hero-title {
  color: #fff;
  font-size: 36px;
  font-weight: bold;
  margin-bottom: 15px;
  min-height: 50px;
  font-family: 'Lucida Sans', 'Lucida Sans Regular', 'Lucida Grande', 'Lucida Sans Unicode', Geneva, Verdana, sans-serif;
}

.cursor {
  animation: blink 1s infinite;
}

@keyframes blink {
  0%, 50%, 100% { opacity: 1; }
  25%, 75% { opacity: 0; }
}

.hero-subtitle {
  color: #e6edf7;
  font-size: 18px;
  margin-bottom: 25px;
}

.hero-actions {
  display: flex;
  justify-content: center;
  gap: 15px;
}

/* Boutons */
.btn {
  padding: 12px 22px;
  font-size: 16px;
  border-radius: 6px;
  cursor: pointer;
  border: none;
  transition: 0.3s;
}

.btn.primary {
  background: #0a5bc4;
  color: white;
}

.btn.secondary {
  background: transparent;
  border: 2px solid #fff;
  color: #fff;
}

.btn:hover {
  transform: scale(1.05);
}

/* ===== SECTION FEATURES ===== */
.features {
  padding: 70px 20px;
  background-color: #f6f8fc;
  text-align: center;
}

.section-title {
  font-size: 32px;
  font-weight: bold;
  margin-bottom: 10px;
  color: #1f2d3d;
}

.section-subtitle {
  font-size: 16px;
  color: #666;
  max-width: 700px;
  margin: 0 auto 50px auto;
}

/* GRID */
.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 30px;
  max-width: 1100px;
  margin: 0 auto;
}

/* CARD */
.feature-card {
  background: white;
  border-radius: 18px;
  padding: 30px 25px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 18px 35px rgba(0, 0, 0, 0.12);
}

.feature-card .icon {
  font-size: 42px;
  margin-bottom: 15px;
}

.feature-card h3 {
  font-size: 18px;
  margin-bottom: 12px;
  color: #0a5bc4;
}

.feature-card p {
  font-size: 15px;
  color: #555;
  line-height: 1.6;
}


/* ===== SECTION ROLES ===== */
.roles {
  padding: 80px 20px;
  background: linear-gradient(180deg, #ffffff, #eef3fa);
  text-align: center;
}

.roles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 40px;
  max-width: 1100px;
  margin: 50px auto 0;
}

/* CARD */
.role-card {
  background: white;
  border-radius: 22px;
  padding: 35px 30px;
  text-align: left;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.08);
  transition: transform 0.35s ease, box-shadow 0.35s ease;
}

.role-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.12);
}

/* HEADER */
.role-header {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 15px;
}

.role-icon {
  font-size: 42px;
}

.role-card h3 {
  font-size: 22px;
  color: #1f2d3d;
}

/* DESCRIPTION */
.role-desc {
  font-size: 15px;
  color: #555;
  margin-bottom: 20px;
  line-height: 1.6;
}

/* LISTE */
.role-list {
  list-style: none;
  padding: 0;
}

.role-list li {
  padding-left: 22px;
  margin-bottom: 10px;
  position: relative;
  font-size: 15px;
  color: #333;
}

.role-list li::before {
  content: "✔";
  position: absolute;
  left: 0;
  color: #0a5bc4;
  font-weight: bold;
}

/* THEMES */
.role-card.admin {
  border-top: 6px solid #2c3e50;
}

.role-card.pf {
  border-top: 6px solid #3498db;
}

</style>
