<template>
  <div class="reparations-pf-page">
    <!-- HEADER -->
    <div class="header-bar">
      <h1>Réparations de mon département</h1>
      <button class="add-btn" @click="showModal = true">
        <span>＋</span> Déclarer une panne
      </button>
    </div>

    <!-- TABLEAU -->
    <div class="table-card">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Unité</th>
            <th>Équipement</th>
            <th>Description</th>
            <th>Statut</th>
            <th>Déclarée le</th>
            <th>Résolue le</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in reparations" :key="r.id">
            <td>{{ r.id }}</td>
            <td>{{ r.unite_nom }}</td>
            <td>#{{ r.equipement_id }}</td>
            <td class="desc">{{ r.description || "-" }}</td>
            <td>
              <span :class="['badge', getStatutClass(r.statut)]">
                {{ getStatutLabel(r.statut) }}
              </span>
            </td>
            <td class="date">{{ formatDate(r.date_demande) }}</td>
            <td class="date">{{ formatDate(r.date_resolution) }}</td>
          </tr>

          <tr v-if="reparations.length === 0">
            <td colspan="7" class="empty">Aucune réparation trouvée</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal déclaration de panne -->
    <div v-if="showModal" class="modal-backdrop" @click.self="closeModal">
      <div class="modal">
        <h3>Déclarer une panne</h3>

        <div class="form-group">
          <label>Équipement *</label>
          <select v-model="form.equipement_id" required>
            <option value="">-- Sélectionner un équipement --</option>
            <option
              v-for="e in equipements"
              :key="e.id"
              :value="e.id"
            >
              #{{ e.id }} - {{ e.unite_nom }} / {{ e.type_nom }} ({{ getEtatLabel(e.etat) }})
            </option>
          </select>
        </div>

        <div class="form-group">
          <label>Description de la panne *</label>
          <textarea
            v-model="form.description"
            rows="3"
            placeholder="Décrire le problème rencontré..."
          ></textarea>
        </div>

        <div class="modal-actions">
          <button class="btn-cancel" @click="closeModal">Annuler</button>
          <button class="btn-confirm" @click="submit">Enregistrer</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import reparationsApi from "../api/reparations";
import equipementApi from "../api/equipement";

const reparations = ref([]);
const equipements = ref([]);
const showModal = ref(false);
const form = ref({
  equipement_id: "",
  description: "",
});

async function loadData() {
  try {
    const [r, e] = await Promise.all([
      reparationsApi.getByDepartement(),
      equipementApi.getByDepartement(),
    ]);

    reparations.value = r.data || [];
    equipements.value = e.data || [];
  } catch (error) {
    console.error("Erreur chargement réparations PF:", error);
    alert("Erreur lors du chargement des réparations.");
  }
}

function getStatutClass(statut) {
  const map = {
    ouvert: "status-open",
    en_cours: "status-progress",
    termine: "status-done",
    annule: "status-cancel",
  };
  return map[statut] || "status-open";
}

function getStatutLabel(statut) {
  const map = {
    ouvert: "Déclarée",
    en_cours: "En cours",
    termine: "Terminée",
    annule: "Annulée",
  };
  return map[statut] || statut;
}

function getEtatLabel(etat) {
  const map = {
    fonctionnel: "Fonctionnel",
    non_fonctionnel: "Non fonctionnel",
    reparation: "En réparation",
    manquant: "Manquant",
    vetuste: "Vétuste",
  };
  return map[etat] || etat;
}

function formatDate(d) {
  if (!d) return "-";
  return new Date(d).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function closeModal() {
  showModal.value = false;
  form.value = { equipement_id: "", description: "" };
}

async function submit() {
  if (!form.value.equipement_id || !form.value.description) {
    alert("Veuillez sélectionner un équipement et décrire la panne.");
    return;
  }

  try {
    await reparationsApi.create({
      equipement_id: form.value.equipement_id,
      description: form.value.description,
    });
    alert("Panne déclarée avec succès.");
    closeModal();
    await loadData();
  } catch (error) {
    console.error("Erreur création réparation:", error);
    alert(error.response?.data?.message || "Erreur lors de la déclaration.");
  }
}

onMounted(loadData);
</script>

<style scoped>
.reparations-pf-page {
  margin-left: 240px;
  padding: 30px;
  background: #eef2f7;
  min-height: 100vh;
}

.header-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.add-btn {
  background: #16a34a;
  color: white;
  border: none;
  padding: 10px 18px;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  gap: 8px;
}

.table-card {
  background: white;
  border-radius: 14px;
  box-shadow: 0 12px 25px rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

table {
  width: 100%;
  border-collapse: collapse;
}

thead {
  background: linear-gradient(90deg, #0a5bc4, #09315c);
}

thead th {
  color: white;
  padding: 12px;
  font-size: 13px;
  text-align: left;
}

tbody td {
  padding: 12px;
  border-bottom: 1px solid #e5e7eb;
  font-size: 14px;
}

.desc {
  max-width: 260px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.date {
  font-size: 12px;
  color: #6b7280;
}

.empty {
  text-align: center;
  padding: 30px;
  color: #9ca3af;
}

.badge {
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
}

.status-open {
  background: #fef3c7;
  color: #92400e;
}

.status-progress {
  background: #dbeafe;
  color: #1d4ed8;
}

.status-done {
  background: #d1fae5;
  color: #065f46;
}

.status-cancel {
  background: #fee2e2;
  color: #b91c1c;
}

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
  background: white;
  padding: 24px;
  border-radius: 12px;
  width: 90%;
  max-width: 520px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
}

.modal h3 {
  margin: 0 0 12px 0;
}

.form-group {
  margin-bottom: 14px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-size: 13px;
  font-weight: 600;
  color: #374151;
}

.form-group select,
.form-group textarea {
  width: 100%;
  padding: 8px 10px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  font-size: 14px;
  box-sizing: border-box;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 12px;
}

.btn-cancel {
  padding: 8px 14px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  background: #f9fafb;
  cursor: pointer;
}

.btn-confirm {
  padding: 8px 16px;
  border-radius: 8px;
  border: none;
  background: #0a5bc4;
  color: white;
  cursor: pointer;
}
</style>

{
  "cells": [],
  "metadata": {
    "language_info": {
      "name": "python"
    }
  },
  "nbformat": 4,
  "nbformat_minor": 2
}