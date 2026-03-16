<template>
  <div class="equipment-state-table">
    <table class="state-table">
      <thead>
        <tr>
          <th>Équipement</th>
          <th class="state-col fonctionnel">Fonctionnel</th>
          <th class="state-col non-fonctionnel">Non fonct.</th>
          <th class="state-col reparation">En réparation</th>
          <th class="state-col manquant">Manquant</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(equipment, index) in groupedEquipments" :key="index">
          <td class="equipment-name">
            <span class="type-icon">📋</span>
            {{ equipment.type }}
          </td>
          <td class="state-col fonctionnel">
            <span v-if="equipment.fonctionnel > 0" class="badge fonctionnel">
              {{ equipment.fonctionnel }}
            </span>
            <span v-else class="zero">-</span>
          </td>
          <td class="state-col non-fonctionnel">
            <span v-if="equipment.non_fonctionnel > 0" class="badge non-fonctionnel">
              {{ equipment.non_fonctionnel }}
            </span>
            <span v-else class="zero">-</span>
          </td>
          <td class="state-col reparation">
            <span v-if="equipment.reparation > 0" class="badge reparation">
              {{ equipment.reparation }}
            </span>
            <span v-else class="zero">-</span>
          </td>
          <td class="state-col manquant">
            <span v-if="equipment.manquant > 0" class="badge manquant">
              {{ equipment.manquant }}
            </span>
            <span v-else class="zero">-</span>
          </td>
        </tr>
        
        <tr v-if="groupedEquipments.length === 0">
          <td colspan="5" class="empty-message">
            Aucun équipement dans cette unité
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { computed, defineProps } from 'vue';

const props = defineProps({
  equipments: {
    type: Array,
    default: () => []
  }
});

const groupedEquipments = computed(() => {
  const grouped = {};
  
  props.equipments.forEach(equip => {
    const type = equip.type_nom || equip.type || 'Inconnu';
    
    if (!grouped[type]) {
      grouped[type] = {
        type: type,
        fonctionnel: 0,
        non_fonctionnel: 0,
        reparation: 0,
        manquant: 0
      };
    }
    
    const etat = equip.etat || 'fonctionnel';
    const quantite = equip.quantite || 1;
    
    if (grouped[type][etat] !== undefined) {
      grouped[type][etat] += quantite;
    }
  });
  
  return Object.values(grouped);
});
</script>

<style scoped>
.equipment-state-table {
  width: 100%;
  overflow-x: auto;
}

.state-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 8px;
  overflow: hidden;
}

.state-table thead {
  background: #f7fafc;
}

.state-table th {
  padding: 12px;
  text-align: center;
  font-weight: 600;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #4a5568;
  border-bottom: 2px solid #e2e8f0;
}

.state-table th:first-child {
  text-align: left;
}

.state-table td {
  padding: 12px;
  text-align: center;
  border-bottom: 1px solid #e2e8f0;
}

.equipment-name {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #2d3748;
  text-align: left;
}

.type-icon {
  font-size: 16px;
}

.badge {
  display: inline-block;
  padding: 6px 12px;
  border-radius: 6px;
  font-weight: 700;
  font-size: 14px;
  min-width: 40px;
}

.badge.fonctionnel {
  background: #d1fae5;
  color: #059669;
}

.badge.non-fonctionnel {
  background: #fee2e2;
  color: #dc2626;
}

.badge.reparation {
  background: #fef3c7;
  color: #d97706;
}

.badge.manquant {
  background: #e5e7eb;
  color: #4b5563;
}

.zero {
  color: #cbd5e0;
  font-size: 14px;
}

.state-col.fonctionnel {
  background: rgba(16, 185, 129, 0.05);
}

.state-col.non-fonctionnel {
  background: rgba(239, 68, 68, 0.05);
}

.state-col.reparation {
  background: rgba(245, 158, 11, 0.05);
}

.state-col.manquant {
  background: rgba(107, 114, 128, 0.05);
}

.empty-message {
  text-align: center;
  padding: 40px;
  color: #a0aec0;
  font-style: italic;
}
</style>

