<script setup>
import { onMounted, ref } from "vue";
import SidebarAdmin from "../components/SidebarAdmin.vue";
import StatCard from "../components/StatCard.vue";
import api from "../api/axios";

/* ====== STATE ====== */
const stats = ref({
  totalEquipements: 0,
  fonctionnels: 0,
  nonFonctionnels: 0,
  enReparation: 0,
  manquants: 0,
});

const recents = ref([]);
const logs = ref([]);

/* ====== HELPERS ====== */
function formatDate(d) {
  if (!d) return "";
  return new Date(d).toLocaleString();
}

/* ====== DATA LOADING ====== */
async function loadData() {
  try {
    const res = await api.get("/dashboard/admin").catch(() => null);

    if (res?.data) {
      stats.value.totalEquipements = res.data.totalEquipements ?? 0;
      stats.value.fonctionnels = res.data.fonctionnels ?? 0;
      stats.value.nonFonctionnels = res.data.nonFonctionnels ?? 0;
      stats.value.enReparation = res.data.enReparation ?? 0;
      stats.value.manquants = res.data.manquants ?? 0;

      recents.value = res.data.recents ?? [];
      logs.value = res.data.logs ?? [];
    }
  } catch (err) {
    console.error("Erreur dashboard admin :", err);
  }
}

onMounted(loadData);
</script>

<template>
  <div class="admin-layout">
    <!-- SIDEBAR -->
    <SidebarAdmin />

    <!-- CONTENU PRINCIPAL -->
    <main class="admin-content">
      <h1 class="page-title">Tableau de bord Administrateur</h1>

      <!-- STATS -->
      <div class="top-row">
        <StatCard title="Total équipements" :value="stats.totalEquipements" />
        <StatCard title="Fonctionnels" :value="stats.fonctionnels" />
        <StatCard title="Non fonctionnels" :value="stats.nonFonctionnels" />
        <StatCard title="En réparation" :value="stats.enReparation" />
        <StatCard title="Manquants" :value="stats.manquants" />
      </div>

      <!-- TABLE + GRAPH -->
      <section class="middle-row">
        <div class="left">
          <h3>Derniers équipements ajoutés</h3>

          <table class="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Unité</th>
                <th>Type</th>
                <th>Qté</th>
                <th>État</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="e in recents" :key="e.id">
                <td>{{ e.id }}</td>
                <td>{{ e.unite_nom }}</td>
                <td>{{ e.type_nom }}</td>
                <td>{{ e.quantite }}</td>
                <td>{{ e.etat }}</td>
                <td>{{ formatDate(e.date_maj) }}</td>
              </tr>

              <tr v-if="recents.length === 0">
                <td colspan="6">Aucun équipement récent</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="right">
          <h3>Graphiques</h3>
          <div class="chart-placeholder">
            <p>Répartition des états (à venir)</p>
          </div>
        </div>
      </section>

      <!-- LOGS -->
      <section class="bottom-row">
        <h3>Dernières modifications</h3>
        <ul class="logs">
          <li v-for="l in logs" :key="l.id">
            [{{ formatDate(l.date_modif) }}]
            {{ l.user_nom || "Utilisateur" }} :
            {{ l.ancien_etat }} → {{ l.nouveau_etat }}
          </li>

          <li v-if="logs.length === 0">Aucun log</li>
        </ul>
      </section>
    </main>
  </div>
</template>

<style scoped>
/* ===== LAYOUT ===== */
.admin-layout {
  display: flex;
}

.admin-content {
  margin-left: 240px; /* largeur sidebar */
  padding: 30px;
  width: 100%;
  min-height: 100vh;
  background: #f6f7fb;
  box-sizing: border-box;
}

/* ===== TITRE ===== */
.page-title {
  margin-bottom: 20px;
}

/* ===== STATS ===== */
.top-row {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 25px;
}

/* ===== MIDDLE ===== */
.middle-row {
  display: flex;
  gap: 20px;
  margin-bottom: 25px;
}

.middle-row .left {
  flex: 2;
}

.middle-row .right {
  flex: 1;
  min-width: 280px;
}

/* ===== TABLE ===== */
.table {
  width: 100%;
  border-collapse: collapse;
  background: white;
}

.table th,
.table td {
  padding: 8px;
  border: 1px solid #eee;
  text-align: left;
}

/* ===== CHART ===== */
.chart-placeholder {
  height: 240px;
  background: linear-gradient(180deg, #f6f7fb, #fff);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px dashed #ccc;
}

/* ===== LOGS ===== */
.logs {
  list-style: none;
  padding: 0;
}

.logs li {
  padding: 6px 0;
  border-bottom: 1px dashed #ddd;
}
</style>
