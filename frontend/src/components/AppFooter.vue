<template>
  <footer class="footer">

    <!-- Bande bleu foncé -->
    <div class="footer-inner">
      <div class="footer-column">
        <h3>Plateforme des Équipements</h3>
        <p>
          Système national de gestion et suivi des équipements médicaux du Bénin.
        </p>
      </div>

      <div class="footer-column">
        <h3>Liens</h3>
        <ul>
          <li @click="$router.push('/')">Accueil</li>
          <li @click="$router.push('/equipements')">Équipements</li>
          <li @click="$router.push('/departements')">Par département</li>
          <li @click="$router.push('/unites')">Par unité</li>
        </ul>
      </div>

      <div class="footer-column">
        <h3>Contact</h3>
        <p>Ministère de la Santé</p>
        <p>Email : support@ms.bj</p>
        <p>Tél : +229 21 00 00 00</p>
      </div>
    </div>

    <!-- Bande du bas -->
    <div class="footer-bottom">
      © {{ year }} République du Bénin — Tous droits réservés
    </div>

  </footer>
</template>

<script setup>
const year = new Date().getFullYear();
</script>

<style scoped>
/* Bande bleue full-width */
.footer {
  width: 100%;
  background-color: #073b75;
  color: white;
  padding: 20px;
  margin-top: auto; /* important si layout flex */
  flex-shrink: 0;
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
  background-color: #052649;
  text-align: center;
  padding: 10px;
  font-size: 13px;
  opacity: 0.9;
}
</style>
