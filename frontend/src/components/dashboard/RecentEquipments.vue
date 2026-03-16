<template>
  <div class="recent-equipments">
    <h3 class="section-title">
      <span class="icon">📦</span>
      Derniers équipements ajoutés
    </h3>
    
    <div class="table-container">
      <table class="equipment-table">
        <thead>
          <tr>
            <th>Équipement</th>
            <th>Unité</th>
            <th>Département</th>
            <th>Qté</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="equip in equipments" :key="equip.id" class="table-row">
            <td class="equipment-name">
              <span class="type-icon">📋</span>
              {{ equip.type_nom }}
            </td>
            <td>{{ equip.unite_nom }}</td>
            <td class="department">{{ equip.departement_nom }}</td>
            <td class="quantity">{{ equip.quantite }}</td>
            <td class="date">{{ formatDate(equip.date_maj) }}</td>
          </tr>
          
          <tr v-if="equipments.length === 0" class="empty-row">
            <td colspan="5" class="empty-message">
              Aucun équipement récent
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue';

const props = defineProps({
  equipments: {
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
</script>

<style scoped>
.recent-equipments {
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

.table-container {
  flex: 1;
  overflow-y: auto;
}

.equipment-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.equipment-table thead {
  background: #f7fafc;
  position: sticky;
  top: 0;
}

.equipment-table th {
  padding: 12px 8px;
  text-align: left;
  font-weight: 600;
  color: #4a5568;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 2px solid #e2e8f0;
}

.table-row {
  transition: background 0.2s;
}

.table-row:hover {
  background: #f7fafc;
}

.equipment-table td {
  padding: 12px 8px;
  border-bottom: 1px solid #e2e8f0;
  color: #2d3748;
}

.equipment-name {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
}

.type-icon {
  font-size: 16px;
}

.department {
  color: #718096;
  font-size: 13px;
}

.quantity {
  text-align: center;
  font-weight: 600;
  color: #0a5bc4;
}

.date {
  color: #718096;
  font-size: 12px;
  white-space: nowrap;
}

.empty-row {
  background: #f7fafc;
}

.empty-message {
  text-align: center;
  padding: 40px;
  color: #a0aec0;
  font-style: italic;
}
</style>

