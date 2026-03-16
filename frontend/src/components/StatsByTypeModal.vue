<template>
  <transition name="slide-down">
    <div class="modal-backdrop" @click.self="$emit('close')">
      <div class="modal">
        <div class="modal-header">
          <h3 class="title">{{ modalTitle }}</h3>
          <button class="close-btn" @click="$emit('close')">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div v-if="loading" class="loading-container">
          <p>Chargement des détails...</p>
        </div>

        <div v-else-if="statsByType.length === 0" class="empty-container">
          <p>Aucun équipement trouvé</p>
        </div>

        <div v-else class="stats-list">
          <div 
            v-for="stat in statsByType" 
            :key="stat.type_id" 
            class="stat-item"
          >
            <div class="stat-item-content">
              <div class="stat-item-label">{{ stat.type_nom }}</div>
              <div class="stat-item-value">{{ formatNumber(stat.total) }}</div>
            </div>
            <div class="stat-item-bar">
              <div 
                class="stat-item-bar-fill" 
                :style="{ width: getPercentage(stat.total, totalAll) + '%' }"
              ></div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="close-button" @click="$emit('close')">
            Fermer
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import api from "../api/axios";

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  type: {
    type: String,
    default: null // null pour total, ou 'fonctionnel', 'non_fonctionnel', etc.
  },
  isPointFocal: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(["close"]);

const loading = ref(false);
const statsByType = ref([]);

const modalTitle = computed(() => {
  if (props.type) {
    const labels = {
      fonctionnel: "Équipements fonctionnels",
      non_fonctionnel: "Équipements non fonctionnels",
      reparation: "Équipements en réparation",
      manquant: "Équipements manquants"
    };
    return labels[props.type] || props.title;
  }
  return props.title;
});

const totalAll = computed(() => {
  return statsByType.value.reduce((sum, stat) => sum + stat.total, 0);
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
    const endpoint = props.isPointFocal 
      ? "/dashboard/point-focal/stats-by-type"
      : "/dashboard/stats-by-type";
    
    const params = props.type ? { etat: props.type } : {};
    const response = await api.get(endpoint, { params });
    
    statsByType.value = response.data || [];
  } catch (error) {
    console.error("Erreur lors du chargement des statistiques par type:", error);
    statsByType.value = [];
  } finally {
    loading.value = false;
  }
}

watch([() => props.type, () => props.isPointFocal], () => {
  loadStats();
}, { immediate: true });
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

.modal {
  background: #fff;
  width: 600px;
  max-width: 90vw;
  max-height: 80vh;
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0,0,0,.15);
  display: flex;
  flex-direction: column;
  font-family: 'Inter', 'Segoe UI', 'Roboto', -apple-system, BlinkMacSystemFont, sans-serif;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 32px;
  border-bottom: 1px solid #e2e8f0;
}

.title {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  color: #1a202c;
  font-family: 'Inter', sans-serif;
  letter-spacing: -0.3px;
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  transition: color 0.2s;
  border-radius: 8px;
}

.close-btn:hover {
  color: #1a202c;
  background: #f1f5f9;
}

.close-btn svg {
  width: 20px;
  height: 20px;
}

.loading-container,
.empty-container {
  padding: 48px 32px;
  text-align: center;
  color: #64748b;
}

.stats-list {
  padding: 24px 32px;
  overflow-y: auto;
  flex: 1;
}

.stat-item {
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e2e8f0;
}

.stat-item:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.stat-item-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.stat-item-label {
  font-size: 16px;
  font-weight: 600;
  color: #1a202c;
}

.stat-item-value {
  font-size: 20px;
  font-weight: 700;
  color: #1a6fd4;
}

.stat-item-bar {
  height: 8px;
  background: #e2e8f0;
  border-radius: 4px;
  overflow: hidden;
}

.stat-item-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #1a6fd4, #0f4a7a);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.modal-footer {
  padding: 20px 32px;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: flex-end;
}

.close-button {
  background: linear-gradient(135deg, #1a6fd4 0%, #0f4a7a 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 10px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  font-family: 'Inter', sans-serif;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(26, 111, 212, 0.2);
}

.close-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(26, 111, 212, 0.3);
}

.slide-down-enter-active {
  animation: slideDown 0.35s ease-out;
}
.slide-down-leave-active {
  animation: slideUp 0.25s ease-in;
}

@keyframes slideDown {
  from {
    transform: translateY(-60px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    transform: translateY(0);
    opacity: 1;
  }
  to {
    transform: translateY(-40px);
    opacity: 0;
  }
}
</style>

