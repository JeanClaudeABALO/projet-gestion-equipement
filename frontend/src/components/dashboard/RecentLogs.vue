<template>
  <div class="recent-logs">
    <h3 class="section-title">
      <span class="icon">📝</span>
      Dernières modifications
    </h3>
    
    <div class="logs-container">
      <div v-if="logs.length === 0" class="empty-logs">
        <p>Aucune modification récente</p>
      </div>
      
      <div v-else class="logs-list">
        <div 
          v-for="log in logs" 
          :key="log.id" 
          class="log-item"
        >
          <div class="log-date">{{ formatDate(log.date_modif) }}</div>
          <div class="log-content">
            <span class="user">{{ log.user_nom || "Utilisateur" }}</span>
            <span class="separator">:</span>
            <span class="change">
              <span class="old-state">{{ formatEtat(log.ancien_etat) }}</span>
              <span class="arrow">→</span>
              <span class="new-state" :class="getEtatClass(log.nouveau_etat)">
                {{ formatEtat(log.nouveau_etat) }}
              </span>
            </span>
          </div>
          <div v-if="log.commentaire" class="log-comment">
            {{ log.commentaire }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue';

const props = defineProps({
  logs: {
    type: Array,
    default: () => []
  }
});

function formatDate(date) {
  if (!date) return "-";
  const d = new Date(date);
  return d.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function formatEtat(etat) {
  const etats = {
    fonctionnel: "Fonctionnel",
    non_fonctionnel: "Non fonctionnel",
    reparation: "En réparation",
    manquant: "Manquant",
    vetuste: "Vétuste"
  };
  return etats[etat] || etat;
}

function getEtatClass(etat) {
  return `etat-${etat}`;
}
</script>

<style scoped>
.recent-logs {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  height: 100%;
  display: flex;
  flex-direction: column;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 16px 0;
  font-size: 18px;
  font-weight: 600;
  color: #1a202c;
}

.icon {
  font-size: 20px;
}

.logs-container {
  flex: 1;
  overflow-y: auto;
}

.empty-logs {
  text-align: center;
  padding: 40px;
  color: #a0aec0;
  font-style: italic;
}

.logs-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.log-item {
  padding: 12px;
  background: #f7fafc;
  border-radius: 8px;
  border-left: 3px solid #0a5bc4;
  transition: all 0.2s;
}

.log-item:hover {
  background: #edf2f7;
  transform: translateX(4px);
}

.log-date {
  font-size: 11px;
  color: #718096;
  margin-bottom: 6px;
  font-weight: 500;
}

.log-content {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  font-size: 14px;
}

.user {
  font-weight: 600;
  color: #2d3748;
}

.separator {
  color: #a0aec0;
}

.change {
  display: flex;
  align-items: center;
  gap: 6px;
}

.old-state {
  color: #718096;
  text-decoration: line-through;
}

.arrow {
  color: #0a5bc4;
  font-weight: bold;
}

.new-state {
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 4px;
}

.etat-fonctionnel {
  color: #059669;
  background: #d1fae5;
}

.etat-non_fonctionnel {
  color: #dc2626;
  background: #fee2e2;
}

.etat-reparation {
  color: #d97706;
  background: #fef3c7;
}

.etat-manquant {
  color: #4b5563;
  background: #e5e7eb;
}

.log-comment {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid #e2e8f0;
  font-size: 12px;
  color: #718096;
  font-style: italic;
}
</style>

