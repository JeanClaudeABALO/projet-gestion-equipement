<template>
  <div 
    class="stat-card" 
    :class="cardClass"
    :style="{ cursor: clickable ? 'pointer' : 'default' }"
    @click="handleClick"
  >
    <div class="icon">📊</div>
    <div class="content">
      <div class="label">{{ title }}</div>
      <div class="value">{{ value }}</div>
      <div v-if="clickable" class="click-hint">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
          <polyline points="15 3 21 3 21 9"></polyline>
          <line x1="10" y1="14" x2="21" y2="3"></line>
        </svg>
        Cliquer pour plus de détails
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  title: { type: String, default: "" },
  value: { type: [Number, String], default: 0 },
  type: { type: String, default: "default" }, // default, fonctionnel, non_fonctionnel, reparation, manquant
  clickable: { type: Boolean, default: false }
});

const emit = defineEmits(['click']);

// Toutes les cards utilisent maintenant le même logo (📊)

const cardClass = computed(() => {
  return `stat-card-${props.type}`;
});

function handleClick() {
  if (props.clickable) {
    emit('click', props.type);
  }
}
</script>

<style scoped>
.stat-card {
  background: linear-gradient(135deg, #ffffff 0%, #f8fbff 100%);
  border: 2px solid #e6eef8;
  padding: 32px;
  border-radius: 24px;
  width: 220px;
  height: 220px;
  aspect-ratio: 1;
  box-shadow: 0 4px 12px rgba(12, 45, 90, 0.08), 0 2px 4px rgba(12, 45, 90, 0.04);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  animation: fadeInUp 0.5s ease-out;
  position: relative;
  overflow: hidden;
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: transparent;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-6px) scale(1.02);
  box-shadow: 0 8px 24px rgba(12, 45, 90, 0.15), 0 4px 8px rgba(12, 45, 90, 0.08);
  border-color: #e6eef8;
}

.stat-card[style*="cursor: pointer"]:hover {
  border-color: #1a6fd4;
  background: linear-gradient(135deg, #ffffff 0%, #f0f7ff 100%);
}

.stat-card:hover::before {
  opacity: 0;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.icon {
  font-size: 56px;
  line-height: 1;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
  transition: transform 0.3s ease;
}

.stat-card:hover .icon {
  transform: scale(1.1) rotate(5deg);
}

.content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  width: 100%;
}

.label {
  color: #64748b;
  font-size: 14px;
  margin-bottom: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-family: 'Inter', 'Segoe UI', 'Roboto', -apple-system, BlinkMacSystemFont, sans-serif;
}

.value {
  font-size: 42px;
  font-weight: 800;
  color: #1a6fd4;
  line-height: 1.2;
  font-family: 'Inter', 'Segoe UI', 'Roboto', -apple-system, BlinkMacSystemFont, sans-serif;
  letter-spacing: -1px;
}

.click-hint {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin-top: 12px;
  font-size: 11px;
  color: #64748b;
  font-weight: 500;
  opacity: 0.7;
  transition: all 0.3s ease;
  text-align: center;
  line-height: 1.4;
}

.click-hint svg {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
}

.stat-card:hover .click-hint {
  opacity: 1;
  color: #1a6fd4;
  transform: translateY(-2px);
}

/* Toutes les cards utilisent maintenant le même style sans couleurs spécifiques */
.stat-card-fonctionnel,
.stat-card-non_fonctionnel,
.stat-card-reparation,
.stat-card-manquant {
  /* Pas de couleurs spécifiques - utilise le style par défaut */
}
</style>
