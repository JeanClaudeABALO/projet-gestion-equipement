<template>
  <div class="unit-list">
    <div v-if="loading" class="loading">
      <p>Chargement des unités...</p>
    </div>
    
    <div v-else-if="units.length === 0" class="empty">
      <p>Aucune unité dans ce département</p>
    </div>
    
    <div v-else class="units-grid">
      <div 
        v-for="unit in units" 
        :key="unit.id"
        class="unit-item"
        :class="{ 'is-expanded': expandedUnit === unit.id }"
        @click="toggleUnit(unit.id)"
      >
        <div class="unit-header">
          <div class="unit-info">
            <h4 class="unit-name">
              <span class="icon">🏢</span>
              {{ unit.nom }}
            </h4>
            <div class="unit-stats">
              <span class="equipment-count">{{ unit.totalEquipements }} équipements</span>
              <span v-if="unit.nonFonctionnels > 0" class="alert-badge">
                {{ unit.nonFonctionnels }} non fonctionnels
              </span>
            </div>
          </div>
          <span class="expand-icon" :class="{ 'rotated': expandedUnit === unit.id }">▼</span>
        </div>
        
        <div v-if="expandedUnit === unit.id" class="unit-content">
          <slot :unit="unit"></slot>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, defineProps, defineEmits } from 'vue';

const props = defineProps({
  units: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['unit-click']);

const expandedUnit = ref(null);

function toggleUnit(unitId) {
  if (expandedUnit.value === unitId) {
    expandedUnit.value = null;
  } else {
    expandedUnit.value = unitId;
    emit('unit-click', unitId);
  }
}
</script>

<style scoped>
.unit-list {
  width: 100%;
}

.loading, .empty {
  text-align: center;
  padding: 40px;
  color: #a0aec0;
  font-style: italic;
}

.units-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.unit-item {
  background: #f7fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.unit-item:hover {
  background: #edf2f7;
  border-color: #0a5bc4;
}

.unit-item.is-expanded {
  background: white;
  border-color: #0a5bc4;
  box-shadow: 0 2px 8px rgba(10, 91, 196, 0.1);
}

.unit-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.unit-info {
  flex: 1;
}

.unit-name {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: #2d3748;
}

.icon {
  font-size: 18px;
}

.unit-stats {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 13px;
}

.equipment-count {
  color: #718096;
}

.alert-badge {
  background: #fee2e2;
  color: #dc2626;
  padding: 4px 10px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 12px;
}

.expand-icon {
  font-size: 10px;
  color: #718096;
  transition: transform 0.3s ease;
}

.expand-icon.rotated {
  transform: rotate(180deg);
}

.unit-content {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e2e8f0;
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

