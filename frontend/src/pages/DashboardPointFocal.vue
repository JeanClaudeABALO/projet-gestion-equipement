<template>
  <div class="pf-layout">
    <SidebarPointFocal />

    <main class="pf-content">
      <h1>Dashboard Point Focal</h1>
      <p class="subtitle">
        Département : <strong>{{ departementNom }}</strong>
      </p>

      <!-- STATISTIQUES -->
      <div class="stats-row">
        <StatCard title="Total équipements" :value="stats.total" />
        <StatCard title="Fonctionnels" :value="stats.fonctionnels" />
        <StatCard title="Non fonctionnels" :value="stats.nonFonctionnels" />
        <StatCard title="En réparation" :value="stats.enReparation" />
        <StatCard title="Manquants" :value="stats.manquants" />
      </div>

      <!-- TABLE ÉQUIPEMENTS -->
      <section class="section">
        <div class="section-header">
          <h3>Équipements du département</h3>
          <button class="btn-export">📥 Télécharger</button>
        </div>

        <table class="table">
          <thead>
            <tr>
              <th>Unité</th>
              <th>Type</th>
              <th>Quantité</th>
              <th>État</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="e in equipements" :key="e.id">
              <td>{{ e.unite }}</td>
              <td>{{ e.type }}</td>
              <td>{{ e.quantite }}</td>
              <td>
                <span :class="['badge', e.etat]">{{ e.etat }}</span>
              </td>
              <td class="actions">
                <button @click="declarerReparation(e)">🛠</button>
                <button @click="changerEtat(e)">🔄</button>
                <button @click="marquerManquant(e)">❌</button>
              </td>
            </tr>

            <tr v-if="equipements.length === 0">
              <td colspan="5">Aucun équipement trouvé</td>
            </tr>
          </tbody>
        </table>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import StatCard from "../components/StatCard.vue";
import SidebarPointFocal from "../components/SidebarPointFocal.vue";
import api from "../api/axios";

/* données mockables au début */
const departementNom = ref("Littoral");

const stats = ref({
  total: 0,
  fonctionnels: 0,
  nonFonctionnels: 0,
  enReparation: 0,
  manquants: 0
});

const equipements = ref([]);

function declarerReparation(e) {
  alert(`Déclarer réparation pour ${e.type}`);
}

function changerEtat(e) {
  alert(`Changer l'état de ${e.type}`);
}

function marquerManquant(e) {
  alert(`Marquer manquant : ${e.type}`);
}

async function loadData() {
  // API à adapter plus tard
  const res = await api.get("/dashboard/point-focal").catch(() => null);

  if (res?.data) {
    stats.value = res.data.stats;
    equipements.value = res.data.equipements;
    departementNom.value = res.data.departement;
  }
}

onMounted(loadData);
</script>

<style scoped>
.pf-layout {
  display: flex;
}

.pf-content {
  margin-left: 240px;
  padding: 30px;
  width: 100%;
  background: #f6f7fb;
  min-height: 100vh;
}

.subtitle {
  color: #555;
  margin-bottom: 20px;
}

.stats-row {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 30px;
}

.section {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.btn-export {
  background: #0a5bc4;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 5px;
  cursor: pointer;
}

.table {
  width: 100%;
  border-collapse: collapse;
}

.table th,
.table td {
  border: 1px solid #eee;
  padding: 8px;
}

.actions button {
  margin-right: 6px;
  cursor: pointer;
}

.badge {
  padding: 4px 8px;
  border-radius: 4px;
  color: white;
  font-size: 12px;
}
.fonctionnel { background: green; }
.non-fonctionnel { background: red; }
.en-reparation { background: orange; }
.manquant { background: gray; }
</style>
