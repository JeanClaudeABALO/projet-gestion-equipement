<template>
  <footer class="footer">
    <div class="footer-inner">
      <div class="footer-column">
        <h3>Centre de Documentation</h3>
        <p>de Sécurité Publique</p>
        <p class="footer-subtitle">République du Bénin</p>
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
import { useAppFooter } from "../scripts/AppFooter.js";

const { year } = useAppFooter();
</script>
<style scoped src="../styles/AppFooter.css"></style>
