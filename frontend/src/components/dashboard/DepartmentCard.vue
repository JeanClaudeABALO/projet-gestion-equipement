<template>
  <div 
    class="department-card" 
    :class="{ 'is-expanded': isExpanded }"
    @click="toggleExpand"
  >
    <div class="card-header">
      <div class="card-info">
        <h3 class="department-name">
          <span class="icon">🏛️</span>
          {{ department.nom }}
        </h3>
        <div class="stats">
          <span class="stat-item">
            <span class="stat-value">{{ stats.totalUnites }}</span>
            <span class="stat-label">unités</span>
          </span>
          <span class="stat-divider">•</span>
          <span class="stat-item">
            <span class="stat-value">{{ stats.totalEquipements }}</span>
            <span class="stat-label">équipements</span>
          </span>
        </div>
      </div>
      <div class="card-actions">
        <span class="expand-icon" :class="{ 'rotated': isExpanded }">▼</span>
      </div>
    </div>
    
    <div v-if="isExpanded" class="card-content">
      <slot></slot>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
  department: {
    type: Object,
    required: true
  },
  stats: {
    type: Object,
    default: () => ({
      totalUnites: 0,
      totalEquipements: 0
    })
  },
  isExpanded: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['click']);

function toggleExpand() {
  emit('click');
}
</script>

<style scoped>
.department-card {
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.department-card:hover {
  border-color: #1a6fd4;
  box-shadow: 0 4px 12px rgba(26, 111, 212, 0.1);
  transform: translateY(-2px);
}

.department-card.is-expanded {
  border-color: #1a6fd4;
  box-shadow: 0 4px 16px rgba(26, 111, 212, 0.15);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-info {
  flex: 1;
}

.department-name {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0 0 12px 0;
  font-size: 20px;
  font-weight: 700;
  color: #1a202c;
}

.icon {
  font-size: 24px;
}

.stats {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #718096;
  font-size: 14px;
}

.stat-item {
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.stat-value {
  font-weight: 700;
  font-size: 18px;
  color: #1a6fd4;
}

.stat-label {
  font-size: 13px;
}

.stat-divider {
  color: #cbd5e0;
}

.card-actions {
  display: flex;
  align-items: center;
}

.expand-icon {
  font-size: 12px;
  color: #718096;
  transition: transform 0.3s ease;
}

.expand-icon.rotated {
  transform: rotate(180deg);
}

.card-content {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 2px solid #e2e8f0;
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>

