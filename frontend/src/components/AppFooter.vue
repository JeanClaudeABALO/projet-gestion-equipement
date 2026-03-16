<template>
  <footer class="footer">
    <!-- Bande bleu foncé -->
    <div class="footer-inner">
      <div class="footer-column">
        <h3>Centre de Documentation</h3>
        <p>de Sécurité Publique</p>
        <p class="footer-subtitle">
          République du Bénin
        </p>
      </div>

      <div class="footer-column">
        <h3>Contact</h3>
        <p>Email : contact@cdsp.bj</p>
        <p>Tél : 01 51 53 30 81</p>
        <p>Site : www.cdsp.com</p>
      </div>

      <div class="footer-column">
        <h3>Liens utiles</h3>
        <ul>
          <li @click="$router.push('/')">Accueil</li>
          <li @click="$router.push('/la-plateforme')">La Plateforme</li>
          <li @click="$router.push('/statistiques')">Statistiques</li>
          <li @click="$router.push('/contact')">Contact</li>
        </ul>
      </div>
    </div>

    <!-- Bande du bas -->
    <div class="footer-bottom">
      <div class="footer-bottom-content">
        <p>© {{ year }} Ministère de la Justice — République du Bénin — Tous droits réservés</p>
        <p class="footer-legal">
          <span @click="$router.push('/contact')" class="footer-link">Mentions légales</span>
        </p>
      </div>
    </div>
  </footer>
</template>

<script setup>
const year = new Date().getFullYear();
</script>

<style scoped>
/* Bande bleue full-width - position normale (pas fixed) */
.footer {
  width: 100%;
  background-color: #1a5a9e;
  color: white;
  padding: 20px;
  margin-top: auto; /* pousse en bas du flex container */
  flex-shrink: 0;
  position: relative; /* flux normal, jamais fixed */
}

/* Contenu centré et moins large */
.footer-inner {
  max-width: 1100px;  /* 🔥 largeur réduite */
  margin: auto;
  padding: 35px 20px;

  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 40px;
  flex-wrap: wrap;
}

.footer-column {
  flex: 1;
  min-width: 220px;
}

.footer-column h3 {
  color: #f1c40f;
  font-size: 18px;
  margin-bottom: 12px;
}

.footer-column p,
.footer-column li {
  font-size: 14px;
  opacity: 0.9;
  line-height: 1.4;
}

.footer-subtitle {
  font-size: 13px;
  opacity: 0.8;
  margin-top: 5px;
}

.footer-column ul {
  list-style: none;
  padding: 0;
}

.footer-column li {
  margin-bottom: 6px;
  cursor: pointer;
  transition: 0.3s;
}

.footer-column li:hover {
  color: #f1c40f;
}

/* Bande dessous */
.footer-bottom {
  width: 100%;
  background-color: #0f3d6e;
  padding: 15px 20px;
}

.footer-bottom-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 15px;
  font-size: 13px;
  opacity: 0.9;
  text-align: center;
}

.footer-legal {
  margin: 0;
}

.footer-link {
  cursor: pointer;
  text-decoration: underline;
  transition: color 0.3s ease;
}

.footer-link:hover {
  color: #f1c40f;
}

@media (max-width: 768px) {
  .footer-bottom-content {
    flex-direction: column;
    text-align: center;
  }
}
</style>
